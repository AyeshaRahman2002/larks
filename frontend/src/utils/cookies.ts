interface cookieItem {
  expires?: number,
  path?: string,
}
const setCookie = (name: string, value: string, param: cookieItem = { expires: 0, path: '' }) => {
  let expires = '';
  let path = '/';
  if (param) {
    if (param.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (param.expires * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    if (param.path) {
      path = param.path;
    }
  }
  document.cookie = `${name}=${value}${expires}; path=${path}`;
};

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts: any = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const delCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
};

export {
  setCookie,
  getCookie,
  delCookie,
};
