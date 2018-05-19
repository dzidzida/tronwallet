import axios from 'axios';
import qs from 'qs';
import ApiClient from './../wallet-api-v2/client/explorer';
import { base64DecodeFromString, byteArray2hexStr, bytesToString } from './../wallet-api-v2/utils/bytes';
import { Account, Transaction } from './../wallet-api-v2/protocol/core/Tron_pb';
import { WitnessList, AssetIssueList } from './../wallet-api-v2/protocol/api/api_pb';
import { stringToBytes } from './../wallet-api-v2/lib/code';
import { getBase58CheckAddress } from './../wallet-api-v2/utils/crypto';
import deserializeTransaction from './../wallet-api-v2/protocol/serializer';
import { getUserAttributes } from '../../services/api';
import {
  buildVote,
  buildTransferTransaction,
  buildFreezeBalance,
  buildUnfreezeBalance,
} from './../wallet-api-v2/utils/transactionBuilder';

const TRON_URL = 'https://tronscan.io';
const explorer = new ApiClient();

export const ONE_TRX = 1000000;

class ClientWallet {
  constructor(opt = null) {
    this.url = opt || TRON_URL;
    this.api = 'https://api.tronscan.org/api';
  }

  // SEND TRANSACTION
  async send({ token, to, amount }) {
    const owner = await this.getPublicKey();
    let transaction = buildTransferTransaction(token, owner, to, amount * ONE_TRX);

    transaction = await explorer.addRef(transaction);
    const transactionBytes = transaction.serializeBinary();
    const transactionString = byteArray2hexStr(transactionBytes);
    return transactionString;
  }

  getPublicKey = async () => {
    const userAttr = await getUserAttributes();
    return userAttr['custom:publickey'];
  };

  getTransactionDetails = async data => {
    let transaction;
    if (typeof data === 'string') {
      const bytesDecode = base64DecodeFromString(data);
      transaction = Transaction.deserializeBinary(bytesDecode);
    } else if (data instanceof Transaction) {
      transaction = data;
    }
    const transactionDetail = deserializeTransaction(transaction);
    return transactionDetail;
  };

  // CREATE TOKEN
  async createToken(form) {
    const from = await this.getPublicKey();
    const body = qs.stringify({
      name: form.tokenName,
      totalSupply: form.totalSupply,
      num: form.tokenAmount * ONE_TRX,
      trxNum: form.trxAmount,
      startTime: Date.parse(form.startTime),
      endTime: Date.parse(form.endTime),
      description: form.description,
      url: form.url,
      ownerAddress: from,
    });
    const { data } = await axios.post(`${this.url}/createAssetIssueToView`, body);
    return data;
  }

  // Get Witnessess
  async getWitnesses() {
    const { data } = await axios.get(`${this.url}/witnessList`);

    const bytesWitnessList = base64DecodeFromString(data);
    const witness = WitnessList.deserializeBinary(bytesWitnessList);
    const witnessList = witness.getWitnessesList();

    return witnessList.map(wtns => {
      return {
        address: getBase58CheckAddress(Array.from(wtns.getAddress())),
        url: wtns.getUrl(),
        latestBlockNumber: wtns.getLatestblocknum(),
        producedTotal: wtns.getTotalproduced(),
        missedTotal: wtns.getTotalmissed(),
        votes: wtns.getVotecount(),
      };
    });
  }

  async getTokensList() {
    const { data } = await axios.get(`${this.url}/getAssetIssueList`);
    const assetIssueListObj = AssetIssueList.deserializeBinary(base64DecodeFromString(data));
    return assetIssueListObj.getAssetissueList().map(asset => {
      return {
        name: bytesToString(asset.getName()),
        ownerAddress: getBase58CheckAddress(Array.from(asset.getOwnerAddress())),
        totalSupply: asset.getTotalSupply(),
        startTime: asset.getStartTime(),
        endTime: asset.getEndTime(),
        description: bytesToString(asset.getDescription()),
        num: asset.getNum(),
        trxNum: asset.getTrxNum(),
        price: asset.getTrxNum() / asset.getNum(),
      };
    });
  }

