(function(root, factory) {
  root.BookMarks = factory();
}(this, function() {

return class {
  constructor() {}

  getTree() {
    chrome.bookmarks.getTree(tree => {
      console.log(tree);
    })
  }
  startWatch() {
    // Observe bookmark modifications and revert any modifications made to managed
    // bookmarks. The tree is always reloaded in case the events happened while the
    // page was inactive.

/**
format of createdInfo:
{
  dateAdded: 1578974165413
  id: "1261"
  index: 3
  parentId: "1248"
  title: "BAIDU_8e52_4bb1_d8d8_c2a1_1578974165413"
  url: "http://www.baidu.com/"
}
*/

    chrome.bookmarks.onCreated.addListener(function(id, createdInfo) {
      console.log({
        action: 'onCreated',
        data: {
          id, createdInfo
        }
      });
    });

/**
format of moveInfo:
{
  index: 1
  oldIndex: 0
  oldParentId: "1248"
  parentId: "1249"
}
*/
    chrome.bookmarks.onMoved.addListener(function(id, moveInfo) {
      console.log({
        action: 'onMoved',
        data: {
          id, moveInfo
        }
      });
    });

/**
format of changeInfo:
{
  title: "BAIDU_1985_002e_a1f5_b543_1578973957871"
  url: "http://www.baidu.com/"
}
*/
    chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
      console.log({
        action: 'onChanged',
        data: {
          id, changeInfo
        }
      });
    });

/**
format of removedInfo:
{
  index: 0
  parentId: "1248"
  node: {
    dateAdded: 1578973680389
    id: "1254"
    title: "BAIDU_1985_002e_a1f5_b543_1578973957871"
    url: "http://www.baidu.com/"
  }
}
*/
    chrome.bookmarks.onRemoved.addListener(function(id, removedInfo) {
      console.log({
        action: 'onRemoved',
        data: {
          id, removedInfo
        }
      });
    });

// not used by now
    chrome.bookmarks.onChildrenReordered.addListener(function(id, reorderInfo) {
      console.log({
        action: 'onChildrenReordered',
        data: {
          id, reorderInfo
        }
      });
    });
  }
}
}))
