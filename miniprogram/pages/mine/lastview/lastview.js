const Formatter = require('../../../utils/Formatter.js')
const localStorageKey = require('../../../config/localStorageKey.js')
Page({
  data: {
    nowPage: 1,
    hasNext: false,
    viewList: [], // 已浏览列表
    isLoading: false
  },
  onLoad: function (options) {
    let readInfos = wx.getStorageSync(localStorageKey.LOCAL_READ_INFO)
    let hasNext = this.data.hasNext
    if (readInfos && readInfos.length) {
      if (readInfos.length > 10) {
        readInfos = readInfos.slice(0, 10)
        hasNext = true
      }
      let viewList = readInfos.map(val => {
        val.createTime = Formatter.formatTime(val.createTime)
        return val
      })
      this.setData({
        viewList,
        hasNext
      })
    }
  },
  // 加载更多
  loadMore() {
    let hasNext = this.data.hasNext
    if (hasNext && !this.data.isLoading) {
      this.setData({
        isLoading: true
      }, () => {
        let nowPage = this.data.nowPage
        let start = nowPage * 10
        nowPage++
        let end = nowPage * 10
        let readInfos = wx.getStorageSync(localStorageKey.LOCAL_READ_INFO)
        if (readInfos.length <= end) {
          hasNext = false
          readInfos = readInfos.slice(start, readInfos.length)
        } else {
          hasNext = true
          readInfos = readInfos.slice(start, end)
        }
        let viewList = this.data.viewList
        viewList.push(...readInfos.map(val => {
          val.createTime = Formatter.formatTime(val.createTime)
          return val
        }))
        this.setData({
          hasNext,
          viewList,
          isLoading: false
        })
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