(function(root, factory) {
  root.Storage = factory();
}(this, function() {

return class Storage {
  constructor() {}

  /**
   * @parma key: list
   */
  async getData(key) {
    var keyList = key;
    if (!Array.isArray(key)) {
      keyList = [key];
    }
    return new Promise((resolve, reject) =>
      chrome.storage.local.get(keyList, results => {
        if (!Array.isArray(key)) {
          if (results.hasOwnProperty(key)) {
            results = results[key];
          } else {
            results = null;
          }
        }
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve(results)
      })
    )
  }


  async setData(data) {
    return new Promise((resolve, reject) =>
      chrome.storage.local.set(data, () =>
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve()
      )
    )
  }

  async getAllData() {
    return new Promise((resolve, reject) =>
      chrome.storage.local.get(null, results => {
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve(results)
      })
    )
  }

  /**
   * clear storage
   */
  async clear() {
    return new Promise((resolve, reject) =>
      chrome.storage.local.clear(() =>
        chrome.runtime.lastError
          ? reject(Error(chrome.runtime.lastError.message))
          : resolve()
      )
    )
  }
}

}))