const Http = require('../utils/Http.js')
const remoteConfig = require('../config/remoteConfig.js')
class ActivityApi {
  constructor() {
    this.http = new Http()
    this.backendURL = remoteConfig.backendURL
  }
  getDealerList() {
    return this.http.get(`${this.backendURL}/activityapi/getDealerInfo`)
  }

  saveActivity(data) {
    return this.http.post(`${this.backendURL}/activityapi/saveActivity`, data)
  }

  getActivityParticipant() {
    return this.http.get(`${this.backendURL}/activityapi/searchActivityHeadImgs?activityId=1`)
  }

  checkUserIsJoinActivity(phoneNumber) {
    return this.http.get(`${this.backendURL}/activityapi/searchActivity?activityId=1`, {phoneNumber})
  }

  // 获取等奖用户
  getWinner() {
    return this.http.get(`${this.backendURL}/activityapi/searchPrizeUsers`)
  }
}
module.exports = new ActivityApi()