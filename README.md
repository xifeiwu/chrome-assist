### tabs
https://developers.chrome.com/extensions/tabs

### content scripts

content.js运行在一个自己的环境中，不会对当前页面造成全局变量污染

Content scripts live in an isolated world, allowing a content script to makes changes to its JavaScript environment without conflicting with the page or additional content scripts.

Chrome injects content scripts after the DOM is complete.
background script, which has access to every Chrome API but cannot access the current page
Content scripts have some limitations. They cannot use chrome.* APIs, with the exception of extension, i18n, runtime, and storage.

### options, background

options: allow users to customise the behavior of an extension by providing an options page. 
**different**

It makes sense for the second approach not work. Options.html is not "alive" all of the time, only when the options page is up. Hence, it cannot listen to requests from the content script. That's exactly what "background" is for.

### popup, options

popup, options的权限和逻辑基本相同。

职责：option用于学习和功能展示；popup提供比较稳定的接口；popup是options的一个子集（包括html, js, css）

### question

How to get the current tab id / info in the content 

### summary

[message communication](https://developer.chrome.com/extensions/messaging)
[extension overview](https://developer.chrome.com/extensions/overview)