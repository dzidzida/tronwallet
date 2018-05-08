import { stringify } from 'qs';
import { Auth } from 'aws-amplify';
import request from '../utils/request';

// our APIS
export const signIn = async params => {
  const { username, password } = params;
  try {
    const user = await Auth.signIn(username, password);
    return { status: 'ok', user };
  } catch (err) {
    return {
      status: 'error',
      currentAuthority: 'guest',
      type: 'account',
      message: err.message,
    };
  }
};

// export const confirmSignIn = async params => {
//   const { user, code } = params;
//   const mfaType = 'test';
//   try {
//     const response = Auth.confirmSignIn(user, code, mfaType);
//   } catch (error) {
//     console.log('asudhasuid', error);
//   }
// };

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
