const Http = require('../utils/Http.js')
const remoteConfig = require('../config/remoteConfig.js')
class CheckCodeApi {
  constructor() {
    this.http = new Http()
    this.backendURL = remoteConfig.backendURL
  }

  // 发送验证码
  sendCode(phoneNumber) {
    return this.http.post(`${this.backendURL}/msgapi/sendCode`, { phoneNumber, clientIp:'127.0.0.1'})
  }
  // 校验验证码+提交用户信息
  varifyCode(data) {
    return this.http.post(`${this.backendURL}/msgapi/validCodeAndLoginNew`, data)
  }
  // 校验验证码
  varifyCodeToUpdateUserInfo(phoneNumber, verifyCode) {
    return this.http.post(`${this.backendURL}/msgapi/validCode`, { phoneNumber, verifyCode, clientIp: '127.0.0.1' })
  }
}
module.exports = new CheckCodeApi()