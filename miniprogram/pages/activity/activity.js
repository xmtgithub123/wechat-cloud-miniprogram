const localStorageKey = require('../../config/localStorageKey.js')
const userApi = require('../../api/user.js')
const cloudApi = require('../../api/index.js')
const moment = require('../../config/moment.js')
Page({
  data: {
    showPage: false,
    activity: {},
    activityList:[],
    isEnd:null
  },
  onLoad() {
    let that = this;
    cloudApi.getActivityList().then(res => {
      // console.log(res)
      let data = res.result.data
      data.map((val) => {
        // console.log(val)
        let currentTime = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
        let endTime = moment(val.endTime).format('YYYY-MM-DD HH:mm:ss');
        let startTime = moment(val.startTime).format('YYYY-MM-DD HH:mm:ss')
        //活动是否开始
        if(currentTime < startTime) {
          val.isStart = 0
        }
        else {
          val.isStart = 1
        }
        //活动是否结束
        if (currentTime > endTime) {
          val.isEnd=1
        }
        else {
          val.isEnd = 0
        }
        if (val.isActivity) {
          let _userInfo =  wx.getStorageSync(localStorageKey.USER_INFO)
          // console.log(_userInfo)
          if(val.isWebViewActivity){
            val.url = `/pages/web-view/web-view?url=${val.activityUrl}&isEnd=${val.isEnd}&answerEndTime=${endTime}&activityId=${val._id}`
          }
          else {
            val.url = `/pages/activity-detail/detail?id=${val.activityId}`
          }
        }
        return val
      })
      // console.log(data)
      this.setData({
        activityList:data
      })

    })
    // cloudApi.getActivityImg().then(res => {
    //   if (res.result.data) {
    //     debugger;
    //     this.setData({
    //       activity: res.result.data[0]
    //     })
    //   }
    // })
  },
  onShow: function (options) {
    this.onLoad()
    // 获取用户订单状态
    // let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    // if (userInfo) {
    //   userApi.getUserInfo().then(res => {
    //     if (res.code == 0) {
    //       if (!res.data.invoiceInfo) {
    //         wx.showModal({
    //           title: '尊贵的朋友',
    //           content: '您还不是车主，请先进行车主验证!',
    //           cancelText: '回首页',
    //           confirmText: '去验证',
    //           confirmColor: '#cd0124',
    //           cancelColor: '#666666',
    //           success(res) {
    //             if (res.confirm) {
    //               wx.navigateTo({
    //                 url: '/pages/mine/owner/owner',
    //               })
    //             }
    //             if (res.cancel) {
    //               wx.switchTab({
    //                 url: '/pages/list/list',
    //               })
    //             }
    //           },
    //         })
    //       } else {
    //         this.setData({
    //           showPage: true,
    //         })
    //       }
    //     }
    //   })
    // } else {
    //   wx.showModal({
    //     title: '请先登录',
    //     content: '您还未进行登录！',
    //     cancelText: '回首页',
    //     confirmText: '登录',
    //     confirmColor: '#cd0124',
    //     cancelColor: '#666666',
    //     success(res) {
    //       if (res.confirm) {
    //         wx.navigateTo({
    //           url: '/pages/login/login',
    //         })
    //       }
    //       if (res.cancel) {
    //         wx.switchTab({
    //           url: '/pages/list/list',
    //         })
    //       }
    //     },
    //   })
    // }
  },
  onShareAppMessage: function () {
    return {
      title: '天纵联盟',
      path: `/pages/index/index`,
      imageUrl: '/resource/imgs/minip_intro.jpg',
      success:function(res) {
        
      }
    }
  }
})