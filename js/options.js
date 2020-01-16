
class Helper extends ApiHelper {
  constructor(connection) {
    super();
    this.connection = chrome.runtime.connect({name: 'popup'});
    this.connection.onMessage.addListener(function(data) {
      console.log(data);
    });


    ApiHelper.bookmarks.startWatch();
  }
  askBackground(obj) {
    this.connection.postMessage(obj);
  }
  // showDataToBackground(data) {
  //   if (!(typeof data === 'string')) {
  //     data = JSON.string(data);
  //   }
  //   // 不能通过postMessage传递引用类型（因为popup与background在不同的运行环境）
  //   this.connection.postMessage({
  //     data
  //   });
  // }


  // handle action triggered from button
  async handleAction(action) {
    // console.log(`action: ${action}`);
    switch (action) {
      case 'runtime_restart':
        // 重启runtime
        // Unchecked runtime.lastError: Function available only for ChromeOS kiosk mode.
        try {
          chrome.runtime.restart();
          console.log(`runtime restart done!`);
        } catch (err) {
          console.log(`runtime restart Error:`);
          console.log(err);
        }
        break;
      case 'open_page_option':
        chrome.runtime.openOptionsPage();
        break;
      case 'show_manifest':
        console.log(chrome.runtime.getManifest());
        break;
      case 'extension_get_views':
        // returns an array of the JavaScript 'window' objects for each of the pages running inside the current extension.
        // 返回background.html和popup.html的window
        console.log(chrome.extension.getViews())
        break;
      case 'storage_all':
        console.log(await this.storageAll());
        break;
      case 'storage_add_visit':
        await this.storageAddVisit();
        console.log(`done storage_add_visit`);
        break;
      case 'storage_clear':
        await this.storageClear();
        console.log(`done storage_clear`);
        break;
      case 'active_tab':
        console.log(await ApiHelper.tabs.getActiveTabs());
        break;
      case 'tabs_all':
        console.log(await ApiHelper.tabs.getAllTabsInCurrentWindow());
        break;
      case 'tab_to_baidu':
        const activeTabs = await ApiHelper.tabs.getActiveTabs();
        if (activeTabs.length === 0) {
          console.log(`no active tabs`);
          return;
        }
        chrome.tabs.update(activeTabs[0].id, {
          url: 'http://www.baidu.com'
        });
        break;

      case '_bookmarks_search_folder_test_1':
        return new Promise((resolve, reject) => {
          chrome.bookmarks.search({
            title: 'test_1'
          }, results => {
            if (Array.isArray(results)) {
              if (results.length > 0) {
                resolve(results[0]);
              } else {
                // not found folder
                resolve(null);
              }
            } else {
              // Error: structure is not correct
              reject(results);
            }
          }
        )});
        break;
      case '_bookmarks_search_folder_test_2':
        return new Promise((resolve, reject) => {
          chrome.bookmarks.search({
            title: 'test_2'
          }, results => {
            if (Array.isArray(results)) {
              if (results.length > 0) {
                resolve(results[0]);
              } else {
                // not found folder
                resolve(null);
              }
            } else {
              // Error: structure is not correct
              reject(results);
            }
          }
        )});
        break;
      case '_bookmarks_get_first_child':
        try {
          const testFolder = await this.handleAction('_bookmarks_search_folder_test_1');
          return new Promise((resolve, reject) => {
            chrome.bookmarks.getSubTree(testFolder.id, results => {
              if (!Array.isArray(results) || results.length === 0) {
                reject(`get sub tree fail`);
                return;
              }
              results = results[0];
              if (!Array.isArray(results.children) || results.children.length === 0) {
                reject(`folder is empty!`);
                return;
              }
              resolve(results.children[0]);
            });
          });
        } catch (err) {
          throw err;
        }
        break;
      case 'bookmarks_get_tree':
        const traverseBookmark = objOrArray => {
          // console.log(objOrArray);
          var results = [];
          if (Array.isArray(objOrArray)) {
            results = results.concat(objOrArray.reduce((sum, it) => {
              sum = sum.concat(traverseBookmark(it));
              return sum;
            }, []));
          } else {
            const item = {};
            ['id', 'parentId', 'index', 'title', 'url', 'dateAdded', 'dateGroupModified'].forEach(key => {
              if (objOrArray.hasOwnProperty(key)) {
                item[key] = objOrArray[key];
              } else {
                item[key] = null;
              }
            });
            results.push(item);
            // console.log(results);
            // console.log(objOrArray);
            Array.isArray(objOrArray.children)
            if (Array.isArray(objOrArray.children)) {
              results = results.concat(traverseBookmark(objOrArray.children));
            }
            // console.log(results);
          }
          return results;
        }
        const bookmarkList = await new Promise((resolve, reject) => {
          chrome.bookmarks.getTree(tree => {
            console.log(tree);
            // console.log(Array.isArray(tree));
            resolve(traverseBookmark(tree));
          });
        });
        console.log(bookmarkList);
        return bookmarkList;
        break;
      case 'bookmarks_create_folder':
        try {
          var folderName = 'test_1';
          const testFolder1 = await this.handleAction('_bookmarks_search_folder_test_1');
          const testFolder2 = await this.handleAction('_bookmarks_search_folder_test_2');
          if (!testFolder1) {
            folderName = 'test_1';
          } else if (!testFolder2) {
            folderName = 'test_2';
          } else {
            console.log(`test folder already exist!`);
            return;
          }
          chrome.bookmarks.create({
            parentId: '1',
            title: folderName
          }, (newFolder) => {
            console.log("added folder: ");
            console.log(newFolder);
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_list_folder':
        try {
          const testFolder = await this.handleAction('_bookmarks_search_folder_test_1');
          if (!testFolder) {
            throw new Error(`test folder not exist!`);
          }
          chrome.bookmarks.getSubTree(testFolder.id, results => console.log(results));
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_search_folder':
        console.log(await this.handleAction('_bookmarks_search_folder_test_1'));
        break;
      case 'bookmarks_remove_tree':
        try {
          const testFolder = await this.handleAction('_bookmarks_search_folder_test_1');
          if (!testFolder) {
            throw new Error(`test folder not exist!`);
          }
          chrome.bookmarks.removeTree(testFolder.id, results => {
            console.log('bookmarks_remove_tree');
            console.log(results);
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_create_bookmark':
        try {
          const testFolder = await this.handleAction('_bookmarks_search_folder_test_1');
          if (!testFolder) {
            console.log(`test folder not exist!`);
            return;
          }
          chrome.bookmarks.create({
            parentId: testFolder.id,
            // index: 0,
            title: `BAIDU_${utils.getUid()}`,
            url: 'http://www.baidu.com'
          }, (item) => {
            console.log("bookmark added: ");
            console.log(item);
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_remove':
        try {
          const firstChild = await this.handleAction('_bookmarks_get_first_child');
          if (!firstChild) {
            throw new Error(`firstChild not exist!`);
          }
          // NOTICE: if folder is not empty, 
          // Error will occur: `Unchecked runtime.lastError: Can't remove non-empty folder (use recursive to force).`
          chrome.bookmarks.remove(firstChild.id, () => {
            console.log('bookmarks_remove');
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_update':
        try {
          const firstChild = await this.handleAction('_bookmarks_get_first_child');
          if (!firstChild) {
            throw new Error(`firstChild not exist!`);
          }
          // NOTICE: if folder is not empty, 
          // Error will occur: `Unchecked runtime.lastError: Can't remove non-empty folder (use recursive to force).`
          chrome.bookmarks.update(firstChild.id, {
            title: `BAIDU_${utils.getUid()}`,
            url: firstChild.url
          }, () => {
            console.log('bookmarks_update');
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_move':
        try {
          const testFolder1 = await this.handleAction('_bookmarks_search_folder_test_1');
          const testFolder2 = await this.handleAction('_bookmarks_search_folder_test_2');
          const firstChild = await this.handleAction('_bookmarks_get_first_child');
          if (!firstChild) {
            throw new Error(`firstChild not exist!`);
          }
          // NOTICE: if folder is not empty, 
          // Error will occur: `Unchecked runtime.lastError: Can't remove non-empty folder (use recursive to force).`
          chrome.bookmarks.move(firstChild.id, {
            parentId: testFolder2.id,
            index: 0
          }, () => {
            console.log('bookmarks_move');
          });
        } catch (err) {
          console.log(err);
        }
        break;
      case 'bookmarks_recent':
        chrome.bookmarks.getRecent(10, results => console.log(results));
        break;
      case 'net_login':
        this.askBackground({
          ask: 'net_request',
          action: 'request_baidu'
        });
        break;
      default:
        console.log(`unhandled action: ${action}`);
        break;
    }
  }
}

// NOTICE:
// listen DOMContentLoaded other than load(it seems that load event is not triggered)
document.addEventListener('DOMContentLoaded', () => {
  // console.log('loaded');
  const helper = new Helper();
  const container = document.querySelector('.container');

  // logic of section api_show
  const sectionApiShow = (show) => {
    const sectionApiShow = container.querySelector('section.api_show');
    sectionApiShow.style.display = show ? 'block' : 'none';

    // 只设置一次click listener
    if (sectionApiShow.hasAddClickListener) {
      return;
    }
    // NOTICE: click event of Node with tagName 'button' will be listened here.
    sectionApiShow.addEventListener('click', async evt => {
      // console.log(evt);
      var target = evt.target;
      while (target && target !== sectionApiShow && target.tagName != 'BUTTON') {
        target = target.parentNode;
      }
      if (!target || target == sectionApiShow) {
        return;
      }
      var action = target.dataset.action;
      helper.handleAction(action);
    });
    sectionApiShow.hasAddClickListener = true;
  }

  const sectionAssist = async show => {
    const sectionAssist = container.querySelector('section.assist');
    sectionAssist.style.display = show ? 'block' : 'none';

    if (!show) {
      return;
    }
    var neegLogin = true;

    var net = null;
    var serverOrigin = null;
    var userInfo = null;
    var {token, username, realname, role} = {};
    try {
      const setting = await ApiHelper.storage.getData('setting');
      if (!setting) {
        throw new Error('storage.setting not found');
      }
      serverOrigin = setting.serverOrigin;
      if (!serverOrigin) {
        throw new Error('Error: setting.serverOrigin未找到');
      }
      net = new Net(serverOrigin);
      userInfo = await ApiHelper.storage.getData('userInfo');
      if (!setting || !userInfo) {
        throw new Error(`setting or userInfo not found in storage!`);
      }
      token = userInfo.token;
      username = userInfo.username;
      if (token && username) {
        userInfo = await net.requestData(net.URL_LIST.verify_token, {
          headers: {
            token
          }
        });
        neegLogin = false;
      }
    } catch (err) {
      console.log(err.code);
      console.log(err);
    }

    const loginForm = sectionAssist.querySelector(':scope > form.form_login');
    const assistOperation = sectionAssist.querySelector(':scope > .form.operation');
    if (neegLogin) {
      loginForm.style.display = 'block';
      assistOperation.style.display = 'none';
      loginForm.onsubmit = async evt => {
        evt.preventDefault();
        const target = evt.target;
        try {
          if (!serverOrigin) {
            throw new Error(`serverOrigin not found, set serverOrigin first`);
          }
          const username = target.username.value.trim();
          const password = target.password.value.trim();
          if (!username || !password) {
            throw new Error(`username or password is null!`);
          }
          userInfo = (await net.request(net.URL_LIST.login, {
            data: {
              username,
              password
            }
          })).data;
          // console.log(userInfo);
          ApiHelper.storage.setData({userInfo});
        } catch (err) {console.log(err);}
      };
      // loginForm.addEventListener('submit', async evt => {
      //   evt.preventDefault();
      //   const target = evt.target;
      //   try {
      //     if (!serverOrigin) {
      //       throw new Error(`serverOrigin not found, set serverOrigin first`);
      //     }
      //     const username = target.username.value.trim();
      //     const password = target.password.value.trim();
      //     if (!username || !password) {
      //       throw new Error(`username or password is null!`);
      //     }
      //     const userInfo = await xhrRequest(Object.assign(helper.URL_LIST.login, {
      //       path: `${serverOrigin}${helper.URL_LIST.login.path}`,
      //       data: {
      //         username, password
      //       }
      //     }));
      //     console.log(userInfo);
      //   } catch (err) {console.log(err);}
      // });
    } else {
      loginForm.style.display = 'none';
      assistOperation.style.display = 'block';
      assistOperation.querySelector('.form-item.title').textContent = `你好，${username}`;

      assistOperation.onclick = async evt => {
        // console.log(evt);
        var target = evt.target;
        while (target && target !== sectionApiShow && target.tagName != 'BUTTON') {
          target = target.parentNode;
        }
        if (!target || target == sectionApiShow) {
          return;
        }
        var action = target.dataset.action;
        switch (action) {
          case 'bookmark_force_update':
          try {
            await net.requestData(net.URL_LIST.bookmark_force_update, {
              headers: {
                token
              },
              data: {
                bookmarks: await helper.handleAction('bookmarks_get_tree')
              }
            });
          } catch (err) {
            console.log(err);
          }

          break;
        }
        // helper.handleAction(action);
      };
    }
    // console.log(setting);
  }

  const sectionSetting = show => {
    const sectionOptionSetting = container.querySelector('section.options_setting');
    // const sectionApiShow = container.querySelector('section.api_show');
    sectionOptionSetting.style.display = show ? 'block' : 'none';

    const theForm = sectionOptionSetting.querySelector('form.form_setting');
    // const theForm = the_form;
    const DEFAULT_SETTING = {
      serverOrigin: ''
    };
    const _restoreForm = async(theForm) => {
      var _setting = await ApiHelper.storage.getData('setting');
      // console.log(_setting);
      _setting = _setting ? Object.keys(DEFAULT_SETTING).reduce((sum, key) => {
        _setting.hasOwnProperty(key) && (sum[key] = _setting[key]);
        return sum;
      }, {}) : {}

      const setting = Object.assign(DEFAULT_SETTING, _setting);
      for (let key in setting) {
        theForm[key].value = setting[key];
      }
    }
    const _saveForm = async(theForm) => {
      const setting = {};
      Object.keys(DEFAULT_SETTING).forEach(key => {
        setting[key] = theForm[key].value;
      })
      await ApiHelper.storage.setData({setting});
      console.log('保存成功！');
    }

    _restoreForm(theForm);

    // 只设置一次listener
    if (sectionOptionSetting.hasAddEventListener) {
      return;
    }
    theForm.addEventListener('submit', evt => {
      const target = evt.target;
      console.log(target.serverHost);
      _saveForm(theForm);
      evt.preventDefault();
    });
    theForm.addEventListener('reset', evt => {
      _restoreForm(theForm);
      evt.preventDefault();
    });
    sectionOptionSetting.hasAddEventListener = true;
  }

  try {
    const sectionHeader = container.querySelector('.header');
    const selector = sectionHeader.querySelector('.selector');
    const inputApiShow = selector.querySelector('input[name="apiShow"]');
    const inputAssist = selector.querySelector('input[name="assist"]');
    const inputSetting = selector.querySelector('input[name="setting"]');
    inputApiShow.checked = false;
    inputAssist.checked = true;
    inputSetting.checked = false;
    sectionApiShow(inputApiShow.checked);
    sectionAssist(inputAssist.checked);
    sectionSetting(inputSetting.checked);
    selector.addEventListener('change', evt => {
      // console.log(evt);
      sectionApiShow(inputApiShow.checked);
      sectionAssist(inputAssist.checked);
      sectionSetting(inputSetting.checked);
    });
  } catch (err) { console.log(err); }

  // handle option config
  console.log(`onDOMContentLoaded`);
});