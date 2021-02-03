/**
 * @explain 这里主要放主进程 初始化的一些方法（创建窗口，注册与渲染进程交互的IPC事件）
 * 
 * @author 朱昆鹏
 */

const { BrowserWindow } = require('electron')
const isDev = require('electron-is-dev')
const { DEVURL, APPINDEXPATH } = require('./config');

function init() {
  return createMainInit();
}

/**
 * 创建窗口，窗口基础配置工作
 */
function createMainInit() {
  let mainWindow = new BrowserWindow({
    frame: true,
    width: 1250,
    height: 750,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true, // 设置开启nodejs环境
      enableRemoteModule: true // enableRemoteModule保证renderer.js可以可以正常require('electron').remote，此选项默认关闭且网上很多资料没有提到
    },
    webviewTag: true
  })
  mainWindow.show()
  const urlLocation = isDev ? DEVURL : APPINDEXPATH;
  mainWindow.loadURL(urlLocation)
  return mainWindow
}

module.exports = {
  init
}