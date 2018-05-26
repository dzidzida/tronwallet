import React, { PureComponent } from 'react';
import styles from './Create.less';
import Client from '../../utils/wallet-service/client';
import ModalTransaction from '../../components/ModalTransaction/ModalTransaction';

class Create extends PureComponent {
  state = {
    modalVisible: false,
    transactionData: null,
    form: {
      name: '',
      totalSupply: 0,
      description: '',
      url: '',
      trxNum: 1,
      num: 1,
      startTime: '',
      endTime: '',
      freezeAmount: 0,
      freezeDays: 1,
      acceptTerms: false,
    },
    createError: null,
  };

  onCloseModal = () => {
    this.setState({ modalVisible: false });
  };
  change = (e) => {
    const { name, value, checked } = e.target;
    this.setState({
      form: {
        ...this.state.form,
        [name]: name === 'acceptTerms' ? checked : value,
      },
    });
  };

  submit = async (e) => {
    e.preventDefault();
    const { form } = this.state;
    try {
      const transactionData = await Client.createToken(form);
      this.setState({ modalVisible: true, transactionData });
    } catch (error) {
      this.setState({ createError: 'Something wrong while creating Token' });
    }
  };

  render() {
    const {
      name,
      totalSupply,
      url,
      trxNum,
      num,
      startTime,
      endTime,
      acceptTerms,
    } = this.state.form;
    const {
      modalVisible,
      transactionData,
      createError } = this.state;

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
                  <h3>Token Name *</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  <h3>Total Supply *</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="totalSupply"
                    id="totalSupply"
                    placeholder="100000"
                    min={0}
                    required
                  />
                  <small className={styles.smallText}>
                    Total amount of tokens which will be in circulation
                  </small>
                </div>
              </div>
              <div className={styles.formColumn}>
                <h3>Description *</h3>
                <input
                  onChange={this.change}
                  className={styles.formControl}
                  type="text"
                  name="description"
                  id="description"
                  required
                />
                <small className={styles.smallText}>
                  A short description of the purpose of the token
                </small>
              </div>
              <div className={styles.formColumn}>
                <h3>Url*</h3>
                <input
                  onChange={this.change}
                  className={styles.formControl}
                  type="text"
                  name="url"
                  id="url"
                  placeholder="http://"
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
                  {num} {name || 'Token'}
                </b>{' '}
                for every <b>{trxNum} TRX</b>.
              </p>
              <div className={styles.formRow}>
                <div className={styles.formColumn}>
                  <h3>TRX Amount *</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="trxNum"
                    id="trxNum"
                    placeholder="1"
                    min={1}
                    required
                  />
                </div>
                <div className={styles.formColumn}>
                  <h3>Token Amount *</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="num"
                    id="num"
                    placeholder="1"
                    min={1}
                    required
                  />
                </div>
              </div>
              <p className={styles.descriptionForm}>
                <b>Token Price:</b> 1 {name || 'Token'} = {trxNum / num} TRX
              </p>
              <h1>Frozen Supply</h1>
              <p className={styles.descriptionForm}>
                A part of the supply can be frozen. The amount of supply can be specified 
                and must be frozen for a minimum of 1 day. The frozen supply can manually 
                be unfrozen after start date + frozen days has been reached. 
                Freezing supply is not required.
              </p>
              <div className={styles.formRow}>
                <div className={styles.formColumn} style={{ flex: 0.7 }}>
                  <h3>Amount</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="freezeAmount"
                    id="freezeAmount"
                    placeholder="0"
                    min={0}
                    required
                  />
                </div>
                <div className={styles.formColumn} style={{ flex: 0.3 }}>
                  <h3>Days to Freeze</h3>
                  <input
                    onChange={this.change}
                    className={styles.formControl}
                    type="number"
                    name="freezeDays"
                    id="freezeDays"
                    placeholder="1"
                    min={1}
                    required
                  />
                </div>
              </div>
              <h1>Participation *</h1>
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
                    max="9999-12-31T23:59"
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
          message="Please, validate your transaction"
          onSuccess="Token created successfully"
          data={transactionData}
          visible={modalVisible}
          onClose={this.onCloseModal}
          txDetails={{
            TokenName: name,
            TotalSupply: totalSupply,
            Type: 'CREATE',
            TokenValue: `${trxNum / num}TRX`,
            Start: startTime,
            End: endTime,
            URL: url,
          }}
        />
      </div>
    );
  }
}

export default Create;
