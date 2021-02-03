/**
 * @explain 这里主要放核心配置信息
 * 
 * @author 朱昆鹏
 */

const path = require('path');

const APPINDEXPATH = `file://${path.join(__dirname, '../../build/index.html')}`

module.exports = {

  DEVURL: `http://localhost:8080`, // 本地开发URL
  APPINDEXPATH: APPINDEXPATH, // 打包之后加载的首页地址
}