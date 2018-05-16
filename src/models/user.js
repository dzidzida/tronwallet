import { query as queryUsers, queryCurrent } from '../services/user';
import Client from '../utils/wallet-service/client';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    loadingWallet: true,
    userWalletData: {
      balance: null,
      balances: [],
      tronAccount: null,
      transactionsData: null,
      totalFreeze: {},
    },
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchWalletData(_, { call, put }) {
      yield put({
        type: 'dataUserLoading',
        loadingWallet: true,
      });
      const data = yield call(() =>
        Promise.all([
          Client.getBalances(),
          Client.getPublicKey(),
          Client.getTransactionList(),
          Client.getFreeze(),
        ])
      );

      const balances = data[0];
      const tronAccount = data[1];
      const { balance } = balances.find(b => b.name === 'TRX');
      const transactionsData = data[2];
      const frozen = data[3];

      const userWalletData = {
        balance,
        balances,
        tronAccount,
        transactionsData,
        totalFreeze: frozen,
      };
      yield put({
        type: 'updateDataUser',
        payload: userWalletData,
        loadingWallet: false,
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
    dataUserLoading(state, action) {
      return {
        ...state,
        loadingWallet: action.loadingWallet,
      };
    },
    updateDataUser(state, action) {
      return {
        ...state,
        userWalletData: action.payload,
        loadingWallet: action.loadingWallet,
      };
    },
  },
};
