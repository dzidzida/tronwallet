import React, { PureComponent } from 'react';
import styles from './Create.less';
import Client from '../../utils/wallet-service/client';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

class Create extends PureComponent {
  state = {
    modalVisible: false,
    tokenName: 'GettyTest',
    totalSupply: 100000,
    description: 'Test for getty',
    url: 'https//getty.io',
    trxAmount: 1,
    tokenAmount: 1,
    // startDate: '', //Eslint reclamando
    // endDate: '',
    acceptTerms: false,
    createError: null,
    transaction: {
      data: null,
    },
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };
  change = e => {
    const { name, value, checked } = e.target;
    this.setState({
      [name]: name === 'acceptTerms' ? checked : value,
    });
  };

  submit = async e => {
    e.preventDefault();
    const form = this.state;
    const { transaction } = this.state;
    try {
      const TransactionData = await Client.createToken(form);
      if (!TransactionData) {
        throw Error();
      } else {
        this.setState({
          modalVisible: true,
          transaction: { ...transaction, data: TransactionData },
        });
      }
      // TODO
      // Now do something
    } catch (error) {
      this.setState({ createError: 'Something wrong while creating Token' });
    }
  };

  render() {
    const {
      tokenName,
      totalSupply,
      description,
      url,
      trxAmount,
      tokenAmount,
      acceptTerms,
      createError,
    } = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardHeaderTitle}>Issue a Token</h2>
          </div>
          <div className={styles.formContent}>
            <form className={styles.form}>
              <h1>Details</h1>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h3>Token Name</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="text"
                    name="tokenName"
                    id="tokenName"
                    value={tokenName}
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  <h3>Total Supply</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="totalSupply"
                    id="totalSupply"
                    placeholder="100000"
                    value={totalSupply}
                    min="0"
                    required
                  />
                  <small className={styles.smallText}>
                    Total amount of tokens which will be in circulation
                  </small>
                </div>
              </div>
              <div className={styles.formColumn}>
                <h3>Description</h3>
                <input
                  onChange={this.change}
                  className={styles.formControl}
                  type="text"
                  name="description"
                  id="description"
                  value={description}
                  required
                />
                <small className={styles.smallText}>
                  A short description of the purpose of the token
                </small>
              </div>
              <div className={styles.formColumn}>
                <h3>Url</h3>
                <input
                  onChange={this.change}
                  className={styles.formControl}
                  type="text"
                  name="url"
                  id="url"
                  placeholder="http://"
                  value={url}
                  required
                />
                <small className={styles.smallText}>
                  A website where users can find more information about the token
                </small>
              </div>

              <h1>Exchange Rate</h1>
              <p className={styles.descriptionForm}>
                Specify the price of a single token by defining how many tokens a participant will
                receive for every TRX they spend.
              </p>
              <p className={styles.descriptionForm}>
                Participants will receive{' '}
                <b>
                  {tokenAmount} {tokenName || 'Token'}
                </b>{' '}
                for every <b>{trxAmount} TRX</b>.
              </p>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h3>TRX Amount</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="trxAmount"
                    id="trxAmount"
                    placeholder="1"
                    value={trxAmount}
                    min="0"
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  <h3>Token Amount</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="tokenAmount"
                    id="tokenAmount"
                    placeholder="1"
                    value={tokenAmount}
                    min="0"
                    required
                  />
                </div>
              </div>
              <p className={styles.descriptionForm}>
                <b>Token Price:</b> 1 {tokenName || 'Token'} = {trxAmount / tokenAmount} TRX
              </p>

              <h1>Participation</h1>
              <p className={styles.descriptionForm}>
                Specify the participation period in which tokens will be issued. During the
                participation period users can exchange TRX for tokens.
              </p>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h3>Start Date</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="date"
                    name="startTime"
                    id="startTime"
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  <h3>End Date</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="date"
                    name="endTime"
                    id="endTime"
                    required
                  />
                </div>
              </div>

              <div className={styles.checkboxRow}>
                <input
                  onChange={this.change}
                  type="checkbox"
                  name="acceptTerms"
                  value={acceptTerms}
                />
                <span className={styles.checkboxText}>
                  I confirm that creating the total supply of the token costs a one time total fee
                  of 1024 TRX.
                </span>
              </div>
              <div className={styles.buttonRow}>
                <button
                  onClick={this.submit}
                  className={acceptTerms ? styles.button : styles.buttonDisabled}
                  type="submit"
                  disabled={!acceptTerms}
                >
                  Issue Token
                </button>
              </div>
              <h3 className={styles.error}>{createError}</h3>
            </form>
          </div>
        </div>
        <div className={styles.cardDescription}>
          <div className={styles.formContent}>
            <p className={styles.description}>
              Issuing a token on the Tron Protocol can be done by anyone who has at least 1024 TRX
              in their account.
            </p>
            <p className={styles.description}>
              When a token is issued it will be shown on the token overview page. Users can then
              participate within the participation period and exchange their TRX for tokens.
            </p>
            <p className={styles.description}>
              After issuing the token your account will receive the amount of tokens equal to the
              total supply. When other users exchange their TRX for tokens then the tokens will be
              withdrawn from your account and you will receive TRX equal to the specified exchange
              rate.
            </p>
          </div>
        </div>
        <ModalTransaction
          title="Create Token"
          message="Token created successfully!"
          data={this.state.transaction.data}
          visible={this.state.modalVisible}
          onClose={this.onCloseModal}
        />
      </div>
    );
  }
}

export default Create;
