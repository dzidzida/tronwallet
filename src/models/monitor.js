import { queryTags } from '../services/api';

export default {
  namespace: 'monitor',

  state: {
    tags: [],
    isResultVisible: false,
    canOpen: false,
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
        result: payload.result,
      });
    },
    *canModalResultOpen({ payload }, { put }) {
      yield put({
        type: 'setCanOpenModal',
        canOpen: payload,
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
        transactionResult: action.result,
      };
    },
    setCanOpenModal(state, action) {
      return {
        ...state,
        canOpen: action.canOpen,
      };
    },
  },
};
