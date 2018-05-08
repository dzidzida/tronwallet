import { routerRedux } from 'dva/router';
import { signIn, signOut } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(signIn, payload);
      if (response.status === 'ok') {
        yield put({
          type: 'changeUserToSign',
          payload: response,
        });
        yield put(routerRedux.push('/user/confirmlogin'));
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: response,
        });
      }
    },
    // *confirmlogin({ payload }, { call, put }) {
    //   // TODO
    //   // const response = yield call(confirmSignIn, payload);
    //   yield put({
    //     type: 'changeLoginStatus',
    //     payload: { status: 'ok', currentAuthority: 'user' },
    //   });
    //   // Login successfully
    //   // if (response.status === 'ok') {
    //   reloadAuthorized();
    //   yield put(routerRedux.push('/dashboard'));
    //   // }
    // },
    *logout(_, { put, select }) {
      try {
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select(state => state.routing.location.pathname);
        yield signOut();
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
  },

  reducers: {
    changeUserToSign(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        user: payload.user,
      };
    },
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        error: payload.message,
      };
    },
  },
};
