// 'use strict';

// avoid global pollution
(function(root, factory) {
  const results = factory();
  for (let key in results) {
    root[key] = results[key];
  }
}(this, function() {
  if (!xhrRequest) {
    throw new Error(`function xhrRequest is needed`);
  }

class Net {
  constructor() {
    this.URL_LIST = {
      login: {
        path: '/api/user/login',
        method: 'post'
      },
      verify_token: {
        path: '/api/user/verifyToken',
        method: 'get'
      }
    }
  }
  async request({path, method}, otherConfig) {


  }
}


}))