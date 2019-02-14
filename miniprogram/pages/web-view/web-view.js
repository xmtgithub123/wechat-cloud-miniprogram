const localStorageKey = require('../../config/localStorageKey.js')
Page({
  data: {
    url: '',
    h5Data:'',
    isShareFlag:0,
    _url:'',
    shareUserId:'',
    activityId:'',
    answerEndTime:'',
  },
  onShow(){
    console.log(2)
    let that = this;
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    if(!userInfo){
      wx.showModal({
        title: '请先登录',
        content: '您还未进行登录！',
        cancelText: '返回',
        confirmText: '登录',
        confirmColor: '#cd0124',
        cancelColor: '#666666',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }
          if (res.cancel) {
            wx.switchTab({
              url: '/pages/activity/activity',
            })
          }
        },
      })
    }else {
      let userToken = userInfo.token.split('Bearer ')[1];
      that.setData({
        shareUserId:userInfo.id,
        url: `${that.data._url}?token=${userToken}&um=${encodeURIComponent(userInfo.nickName)}&avatarUrl=${userInfo.avatarUrl}&isEnd=${that.data.isEnd}&answerEndTime=${encodeURIComponent(that.data.answerEndTime)}&activityId=${that.data.activityId}`
      })
      console.log(that.data.url)
    }
  },
  onLoad(options) {
    let that = this;
    let url = options.url
    let isEnd = options.isEnd
    let activityId = options.activityId
    let answerEndTime = options.answerEndTime
    that.setData({
      _url : url,
      isEnd: isEnd,
      activityId: activityId,
      answerEndTime: answerEndTime
    })
    console.log(options)
    // let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    // if(userInfo){
     
    // }
    // else {
    //   wx.navigateTo({
    //     url: '/pages/login/login',
    //   })
    // }
  },
  bindmessage(e){
    console.log(e)
    console.log(123)
    this.setData({
      h5Data:e.detail.data
    })
  },
  onShareAppMessage: function (res) {
    console.log(res)
    let that = this;
    let returnURL = res.webViewUrl;
    return {
      title: that.data.h5Data[0].title,
      path: that.data.h5Data[0].path + '&shareUserId=' + that.data.shareUserId + '&activityId=' + that.data.activityId,
      imageUrl: '/resource/imgs/activity_header.jpg',
      // path: '/pages/share/index?url=https://altimaclub.chebaba.com/other/answer/&shareUserId=' + that.data.shareUserId + '&activityId=' + that.data.activityId,
      // path: `/pages/share/index?url=https://altimaclub.chebaba.com/other/answer&shareUserId=${that.data.shareUserId}&activityId=${that.data.activityId}`,
      success:function(r){
      }
    }
  }
})