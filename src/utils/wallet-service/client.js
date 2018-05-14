import axios from 'axios';
import qs from 'qs';
// import { buildApplyForDelegate } from "./utils/transaction";
// const longToByteArray = require("./utils/bytes").longToByteArray;
// const hexStr2byteArray = require("./lib/code").hexStr2byteArray;
import { base64DecodeFromString, byteArray2hexStr, bytesToString } from './utils/bytes';
import { Account, Transaction } from './protocol/core/Tron_pb';
import { WitnessList, AssetIssueList } from './protocol/api/api_pb';
import { stringToBytes } from './lib/code';
import { getBase58CheckAddress } from './utils/crypto';
import deserializeTransaction from './protocol/serializer';
import { getUserAttributes } from '../../services/api';

const TRON_URL = 'https://tronscan.io';

export const ONE_TRX = 1000000;

class ClientWallet {
  constructor(opt = null) {
    this.url = opt || TRON_URL;
    this.api = 'https://api.tronscan.org/api'
  }

  // SEND TRANSACTION
  async send({ token, to, amount }) {
    const from = await this.getPublicKey();
    if (token.toUpperCase() === 'TRX') {
      const { data } = await axios.post(
        `${this.url}/sendCoinToView`,
        qs.stringify({
          Address: from,
          toAddress: to,
          Amount: amount * ONE_TRX,
        })
      );

      await this.getTransactionDetails(data);
      return data;
    } else {
      const { data } = await axios.post(
        `${this.url}/TransferAssetToView`,
        qs.stringify({
          assetName: token,
          Address: from,
          toAddress: to,
          Amount: amount,
        })
      );
      return data;
    }
  }

  getPublicKey = async () => {
    const userAttr = await getUserAttributes();
    return userAttr['custom:publickey'];
  }

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

  async voteForWitnesses(votes) {
    const owner = await this.getPublicKey();
    const { data } = await axios.post(`${this.url}/createVoteWitnessToView`, {
      owner,
      list: votes,
    });
    await this.getTransactionDetails(data);
    return data;
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
    const trxBalanceNum = (trxBalance / ONE_TRX).toFixed(6);

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
    const { data } = await axios.post(`${this.url}/transactionFromView`, qs.stringify({
      transactionData: tx,
    }));

    return data;
  }

  async getTransactionList () {
    const owner = await this.getPublicKey();
    const obj = { owner };
    const { data } = await axios.get(`${this.api}/transaction?sort=-timestamp&limit=50&address=${owner}`);
    obj.transactions = data.data;
    return obj;
  }

  async getFreeze() {
    const owner = await this.getPublicKey();
    const obj = { owner };
    const { data } = await axios.get(`${this.api}/account/${owner}/balance`);
    obj.data = data;
    return obj;
  }
}

export default new ClientWallet();
