/**
 * @explain 这里主要放主进程入口函数
 * 
 * @author 朱昆鹏
 */

const { init } = require('./init');
const { shell, app } = require('electron')

/**
 * 初始化方法
 */
function main() {

  // 监听渲染
  app.on('ready', () => {
    init(); // 初始化Electron页面
  })

  // 监听打开新窗口（代理到浏览器）
  app.on('web-contents-created', (e, webContents) => {
    webContents.on('new-window', (event, url) => {
      event.preventDefault();
      shell.openExternal(url); // 打开浏览器
    });
  });
}

module.exports = {
  main: main
}