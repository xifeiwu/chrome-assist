// 'use strict';

// avoid global pollution
(function(root, factory) {
  root.Net = factory();
}(this, function() {
  if (!utils || !xhrRequest) {
    throw new Error(`function xhrRequest is needed`);
  }

class Net {
  constructor(origin) {
    const URL_LIST = {
      login: {
        path: '/api/user/login',
        method: 'post'
      },
      verify_token: {
        path: '/api/user/verifyToken',
        method: 'get'
      },
      bookmark_force_update: {
        path: '/api/bookmark/forceUpdate',
        method: 'post'
      }
    }
    Object.keys(URL_LIST).forEach(key => {
      const value = URL_LIST[key];
      value.path = `${origin}${value.path}`;
    });
    this.URL_LIST = URL_LIST;
  }
  async request({path, method}, otherConfig) {
     return await xhrRequest(utils.deepMerge({
       path, method
     }, otherConfig));
  }
  async requestData({path, method}, otherConfig) {
     const response =  await xhrRequest(utils.deepMerge({
       path, method
     }, otherConfig));
     return response.data;
  }
}

return Net;

}))