import axios from 'axios';
import qs from 'qs';
import Client from './../wallet-api-v2/client/http';
import { base64DecodeFromString, byteArray2hexStr, bytesToString } from './../wallet-api-v2/utils/bytes';
import { Account, Transaction, WitnessList, AssetIssueList } from './../wallet-api-v2/protocol/core/Tron_pb';
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

const client = new Client();

export const ONE_TRX = 1000000;

class ClientWallet {
  constructor(opt = null) {
    this.api = 'https://api.tronscan.org/api';
  }

  // SEND TRANSACTION
  async send({ token, to, amount }) {
    const owner = await this.getPublicKey();
    let transaction = buildTransferTransaction(token, owner, to, amount * ONE_TRX);

    transaction = await client.addRef(transaction);
    const transactionBytes = transaction.serializeBinary();
    const transactionString = byteArray2hexStr(transactionBytes);
    return transactionString;
  }

  getPublicKey = async () => {
    const userAttr = await getUserAttributes();
    return userAttr['custom:publickey'];
  };

  getTransactionDetails = async tx => {
    try {
      const { data: { transaction } } = await axios.post(`${this.api}/transaction?dry-run`, {
        transaction: tx
      })
      return transaction
    } catch (error) {
      throw new Error(error.message || error)
    }
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
    const { data } = await axios.get(`${this.api}/account/${owner}`);
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
    const candidates = data.candidates;
    return { totalVotes, candidates };
  }

  async getEntropy() {
    try {
      const owner = await this.getPublicKey();
      const { data: { entropy } } = await axios.get(`${this.api}/account/${owner}`);
      return entropy;
    } catch (error) {
      throw new Error(error.message);
      console.warn(error);
    }

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
      transaction = await client.addRef(transaction);
      const transactionBytes = transaction.serializeBinary();
      const transactionString = byteArray2hexStr(transactionBytes);
      return transactionString;
    } catch (error) {
      console.log(error);
    }
  }

  async freezeBalance(amount) {
    try {
      const owner = await this.getPublicKey();
      let transaction = buildFreezeBalance(owner, amount * ONE_TRX, 3);
      transaction = await client.addRef(transaction);
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
      transaction = await client.addRef(transaction);
      const transactionBytes = transaction.serializeBinary();
      const transactionString = byteArray2hexStr(transactionBytes);
      return transactionString;
    } catch (error) {
      console.warn(error);
    }
  }
}

export default new ClientWallet();
