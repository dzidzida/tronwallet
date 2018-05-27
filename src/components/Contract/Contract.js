import React from 'react';
import Vote from './Vote';
import Transfer from './Transfer';
import Freeze from './Freeze';
import Participate from './Participate';
import Create from './Create';
import Unfreeze from './Unfreeze';
import TransactionDefault from './TransactionDefault';

export default ({ transaction }) => {
  // AccountCreateContract = 0;

  //   TransferContract = 1;

  //   TransferAssetContract = 2;

  //   VoteAssetContract = 3;

  //   VoteWitnessContract = 4;

  //   WitnessCreateContract = 5;

  //   AssetIssueContract = 6;

  //   DeployContract = 7;

  //   WitnessUpdateContract = 8;

  //   ParticipateAssetIssueContract = 9

  switch (transaction.contractType) {
    case 1: return <Transfer transaction={transaction} />;
    case 4: return <Vote transaction={transaction} />;
    case 6: return <Create transaction={transaction} />;
    case 9: return <Participate transaction={transaction} />;
    case 11: return <Freeze transaction={transaction} />;
    case 12: return <Unfreeze transaction={transaction} />;
    default: return <TransactionDefault transaction={transaction} />;
  }
};