  async getBalances() {
    const owner = await this.getPublicKey();
    const { data } = await axios.post(
      `${this.url}/queryAccount`,
      qs.stringify({
        address: owner,
      })
    );

    const bytesAccountInfo = base64DecodeFromString(data);
    const accountInfo = Account.deserializeBinary(bytesAccountInfo);
    const assetMap = accountInfo.getAssetMap().toArray();
    const trxBalance = accountInfo.getBalance();
    const trxBalanceNum = trxBalance.toFixed(5);

    const balances = [
      {
        name: 'TRX',
        balance: trxBalanceNum,
      },
    ];

    for (const asset of Object.keys(assetMap)) {
      balances.push({
        name: assetMap[asset][0],
        balance: assetMap[asset][1],
      });
    }

    return balances;
  }

  async participateToken(config) {
    const owner = await this.getPublicKey();
    const body = qs.stringify({
      name: byteArray2hexStr(stringToBytes(config.name)),
      ownerAddress: owner,
      toAddress: config.ownerAddress,
      amount: config.amount * config.trxNum,
    });
    const { data } = await axios.post(`${this.url}/ParticipateAssetIssueToView`, body);
    return data;
  }


  async submitTransaction(tx) {
    const { data } = await axios.post(
      `${this.api}/transaction`,
      { transaction: tx },
    );
    return data;
  }

  async getTransactionList() {
    const owner = await this.getPublicKey();
    const obj = { owner };
    const { data } = await axios.get(
      `${this.api}/transaction?sort=-timestamp&limit=50&address=${owner}`
    );
    obj.transactions = data.data;
    return obj;
  }

  async getFreeze() {
    const owner = await this.getPublicKey();
    const { data: { frozen } } = await axios.get(`${this.api}/account/${owner}/balance`);
    return { ...frozen, total: frozen.total / ONE_TRX };
  }

  async getTotalVotes() {
    const { data } = await axios.get(`${this.api}/vote/current-cycle`);
    const totalVotes = data.total_votes;
    return totalVotes;
  }

  async getEntropy() {
    const owner = await this.getPublicKey();
    const { data: { entropy } } = await axios.get(`${this.api}/account/${owner}`);
    return entropy;
  }

  async getUserVotes() {
    const owner = await this.getPublicKey();
    const { data: { votes } } = await axios.get(`${this.api}/account/${owner}/votes`);
    // console.log('USER VOTES: ', data);
    return votes;
  }

  async voteForWitnesses(votes) {
    try {
      const owner = await this.getPublicKey();
      let transaction = buildVote(owner, votes);
      transaction = await explorer.addRef(transaction);
      const transactionBytes = transaction.serializeBinary();
      const transactionString = byteArray2hexStr(transactionBytes);
      console.warn(transactionString);
      return transactionString;
    } catch (error) {
      console.warn(error);
    }
  }

  async freezeBalance(amount) {
    try {
      const owner = await this.getPublicKey();
      let transaction = buildFreezeBalance(owner, amount * ONE_TRX, 3);
      transaction = await explorer.addRef(transaction);
      const transactionBytes = transaction.serializeBinary();
      const transactionString = byteArray2hexStr(transactionBytes);
      return transactionString;
    } catch (error) {
      console.warn(error);
    }
  }

  async unfreezeBalance() {
    try {
      const owner = await this.getPublicKey();
      let transaction = buildUnfreezeBalance(owner);
      transaction = await explorer.addRef(transaction);
      const transactionBytes = transaction.serializeBinary();
      const transactionString = byteArray2hexStr(transactionBytes);
      return transactionString;
    } catch (error) {
      console.warn(error);
    }
  }
}

export default new ClientWallet();
