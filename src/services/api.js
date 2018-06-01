import { stringify } from 'qs';
import { Auth } from 'aws-amplify';
import request from '../utils/request';

// framework default apis
export const signIn = async (username, password) => {
  try {
    const user = await Auth.signIn(username, password);
    let totpCode = null;
    if (user.challengeParam.MFAS_CAN_SETUP) {
      totpCode = await Auth.setupTOTP(user);
    }
    return { user, totpCode };
  } catch (err) {
    throw new Error(err.message || err);
  }
};

export const confirmSignIn = async (user, totpCode, code) => {
  if (totpCode) {
    return Auth.verifyTotpToken(user, code);
  }
  return Auth.confirmSignIn(user, code, 'SOFTWARE_TOKEN_MFA');
};

export const signOut = async () => Auth.signOut();

export const signUp = async ({ password, username, email }) => {
  return Auth.signUp({
    username,
    password,
    attributes: {
      email,
    },
    validationData: [],
  });
};

export const confirmSignup = async ({ username, code }) => {
  return Auth.confirmSignUp(username, code);
};

export const changePassword = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const response = await Auth.changePassword(user, 'oldPassword', 'newPassword');
    return response;
  } catch (error) {
    console.log('ChangePassword Error', error);
  }
};

export const forgotPassword = async (email) => {
  return Auth.forgotPassword(email);
};

export const confirmForgotPassword = async (email, code, newPassword) => {
  return Auth.forgotPasswordSubmit(email, code, newPassword);
};

export const setUserPk = async (publickey) => {
  const user = await Auth.currentAuthenticatedUser();
  return Auth.updateUserAttributes(user, {
    'custom:publickey': publickey,
  });
};

export const getUserAttributes = async () => {
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();
    const userAttributes = await Auth.userAttributes(authenticatedUser);
    const user = {};
    for (const attribute of userAttributes) {
      user[attribute.Name] = attribute.Value;
    }
    return user;
  } catch (error) {
    console.log(error);
    if (error.code === 'UserNotFoundException' || error === 'not authenticated') {
      localStorage.clear();
      location.reload();
    }
  }
};

//= ============================================
export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getTronPrice() {
  return request('https://min-api.cryptocompare.com/data/histoday?fsym=TRX&tsym=USD&limit=90&e=CCCAGG&aggregate=1', { credentials: false });
}


export async function getTransactionsForAddress(address) {
  return request(`https://api.tronscan.org/api/transaction?sort=-timestamp&limit=50&address=${address}`, { credentials: false });
}

export async function getVotesForAddress(address) {
  return request(`https://api.tronscan.org/api/vote?sort=-timestamp&limit=50&address=${address}`, { credentials: false });
}
