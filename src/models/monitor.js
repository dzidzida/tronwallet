import { queryTags } from '../services/api';

export default {
  namespace: 'monitor',

  state: {
    tags: [],
    isResultVisible: false,
    transaction: {},
  },

  effects: {
    *fetchTags(_, { call, put }) {
      const response = yield call(queryTags);
      yield put({
        type: 'saveTags',
        payload: response.list,
      });
    },
    // *openSocket(_, { call, put }) {
    //   const pk = yield call(Client.getPublicKey);
    //   const socket = openSocket(URL_SOCKET);
    //   socket.on('payback', data => {
    //     console.log("SocketPK", pk);
    //     if (data.uuid === pk) {
    //       put({
    //         type: 'setResultVisible',
    //  payload: { visible: true, transaction: { ...data.transaction, result: data.succeeded } },
    //       });
    //     }
    //   });
    // },
    *changeModalResult({ payload }, { put }) {
      yield put({
        type: 'setResultVisible',
        visible: payload.visible,
        transaction: payload.transaction,
      });
    },
  },

  reducers: {
    saveTags(state, action) {
      return {
        ...state,
        tags: action.payload,
      };
    },
    setResultVisible(state, action) {
      return {
        ...state,
        isResultVisible: action.visible,
        transaction: action.transaction,
      };
    },
  },
};
