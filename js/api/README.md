
### (chrome)api utils

```
file              exports                                   depends

storage.js        Storage
tabs.js           Tabs
bookmarks.js      Bookmarks
helper.js         ApiHelper(.storage, .tabs, .bookmarks)    Storage, Tabs, Bookmarks
```


### summary

api chrome.* can be used for both background and content

### message passing

one-time request

content端监听：
`chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {});`
content端发送：
`chrome.runtime.sendMessage(obj, response => {})`

background监听：
`chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {})`
background发送：
`chrome.tabs.sendMessage(tabId, request, response => {})`

注意不论content端，还是background端，收到消息后必须立即sendResponse。
如果有异步的情况，不能立即得到结果，可以先调用sendResponse(null)返回一个空值，然后重新发起request，传送结果。
