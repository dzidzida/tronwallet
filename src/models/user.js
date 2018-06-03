import { query as queryUsers, queryCurrent } from '../services/user';
import Client from '../utils/wallet-service/client';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
    loadingWallet: false,
    walletError: null,
    userWalletData: {
      balance: null,
      balances: [],
      tronAccount: null,
      transactionsData: null,
      totalFreeze: {},
      bandwidth: 0,
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
    *clearCurrent(_, { put }) {
      yield put({ type: 'clearCurrentUser' });
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(queryCurrent);
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
    *fetchWalletData(_, { call, put }) {
      try {
        yield put({
          type: 'dataUserLoading',
          loadingWallet: true,
        });
        const data = yield call(() =>
          Promise.all([
            Client.getBalances(),
            Client.getPublicKey(),
            Client.getTransactionList(),
          ])
        );
        const account = data[0];
        const tronAccount = data[1];
        const transactionsData = data[2];

        const balance = account.balance;
        const balances = account.balances;
        const totalFreeze = account.frozen;
        const bandwidth = account.bandwidth.netRemaining;

        const userWalletData = {
          balance,
          balances,
          tronAccount,
          transactionsData,
          totalFreeze,
          bandwidth,
        };
        yield put({
          type: 'updateDataUser',
          payload: userWalletData,
          loadingWallet: false,
          walletError: null,
        });
      } catch (error) {
        yield put({
          type: 'updateDataUser',
          payload: false,
          loadingWallet: false,
          walletError: 'Data fetching failed',
        });
      }
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
        walletError: action.walletError,
      };
    },
    clearCurrentUser(state) {
      return {
        ...state,
        list: [],
        currentUser: {},
        loadingWallet: false,
        walletError: null,
        userWalletData: {
          balance: null,
          balances: [],
          tronAccount: null,
          transactionsData: null,
          totalFreeze: {},
          bandwidth: 0,
        },
      };
    },
  },
};
