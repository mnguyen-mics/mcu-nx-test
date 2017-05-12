import LocalStorage from './LocalStorage';

const ID_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

const getToken = () => {
  return LocalStorage.getItem(ID_TOKEN);
};

const getRefreshToken = () => {
  return LocalStorage.getItem(REFRESH_TOKEN);
};

const setToken = (token) => {
  LocalStorage.setItem({
    [ID_TOKEN]: token
  });
};

const setRefreshToken = (refreshToken) => {
  LocalStorage.setItem({
    [REFRESH_TOKEN]: refreshToken
  });
};


export default {
  getToken,
  getRefreshToken,
  setToken,
  setRefreshToken
};
