import axios from 'axios';
import qs from 'qs';

const TRON_URL = 'https://tronscan.io';

export const ONE_TRX = 1000000;

class ClientWallet {
  constructor(opt = null) {
    this.url = opt || TRON_URL;
  }

  async send({ from, token, to, amount }) {
    if (token.toUpperCase() === 'TRX') {
      const { data } = await axios.post(
        `${this.url}/sendCoinToView`,
        qs.stringify({
          Address: from,
          toAddress: to,
          Amount: amount,
        })
      );

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

  async createToken(form) {
    const from = '27ScurNWwCY39AmJSv4ymGk9qhzv88oLDr3';
    const { data } = await axios.post(
      `${this.url}/createAssetIssueToView`,
      qs.stringify({
        name: form.name,
        totalSupply: form.totalSupply,
        num: form.num,
        trxNum: form.trxNum,
        startTime: Date.parse(form.startTime),
        endTime: Date.parse(form.endTime),
        description: form.description,
        url: form.url,
        ownerAddress: from,
      })
    );

    return data;
  }

  async voteForWitnesses(votes) {
    const from = '27ScurNWwCY39AmJSv4ymGk9qhzv88oLDr3';
    const { data } = await axios.post(`${this.url}/createVoteWitnessToView`, {
      owner: from,
      list: votes,
    });

    return data;
  }
}

export const Client = new ClientWallet();
