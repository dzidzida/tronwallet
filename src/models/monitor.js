import { queryTags } from '../services/api';

export default {
  namespace: 'monitor',

  state: {
    tags: [],
    isResultVisible: false,
    isPkVisible: false,
    transaction: {},
    pkFromQrCode: null,
  },

  effects: {
    *fetchTags(_, { call, put }) {
      const response = yield call(queryTags);
      yield put({
        type: 'saveTags',
        payload: response.list,
      });
    },
    *changeModalResult({ payload }, { put }) {
      yield put({
        type: 'setResultVisible',
        visible: payload.visible,
        transaction: payload.transaction,
      });
    },
    *changeModalPk({ payload }, { put }) {
      yield put({
        type: 'setPkVibible',
        visible: payload.visible,
        pk: payload.pk || null,
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
    setPkVibible(state, action) {
      return {
        ...state,
        isPkVisible: action.visible,
        pkFromQrCode: action.pk || '',
      };
    },
  },
};
