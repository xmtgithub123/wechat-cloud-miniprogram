const Http = require('../utils/Http.js')
const remoteConfig = require('../config/remoteConfig.js')
class WechatApi {
  constructor() {
    this.http = new Http()
    this.backendURL = remoteConfig.backendURL
  }
  // 获取分享二维码
  getShareQRCode(page, scene) {
    return this.http.post(`${this.backendURL}/wechatmpapi/getWXACodeUnlimit`, { page, scene })
  }
}
module.exports = new WechatApi()