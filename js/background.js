// const utils = new FEUtils();
// const storage = new Storage();
// const tabs = new Tabs();
// depend: ApiHelper

class Helper extends ApiHelper {
  constructor() {
    super();
    this._onListen();
    this._watchTab();
    this.allTabs = [];
  }

  _sendMessageToTab(tabId, answer, data) {
    chrome.tabs.sendMessage(tabId, {
      answer,
      data
    }, (response) => {
      console.log(`response of sendMessageToTab:`);
      console.log(response);
    });
  }
  async _onListen() {
    // NOTICE: async await will cause error: (Unchecked runtime.lastError: The message port closed before a response was received.)
    /**
     * @param request, 用户发送过来的数据，任意格式
     * @param sender, 发送方信息
      {
        id: "jkneaogfnonbidmdnpkkjgkjfgdpdaoc"
        url: "https://www.baidu.com/"
        frameId: 0
          tab: {
          active: true
          audible: false
          autoDiscardable: true
          discarded: false
          favIconUrl: "https://www.baidu.com/favicon.ico"
          height: 789
          highlighted: true
          id: 588
          incognito: false
          index: 1
          mutedInfo: {muted: false}
          pinned: false
          selected: true
          status: "complete"
          title: "百度一下，你就知道"
          url: "https://www.baidu.com/"
          width: 943
          windowId: 586
        }
      }
     */
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      // console.log(sender);
      // console.log(request);
      if (!request || !request.ask) {
        sendResponse(null);
        return;
      }
      const tab = sender ? sender.tab : null;
      if (!tab || !tab.active) {
        sendResponse(null);
        return;
      }
      const ask = request.ask;
      switch (ask) {
        case 'net_request':
          sendResponse(null);
          try {
            const net = new Net('');
            const response = await net.request({
              path: 'http://www.baidu.com',
              method: 'get'
            });
            // sendResponse只支持同步
            // sendResponse(userInfo);
            this._sendMessageToTab(tab.id, ask, response);
          } catch (err) {
            console.log(err);
          }
          break;
        default:
          sendResponse(tab);
          break;
      }
    });
  }
  _watchTab() {
    async function _updateVisitCountToStorage(host) {
      try {
        var data = await ApiHelper.storage.getData('visitCount');
        if (!data) {
          data = {};
        }
        if (!data.hasOwnProperty(host)) {
          data[host] = 0;
        }
        data[host] += 1;
        await ApiHelper.storage.setData({visitCount: data});
      } catch(err) {
        console.log(err);
      }
    }
    async function _isConnected(tabId, tab) {
      // check if content-script is injected
      const response = await new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, {
          action: 'ping',
          data: {
            tabId,
            tab
          }
        }, (response) => {
          chrome.runtime.lastError
            ? reject(Error(chrome.runtime.lastError.message))
            : resolve(response)
        });
      });
      return response && response.action === 'pong';
    }
    // async function get

    /**
     * @param obj: {action, tab}
     */
    ApiHelper.tabs.tabWatcher(async obj => {
      // console.log(obj);
      if (!obj || !obj.tab || !obj.tab.id) {
        console.log(`unrecognzied format`);
        console.log(obj);
        return;
      }
      const tab = obj.tab;
      if (!tab || !tab.url ||  !/^[http|https]/.test(tab.url)) {
        console.log(`unrecognized url: ${tab.url}`);
        return;
      }
      try {
        if (await _isConnected(tab.id, tab)) {
          if (tab && tab.url) {
            const parser = utils.parseUrl(tab.url);
            if (parser.host) {
              // this.updateVisitCountToStorage(parser.host);
            }
            console.log(obj);
          }
        } else {
          throw new Error('content-script not found');
        }
      } catch (err) {
        console.log(err);
        // chrome.tabs.executeScript(tab.id, {
        //   file: "js/content.js"
        // }, results => {
        //   console.log(results);
        // });
      }
    });
  }

  // handle message from connection(long-lived connection)
  async handleConnectionMessage(connection, obj) {
    const ask = obj.ask;
    var results = null;
    if (!ask) {
      throw new Error(`key ask is not found in obj`);
    }
    switch (ask) {
      case 'net_request':
        const net = new Net('');
        const response = await net.request({
          path: 'http://www.baidu.com',
          method: 'get'
        });
        connection.postMessage({
          answer: ask,
          data: response
        })
        break
      default:
        connection.postMessage({
          answer: ask,
          status: 'unhandled'
        });
        console.log(`unHandlePopupAction: ${ask}`);
        break;
    }
  }

  async updateTimeStampInStorage() {
    await ApiHelper.storage.setData({name: 'background-usage', timestamps: utils.formatDate(Date.now(), 'yyyy-MM-dd hh:mm:ss')});
  }
}

const helper = new Helper();


// onInstalled: 插件刚刚被安装时触发
chrome.runtime.onInstalled.addListener(function(details) {
  console.log(`background onInstalled:`);
  console.log(details);
  
  chrome.runtime.getPlatformInfo(platformInfo => {
    console.log('platformInfo');
    console.log(platformInfo);
  })

  chrome.runtime.getBackgroundPage(backgroundPage => {
    console.log('backgroundPage');
    console.log(backgroundPage);
  })

  helper.updateTimeStampInStorage();
  // helper.showAllStorage();
});

const _unhandledConnectionList = [];
chrome.runtime.onConnect.addListener(function(connection) {
  const connectionName = connection.name;
  console.log(`onConnect: ${connectionName}`);

  switch (connectionName) {
    case 'popup':
      connection.onMessage.addListener(helper.handleConnectionMessage.bind(helper, connection));
      break;
    default:
      _unhandledConnectionList.push(connectionName);
      connection.postMessage({
        connectionName,
        status: 'unhandled',
        _unhandledConnectionList
      });
      break;
  }
});


