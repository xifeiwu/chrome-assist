async function handleAction(action) {
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
  }
}

// listen DOMContentLoaded other than load(it seems that load event is not triggered)
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');

  // logic of section api_show
  const sectionApiShow = container.querySelector('section.api_show');
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
    handleAction(action);
  });
});