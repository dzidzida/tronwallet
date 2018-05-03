import { isUrl } from '../utils/utils';

const menuData = [
  {
    name: 'dashboard',
    icon: 'dashboard',
    path: 'dashboard',
    children: [],
  },
  {
    name: 'account',
    icon: 'user',
    path: 'account',
    children: [],
  },
  {
    name: 'send',
    icon: 'form',
    path: 'send',
    children: [],
  },
  {
    name: 'receive',
    icon: 'form',
    path: 'receive',
    children: [],
  },
  {
    name: 'tokens',
    icon: 'form',
    path: 'tokens',
    children: [],
  },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
