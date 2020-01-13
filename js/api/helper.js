(function(root, factory) {
  root.ApiHelper  = factory(Storage, Tabs, BookMarks);
  // ['helper', 'ApiHelper'].forEach(prop => {
  //   root[prop] = results[prop];
  // });
}(this, function(Storage, Tabs, BookMarks) {

if (!Tabs || !Storage || !BookMarks) {
  throw new Error(`Error, depend: Storage, Tabs`);
}

const storage = new Storage();
const tabs = new Tabs();
const bookmarks = new BookMarks();

class ApiHelper {
  async getStorage(keyList) {
    return new Promise((resolve, reject) => {
      if (Array.isArray(keyList)) {
      } else {
        chrome.storage.local.get(null, items => {
          resolve(items);
        });
      }
    });
  }

  async storageAll() {
    const allData = await storage.getAllData();
    return allData;
    // console.log(allData);
  }

  async storageClear() {
    await storage.clear();
  }

  async storageAddVisit() {
    var visitCount = await storage.getData('visitCount');
    visitCount = visitCount ? visitCount : 1;
    visitCount++;
    await storage.setData({visitCount})
  }
}

ApiHelper.storage = storage;
ApiHelper.tabs = tabs;
ApiHelper.bookmarks = bookmarks;
return ApiHelper;

}))
