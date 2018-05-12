import { Auth } from 'aws-amplify';

export async function query() {
  return {};
}

export async function queryCurrent() {
  return Auth.currentAuthenticatedUser();
}
