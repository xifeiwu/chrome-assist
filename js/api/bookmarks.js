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
    chrome.bookmarks.onCreated.addListener(function(id, bookmark) {
      console.log({
        action: 'onCreated',
        data: {
          id, bookmark
        }
      });
    });

    chrome.bookmarks.onMoved.addListener(function(id, moveInfo) {
      console.log({
        action: 'onMoved',
        data: {
          id, moveInfo
        }
      });
      // tree.load(function() {
      //   var managedNode = tree.getById(id);
      //   if (managedNode && !managedNode.isRoot()) {
      //     managedNode.moveInModel(info.parentId, info.index, function(){});
      //   } else {
      //     // Check if the parent node has managed children that need to move.
      //     // Example: moving a non-managed bookmark in front of the managed
      //     // bookmarks.
      //     var parentNode = tree.getById(info.parentId);
      //     if (parentNode)
      //       parentNode.reorderChildren();
      //   }
      // });
    });

    chrome.bookmarks.onChanged.addListener(function(id, changeInfo) {
      console.log({
        action: 'onChanged',
        data: {
          id, changeInfo
        }
      });
      // tree.load(function() {
      //   var managedNode = tree.getById(id);
      //   if (!managedNode || managedNode.isRoot())
      //     return;
      //   chrome.bookmarks.update(id, {
      //     'title': managedNode._title,
      //     'url': managedNode._url
      //   });
      // });
    });

    chrome.bookmarks.onRemoved.addListener(function(id, moveInfo) {
      console.log({
        action: 'onRemoved',
        data: {
          id, moveInfo
        }
      });
    });

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
