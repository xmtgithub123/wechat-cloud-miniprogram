//app.js
App({
  onLaunch: function (options) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        // env:{
        //   functions:'dev-ccc16d'
        // }
      })
    }
  },
  onHide() {
    // 当小程序进入后台时，统一上报获取到的formid
  },
  //全局缓存formid
  globalFormId: [],
  globalData: {}
})
