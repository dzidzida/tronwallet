import { stringify } from 'qs';
import { Auth } from 'aws-amplify';
import request from '../utils/request';

// window.LOG_LEVEL = 'DEBUG'
// our APIS
export const signIn = async params => {
  const { username, password } = params;
  try {
    const user = await Auth.signIn(username, password);
    // const user = await Auth.signIn('bertao@getty.io', '200194Pedr@');
    // const confirm = await Auth.confirmSignIn(user, '828140','SOFTWARE_TOKEN_MFA');
    const totpCode = await Auth.setupTOTP(user);
    return { status: 'ok', user, totpCode };
  } catch (err) {
    console.log('Error', err);
    return {
      status: 'error',
      currentAuthority: 'guest',
      type: 'account',
      message: err.message,
    };
  }
};

export const confirmSignIn = async params => {
  const { user, code } = params;
  try {
    // const verifyTotp = await Auth.verifyTotpToken(user, code, '');
    // console.log("Foi verificado", verifyTotp);
    // const confirming = await Auth.confirmSignIn(user);
    const verifying = await Auth.verifyTotpToken(user, code);
    console.log('Eu acho que foi verificado corretamente! ', verifying);
    return { status: 'ok' };
  } catch (error) {
    console.log('Error no confirmSign In', error);
    return {
      status: 'error',
      currentAuthority: 'guest',
      type: 'account',
      message: error.message,
    };
  }
};

export const confirmSignUp = async params => {
  const { username, code } = params;
  try {
    await Auth.confirmSignUp(username, code);

    return { status: 'ok' };
  } catch (error) {
    console.log('Error no confirmSign In', error);
  }
};

export const signOut = async () => Auth.signOut();

export async function changePassword() {
  try {
    const user = await Auth.currentAuthenticatedUser();
    const response = await Auth.changePassword(user, 'oldPassword', 'newPassword');
    return response;
  } catch (error) {
    console.log('ChangePassword ERror', error);
  }
}

// framework default apis
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
