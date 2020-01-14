
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
        chrome.bookmarks.getTree(tree => {
          console.log(tree);
        })
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

  // handle button action
  try {
    const sectionApiTest = container.querySelector('section.api_test');
    // NOTICE: click event of Node with tagName 'button' will be listened here.
    sectionApiTest.addEventListener('click', async evt => {
      // console.log(evt);
      var target = evt.target;
      while (target && target !== sectionApiTest && target.tagName != 'BUTTON') {
        target = target.parentNode;
      }
      if (!target || target == sectionApiTest) {
        return;
      }
      var action = target.dataset.action;
      helper.handleAction(action);
    });
  } catch(err) {console.log(err)}

  // handle option config
  try {
    const sectionOptionSetting = container.querySelector('section.options_setting');
    const theForm = sectionOptionSetting.querySelector('form.the-form');
    // const theForm = the_form;
    const DEFAULT_SETTING = {
      serverHost: ''
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
      await ApiHelper.storage.setData({setting})
    }

    _restoreForm(theForm);

    theForm.addEventListener('submit', evt => {
      console.log(evt);
      const target = evt.target;
      console.log(target.serverHost);
      _saveForm(theForm);
      console.log(`done: submit form`);
      evt.preventDefault();
    });
    theForm.addEventListener('reset', evt => {
      _restoreForm(theForm);
      console.log(`done: reset form`);
      evt.preventDefault();
    });
  } catch (err) {console.log(err)}
  console.log(`onDOMContentLoaded`);
});