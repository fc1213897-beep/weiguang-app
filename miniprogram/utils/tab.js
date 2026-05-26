/** 同步自定义 tabBar 选中项 */
function setTabSelected(page, index) {
  if (typeof page.getTabBar === "function" && page.getTabBar()) {
    page.getTabBar().setData({ selected: index });
  }
}

module.exports = { setTabSelected };
