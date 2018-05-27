import { ONE_TRX } from '../../utils/wallet-service/client';

export const formatAmount = (number) => {
  return Number((number / ONE_TRX).toFixed(6)).toLocaleString();
};

