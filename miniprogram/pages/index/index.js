const localStorageKey = require('../../config/localStorageKey.js')
const cloudApi = require('../../api/index.js')
const transformRpx = require('../../plugins/transformRpx.js')
Page({
  data: {
    isShowVideo: false,
    videoSrc: '',
    videoHeight: 0,
    videoWidth: 0,
  },
  onLoad: function (options) {  
    this.toList()
    // 获取设备信息
    // const videoRatio = 1920 / 1080
    // const info = wx.getSystemInfoSync()
    // let videoWidth = info.windowWidth
    // let windowRestHeight = info.windowHeight
    // let videoHeight = Math.floor(videoWidth / videoRatio)
    // if (windowRestHeight < videoHeight) {
    //   videoHeight = Math.floor(windowRestHeight)
    //   videoWidth = Math.floor(videoHeight * videoRatio)
    // }
    // this.setData({
    //   videoHeight,
    //   videoWidth
    // })
    // cloudApi.checkIndexVideoIsUpdate().then(res => {
    //   if (res.result.data && res.result.data[0]) {
    //     let version = res.result.data[0].version
    //     let localVer = wx.getStorageSync(localStorageKey.LOCAL_VIDEO_VER)
    //     if (localVer && version === localVer) {
    //       let path = wx.getStorageSync(localStorageKey.INDEX_MOVIE_PATH)
    //       if (path) {
    //         this.setData({
    //           videoSrc: path
    //         })
    //       } else {
    //         this.downloadIndexMovie()
    //       }
    //     } else {
    //       wx.setStorageSync(localStorageKey.LOCAL_VIDEO_VER, version)
    //       this.downloadIndexMovie()
    //     }
    //   }
    // }).catch(res => {
    //   this.downloadIndexMovie()
    // })
  },
  onShow() {
    // setTimeout(() => {
    //   this.toList()
    // },3000)
  },
  downloadIndexMovie() {
    let self = this
    let path = wx.getStorageSync(localStorageKey.INDEX_MOVIE_PATH)
    if (path) {
      wx.removeSavedFile({
        filePath: path
      })
    }
    //
    wx.cloud.downloadFile({
      fileID: 'cloud://yx-8d220c.7978-yx-8d220c/dh.mp4', // 文件 ID
      success: res => {
        // 返回临时文件路径
        let tempPath = res.tempFilePath
        wx.saveFile({
          tempFilePath: tempPath,
          success(ress) {
            tempPath = ress.savedFilePath
            self.setData({
              videoSrc: tempPath
            })
            wx.setStorageSync(localStorageKey.INDEX_MOVIE_PATH, tempPath)
          },
          fail(err) {
            self.setData({
              videoSrc: tempPath
            })
          }
        })
      },
      fail: console.error
    })
  },
  // 去列表页面
  toList() {
    wx.reLaunch({
      url: '/pages/list/list',
    })
  },
  showVideo() {
    this.setData({
      isShowVideo: true
    })
  },
  onShareAppMessage: function () {
   
  }
})