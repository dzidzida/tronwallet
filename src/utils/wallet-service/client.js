import axios from 'axios';
import qs from 'qs';
import { Auth } from 'aws-amplify';

const TRON_URL = 'https://tronscan.io';

export const ONE_TRX = 1000000;

class ClientWallet {
  constructor(opt = null) {
    this.url = opt || TRON_URL;
    this.user = {};
    this.setUser();
  }

  async setUser() {
    // For now just update for dummy data;
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    // const updateUser = await Auth.updateUserAttributes(authenticatedUser, {
    //   address: '27cmix5pFFCGukK97kxB7oPoBvxGx1hLdVr',
    // });
    const userAttributes = await Auth.userAttributes(authenticatedUser);

    for (const attribute of userAttributes) {
      this.user[attribute.Name] = attribute.Value;
    }
  }

  // SEND TRANSACTION
  async send({ token, to, amount }) {
    const from = this.user.address;
    if (token.toUpperCase() === 'TRX') {
      const { data } = await axios.post(
        `${this.url}/sendCoinToView`,
        qs.stringify({
          Address: from,
          toAddress: to,
          Amount: amount * ONE_TRX,
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

  // CREATE TOKEN
  async createToken(form) {
    const from = this.user.address;
    const body = qs.stringify({
      name: form.tokenName,
      totalSupply: form.totalSupply,
      num: form.tokenAmount * ONE_TRX,
      trxNum: form.trxAmount,
      startTime: Date.parse(form.startDate),
      endTime: Date.parse(form.endDate),
      description: form.description,
      url: form.url,
      ownerAddress: from,
    });
    const { data } = await axios.post(`${this.url}/createAssetIssueToView`, body);
    return data;
  }

  // SUBMIT A VOTE
  async voteForWitnesses(votes) {
    const from = '27ScurNWwCY39AmJSv4ymGk9qhzv88oLDr3';
    const { data } = await axios.post(`${this.url}/createVoteWitnessToView`, {
      owner: from,
      list: votes,
    });

    return data;
  }
}

export default new ClientWallet();
