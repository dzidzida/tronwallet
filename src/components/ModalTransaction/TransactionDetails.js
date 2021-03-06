import React, { Fragment } from 'react';
import moment from 'moment';
import styles from './ModalTransaction.less';

const firstLetterCapitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export default ({ Details }) => {
  const renderContracts = () => {
    const { contracts } = Details;
    if (!contracts) return;
    const contractsElements = [];
    for (const ctr in contracts[0]) {
      if (ctr === 'amount') {
        contractsElements.push(
          <div className={styles.detailRow} key={ctr}>
            <h3 className={styles.detailName}>{firstLetterCapitalize(ctr)}:</h3>
            <h3 className={styles.detailValue}>
              {contracts[0][ctr] / 1000000}
            </h3>
          </div>

        );
      } else if (ctr === 'votes') {
        const totalVotes = contracts[0][ctr].reduce((prev, curr) => {
          return (prev + curr.voteCount);
        }, 0);
        contractsElements.push(
          <div className={styles.detailRow} key="votes">
            <h3 className={styles.detailName}>TotalVotes</h3>
            <h3 className={styles.detailValue}>{totalVotes}</h3>
          </div>
        );
      } else {
        contractsElements.push(
          <div className={styles.detailRow} key={ctr}>
            <h3 className={styles.detailName}>{firstLetterCapitalize(ctr)}:</h3>
            <h3 className={styles.detailValue}>{contracts[0][ctr]}</h3>
          </div>
        );
      }
    }
    contractsElements.push(
      <div className={styles.detailRow} key="time">
        <h3 className={styles.detailName}>Time:</h3>
        <h3 className={styles.detailValue}>{moment(Details.timestamp / 1000000).format('MM/DD/YYYY HH:MM:SS')}</h3>
      </div>
    );
    return contractsElements;
  };
  return (
    <Fragment>
      {renderContracts()}
    </Fragment>
  );
};
