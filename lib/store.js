import { atomWithStorage } from 'jotai/utils';
import { atom } from 'jotai';

// 模型配置列表
export const modelConfigListAtom = atomWithStorage('modelConfigList', []);
export const selectedModelInfoAtom = atomWithStorage('selectedModelInfo', {});

// 自定义 sessionStorage 存储对象
const sessionStorageStorage = {
  getItem: (key, initialValue) => {
    if (typeof window !== 'undefined') {
      try {
        const storedValue = sessionStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : initialValue;
      } catch (error) {
        console.error(`Error reading sessionStorage key "${key}":`, error);
        return initialValue;
      }
    }
    return initialValue;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting sessionStorage key "${key}":`, error);
      }
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing sessionStorage key "${key}":`, error);
      }
    }
  },
};

// 登录状态管理 - 使用 sessionStorage
export const loginStateAtom = atomWithStorage(
  'loginState',
  {
    isLoggedIn: false,
    username: '',
  },
  sessionStorageStorage
);