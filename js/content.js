
const host = location.host;

class Helper {
  constructor() {
    this.tabId = null;
    this.tab = null;
    this.onListen();

    const longConnection = false;
    longConnection && this.longConnection();

    const heartBeat = false;
    heartBeat && this._heartBeat();
  }

  /**
   * sendMessage to chrome.runtime
   * @param {obj}, object with format: {action, data}
   * @return {response}, response from chrome.runtime
   */
  async _sendMessage(obj) {
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(obj, response => {
          chrome.runtime.lastError
            ? reject(Error(chrome.runtime.lastError.message))
            : resolve(response)
        });
      });
      return response;
    } catch (err) {
      console.log(err);
    }
  }

  onListen() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      const action = request.action;
      var requestData = request.data;
      switch (action) {
        case 'ping':
          if (!request.data) {
            sendResponse(null);
            return;
          }
          this.tab = requestData.hasOwnProperty('tab') ? requestData['tab'] : null;
          this.tabId = requestData.hasOwnProperty('tabId') ? requestData['tabId'] : null;
          sendResponse({
            action: "pong",
          });
          break;
      }
    });
  }

  _heartBeat() {
    var count = 0;
    setInterval(async() => {
      const response = await this._sendMessage({
        action: 'count',
        data: count++
      });
      console.log(response);
    }, 5000);
  }

  longConnection() {
    var port = chrome.runtime.connect({name: host});
    port.postMessage({value: host});
    port.onMessage.addListener(function(data) {
      console.log(data);
    });
  }
}

const helper = new Helper();
