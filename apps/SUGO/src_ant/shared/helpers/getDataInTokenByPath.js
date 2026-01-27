
export const getDataInTokenByPath = (path) => {
    const urlSplitted = path.split('=')
    // console.log({urlSplitted});
    const token = urlSplitted[1];
    const idApp = urlSplitted[2]
    // console.log({token, idApp});

    const parseJwt = (token) => {
      var base64Url = token.split('.')[1];
      var base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    };
    return {...parseJwt(token), idApp, token};
}