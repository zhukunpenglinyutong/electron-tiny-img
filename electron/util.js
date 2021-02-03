/**
 * @explain 这里主要放一些公共函数
 *
 * @author 朱昆鹏
 */
const { Notification } = require('electron')

/**
 * 自动更新通知提示
 * @param {*} body 
 */
function showNotification(title = 'no title', body = 'no body') {
  var notification = {
    title: title,
    body: body
  }
  new Notification(notification).show()
}

module.exports = {
  showNotification
}