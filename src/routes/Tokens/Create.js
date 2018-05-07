import React from 'react';
import styles from './Create.less';

const Create = () => {
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
                <input className={styles.formControl} type="text" name="tokenName" id="tokenName" />
              </div>
              <div className={styles.formColumn}>
                <h3>Total Supply</h3>
                <input
                  className={styles.formControl}
                  type="number"
                  name="totalSupply"
                  id="totalSupply"
                  placeholder="100000"
                />
                <small className={styles.smallText}>
                  Total amount of tokens which will be in circulation
                </small>
              </div>
            </div>
            <div className={styles.formColumn}>
              <h3>Description</h3>
              <input
                className={styles.formControl}
                type="text"
                name="description"
                id="description"
              />
              <small className={styles.smallText}>
                A short description of the purpose of the token
              </small>
            </div>
            <div className={styles.formColumn}>
              <h3>Url</h3>
              <input
                className={styles.formControl}
                type="text"
                name="url"
                id="url"
                placeholder="http://"
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
            <div className={styles.formRow}>
              <div className={styles.formColumn}>
                <h3>TRX Amount</h3>
                <input
                  className={styles.formControl}
                  type="number"
                  name="trxAmount"
                  id="trxAmount"
                  placeholder="1"
                />
              </div>
              <div className={styles.formColumn}>
                <h3>Token Amount</h3>
                <input
                  className={styles.formControl}
                  type="number"
                  name="tokenAmount"
                  id="tokenAmount"
                  placeholder="1"
                />
              </div>
            </div>
            <p className={styles.descriptionForm}>
              <b>Token Price:</b> 1 Token = 0 TRX
            </p>

            <h1>Participation</h1>
            <p className={styles.descriptionForm}>
              Specify the participation period in which tokens will be issued. During the
              participation period users can exchange TRX for tokens.
            </p>
            <div className={styles.formRow}>
              <div className={styles.formColumn}>
                <h3>Start Date</h3>
                <input className={styles.formControl} type="date" name="startDate" id="startDate" />
              </div>
              <div className={styles.formColumn}>
                <h3>End Date</h3>
                <input className={styles.formControl} type="date" name="endDate" id="endDate" />
              </div>
            </div>

            <div className={styles.checkboxRow}>
              <input type="checkbox" name="confirmed" value="false" />
              <span className={styles.checkboxText}>
                I confirm that creating the total supply of the token costs a one time total fee of
                1024 TRX.
              </span>
            </div>
            <div className={styles.buttonRow}>
              <button className={styles.button}>Issue Token</button>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.cardDescription}>
        <div className={styles.formContent}>
          <p className={styles.description}>
            Issuing a token on the Tron Protocol can be done by anyone who has at least 1024 TRX in
            their account.
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
    </div>
  );
};

export default Create;
