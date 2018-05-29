import React from 'react';
import { Modal } from 'antd';
import style from './style.less';

const FreezeInfo = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      onCancel={onClose}
      title="Freezing/unfreezing balance"
      style={{ top: 20 }}
      footer={[]}
      width={700}
    >
      <h3>Why tokens are frozen?</h3>
      <p className={style.justify}>
        The balance freezing mechanism is set up out of two considerations:
      </p>
      <ul>
        <li className={style.justify}>
          To prevent malicious spam transactions from clogging the network and
          causing delayed transaction confirmation.
        </li>
        <li className={style.justify}>To prevent malicious voting.</li>
      </ul>
      <h3>Freeze/unfreeze mechanism</h3>
      <p className={style.justify}>
        Once the balance is frozen, the user will receive a proportionate amount
        of TRON Power(TP) and bandwidth points. TRON Power(TP) represents voting
        power whereas bandwidth points is used to pay for transactions. Their
        usage and means of calculation will be introduced in following sections.
      </p>
      <p className={style.justify}>
        Frozen assets are held in your frozen account and cannot be used for
        trading.
      </p>
      <p className={style.justify}>
        The fixed frozen duration is 3 days, after which you can unfreeze your
        balance any time you like manually. Balance unfrozen will be transferred
        back into your current account.
      </p>
      <p className={style.justify}>
        More TP and Entropies can be obtained by freezing more balance. The
        balance can be unfrozen after 3 days from the latest freezing.
      </p>
      <ul>
        <li className={style.justify}>
          The freezing command is as follows:
          <p style={{ backgroundColor: '#FAFAFA', fontFamily: 'monospace' }}>
            freezebalance password amount time <br />
            amount: the unit of frozen balance is sun. The minimum balance
            frozen is 1,000,000 sun, or 1 TRX. <br />
            time: frozen duration lasting from date of freeze and date to
            unfreeze is 3 days.
          </p>
        </li>
      </ul>
      <ul>
        <li className={style.justify}>
          e.g.
          <p style={{ backgroundColor: '#FAFAFA', fontFamily: 'monospace' }}>
            freezebalance password 10_000_000 3
          </p>
        </li>
      </ul>
      <ul>
        <li className={style.justify}>
          Unfreezing command:
          <p style={{ backgroundColor: '#FAFAFA', fontFamily: 'monospace' }}>
            unfreezebalance password
          </p>
        </li>
      </ul>
      <h3>Block-production reward for Super Representatives</h3>
      <p className={style.justify}>
        Each time a Super Representative finishes block production, reward will
        be sent to the subaccount in the superledger. Super Representatives can
        check but not directly make use of this asset. A withdrawal can be made
        once every 24 hours, transferring the reward from the subaccount to the
        Super Representative’s account.
      </p>
    </Modal>
  );
};

export default FreezeInfo;
