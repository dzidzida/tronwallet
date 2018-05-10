import { stringify } from 'qs';
import { Auth } from 'aws-amplify';
import request from '../utils/request';

export const signIn = async (email, password) => {
  try {
    const user = await Auth.signIn(email, password);
    let totpCode = null;
    if (user.challengeParam.MFAS_CAN_SETUP) {
      totpCode = await Auth.setupTOTP(user);
    }
    return { user, totpCode };

  } catch (err) {
    throw new Error(err.message || err);
  }
}

export const confirmSignIn = async (user, totpCode, code) => (
  totpCode ? Auth.verifyTotpToken(user, code) : Auth.confirmSignIn(user, code, 'SOFTWARE_TOKEN_MFA')
) ;


export const signOut = async () => Auth.signOut();

// framework default apis
export const signUp = async ({ password, email }) => {
  return Auth.signUp({
    username: email,
    password,
    attributes: {
      email,
    },
    validationData: [],
  });
};

export const changePassword = async () => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const response = await Auth.changePassword(user, 'oldPassword', 'newPassword');
    return response;
  } catch (error) {
    console.log('ChangePassword ERror', error);
  }
};

export const confirmSignup = async ({ email, code }) => {
  return Auth.confirmSignUp(email, code);
};

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
