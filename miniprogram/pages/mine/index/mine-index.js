const localStorageKey = require('../../../config/localStorageKey.js')
const userApi = require('../../../api/user.js')
const cloudApi = require('../../../api/index.js')
Page({
  data: {
    showModal: false, // 是否显示模态框
    userInfo: {},
    carInfo: {}, // 车信息
    showPage: false,
    showScoreModal: false, // 规则弹框
    isTLUser: false, // 是否是天籁车主
    orderStatus: '', // 订单状态
    isAuth: false, // 车主是否已认证
    userStatus: '尊贵的车主', // 用户的车主身份
    scoreRule: '正在加载...', // 积分规则
  },
  onShow() {
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    if (userInfo) {
      this.getCarOwnerInfo(userInfo.phoneNumber)
      this.getUserInfo(() => {
        this.setData({
          userInfo,
          showPage: true
        })
      })
      
    } 
    if (!userInfo)  {
      wx.showModal({
        title: '请先登录',
        content: '您还未进行登录！',
        cancelText: '回首页',
        confirmText: '登录',
        confirmColor: '#cd0124',
        cancelColor: '#666666',
        success(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
          if (res.cancel) {
            wx.switchTab({
              url: '/pages/list/list',
            })
          }
        },
      })
    }
  },
  // 获取车主信息
  getUserInfo(cb) {
    userApi.getUserInfo().then(res => {
      if (res.code == 0) {
        if (res.data && res.data.invoiceInfo) {
          this.setData({
            isAuth: true
          })
          let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
          Object.assign(userInfo, res.data)
          wx.setStorageSync(localStorageKey.USER_INFO, userInfo)
        }
      }
    }).finally(() => {
      if (cb) cb()
    })
  },
  // 获取车主订单信息
  getCarOwnerInfo(phoneNumber) {
    userApi.checkCarOwner(phoneNumber).then(res => {
      if (res.code == 0) {
        if (res.data) {
          let isTLUser = res.data.carType.indexOf('2.0T') > -1
          let status = res.data.orderType 
          let orderStatus = ''
          if (status.indexOf('已交车') < 0 ) {
            orderStatus = '下订客户'
          }
          if (status && status.indexOf('已交车') > -1) {
            orderStatus = '认证车主'
            isTLUser = false
          }
          this.setData({
            carInfo: res.data,
            orderStatus,
            isTLUser
          })
        } 
      }
    })
  },
  // 关闭模态框
  closeModal(e) {
    let id = e.target.dataset.id
    if (id) {
      this.setData({
        showModal: false
      })
    }
  },
  // 去设置页面
  toSetting(e) {
    if(e.detail.errMsg.indexOf('fail') < 0) {
      wx.navigateTo({
        url: '/pages/mine/setting/setting',
      })
    }
  },
  // 显示规则tip
  showScoreTip() {
    // 获取积分规则
    cloudApi.getActivityRule('score').then(res => {
      if (res.result.data) {
       let rule = res.result.data[0].rule
        this.setData({
          scoreRule: rule.replace(/\s/g,'\n'),
          showScoreModal: true
        })
      }
    })
    this.setData({
      showScoreModal: true
    })
  },
  // 关闭tip
  closeScoreModal() {
    this.setData({
      showScoreModal: false
    })
  },
  // 复制
  copyText() {
    wx.setClipboardData({
      data: 'https://zt.chebaba.com/ext/campaign/im.html',
      success() {
        wx.showModal({
          title: '已复制到剪切板',
          content: '请使用手机浏览器打开复制的网址，\n联系客服',
          showCancel: false,
          confirmColor: '#cd0124',
        })
      }
    })
  },
  // 去车主认证
  toOwnerVarify() {
    let orderStatus = this.data.orderStatus
    if (!orderStatus) {
      wx.showModal({
        title: '尊贵的朋友',
        content: '您的订单信息还未同步，\n暂时不能进行车主认证！',
        showCancel: false,
        confirmColor: '#cd0124',
      })
    } else {
      wx.navigateTo({
        url: '/pages/mine/owner/owner',
      })
    }
  },
  // 分享
  onShareAppMessage: function () {
    return {
      title: '天纵联盟',
      path: `/pages/index/index`,
      imageUrl: '/resource/imgs/minip_intro.jpg'
    }
  }
})