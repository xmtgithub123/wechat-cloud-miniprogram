const Http = require('../utils/Http.js')
const remoteConfig = require('../config/remoteConfig.js')
class UserApi {
  constructor() {
    this.http = new Http()
    this.backendURL = remoteConfig.backendURL
  }
  // 更新用户信息
  updateUserInfo(userInfo) {
    return this.http.post(`${this.backendURL}/userapi/editUser`, userInfo)
  }
  // 验证车主信息
  checkCarOwner(phoneNumber) {
    return this.http.post(`${this.backendURL}/userapi/seachOwnerInfo`, { phoneNumber})
  }
  //认证
  varify(filePath, data={}) {
    return this.http.uploadFile(`${this.backendURL}/userapi/uploadInfo`, filePath, data)
  }
  // 获取车主信息
  getUserInfo() {
    return this.http.get(`${this.backendURL}/userapi/searchUser`, {})
  }
}
module.exports = new UserApi()