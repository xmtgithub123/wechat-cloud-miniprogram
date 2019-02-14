// pages/share/index.js
const localStorageKey = require('../../config/localStorageKey.js')
const cloudApi = require('../../api/index.js')
const moment = require('../../config/moment.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    h5url:'',
    isShareFlag:0,
    isEnd:false,
    baseUrl:'',
    shareUserId:'',
    answerEndTime:'',
    activityId:'',
    isAddValue:'',
    currentUserShareId:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    
    that.setData({
      baseUrl: options.url,
      shareUserId: options.shareUserId,
      activityId: options.activityId,
    })
    cloudApi.getActivityList().then(res => {
      console.log(res)
      let data = res.result.data

      data.map((val) => {
        console.log(val)
        if (val._id == options.activityId) {
          let currentTime = moment(new Date).format('YYYY-MM-DD HH:mm:ss');
          let endTime = moment(val.endTime).format('YYYY-MM-DD HH:mm:ss');
          console.log(endTime)
          that.setData({
            answerEndTime:endTime
          })
          let startTime = moment(val.startTime).format('YYYY-MM-DD HH:mm:ss')
          if (currentTime > endTime) {
            that.setData({
              isEnd: 1
            })
          }
          else {
            that.setData({
              isEnd: 0
            })
          }
         
        }
        return val
      })
      that.setData({
        activityInfo:data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that =this;
    let _userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    if (!_userInfo) {
      wx.navigateTo({
        url: '/pages/login/login?shareUserId=' + that.data.shareUserId,
      })
    }
    else{
      //console.log(that.data.answerEndTime)
      var endTime;
      let userToken = _userInfo.token.split('Bearer ')[1]
      let currentUserShareId = _userInfo.id
      var isEnd = that.data.isEnd
      console.log(that.data.baseUrl)
      setTimeout(()=> {
        let url = `${that.data.baseUrl}?token=${userToken}&um=${encodeURIComponent(_userInfo.nickName)}&avatarUrl=${_userInfo.avatarUrl}&isEnd=${isEnd}&activityId=${that.data.activityId}&answerEndTime=${encodeURIComponent(that.data.answerEndTime)}`
        this.setData({
          h5url: url,
          currentUserShareId: currentUserShareId
        });
        console.log(url)
      },1000)
     
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  bindmessage(e) {
    console.log(e)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    console.log(res)
    let that = this;
    let returnURL = res.webViewUrl;
    // let returnURL = res.webViewUrl;
 
    return {
      title: '天纵夺宝',
      path: '/pages/share/index?url=' + that.data.baseUrl + '&shareUserId=' + that.data.currentUserShareId + '&activityId=' + that.data.activityId,
      imageUrl: '/resource/imgs/activity_header.jpg',
      success: function (r) {
      }
    }
  }
})