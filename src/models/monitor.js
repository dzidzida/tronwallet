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
