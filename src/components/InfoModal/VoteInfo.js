import React from 'react';
import { Modal } from 'antd';
import style from './style.less';

const VoteInfo = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title="Votes"
      style={{ top: 20 }}
      footer={[]}
      width={700}
    >
      <h3>
        Guidelines for Super Representative application
      </h3>
      <p className={style.justify}>
        All willing users can apply to become Super Representatives, but to prevent\
        malicious attacks, we have set up a threshold for admittance—to run for
        Super Representative, 9,999 TRX in the applicants’ account will be burnt.
        After successful application, users can run for Super Representatives.
      </p>
      <h3>
        Super Representative Election
      </h3>
      <p className={style.justify}>
        Every account in TRON’s network is entitled to vote for the Super
        Representatives they support. Voting requires TP, which is determined by
        users’ current amount of frozen balance.
      </p>
      <p className={style.justify}>Calculation of TP: 1 TP for 1 frozen TRX</p>
      <p className={style.justify}>
        Once you unfreeze your balance, an equivalent amount of TP is also lost,
        meaning that previous votes casted may no longer be valid. You can
        refreeze your balance to regain validity of votes.
      </p>
      <p className={style.justify}>
        Note: TRON network only keeps record of the latest votes, meaning that
        every new allocation of votes you make will replace all previous
        records.
      </p>
      <ul>
        <li className={style.justify}>
          e.g.
          <p style={{ backgroundColor: '#FAFAFA', fontFamily: 'monospace' }}>
            freezebalance password 10_000_000 3// 10 bandwidths for 10 frozen
            TRX
            <br />
            freezebalance password 10_000_000 3// 10 bandwidths for 10 frozen
            TRX
            <br />
            votewitness password witness1 4 witness2 6//4 votes for witness1 and
            6 votes for witness2
            <br />
            vote witness password witness1 3 witness 2 7// 3 votes for witness1
            and 7 votes for witness 2
          </p>
        </li>
      </ul>
      <p className={style.justify}>
        The final result of the above commands is 3 votes for witness1 and 7
        votes for witness2.
      </p>
    </Modal>
  );
};

export default VoteInfo;
