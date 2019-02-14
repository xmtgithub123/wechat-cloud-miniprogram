const cloudApi = require('../../api/index.js')
const Formatter = require('../../utils/Formatter.js')
const createRecycleContext = require('miniprogram-recycle-view')
const localStorageKey = require('../../config/localStorageKey.js')
const moment = require('../../config/moment.js')
const transformRpx = require('../../plugins/transformRpx.js')
const userApi = require('../../api/user.js')
const listTabs = require('../../config/listTabs.js') 

let submiting = false
Page({
  data: {
    pageTabs: [],
    listDatas: {}, // tab数据
    nowTab: 0,  // 当前的tab
    tabId: '', // 当前tab的id
    tabOffset: {},
    pageInfo: {}, // 分页信息
    headerSwiperIndex: 0, // 当前头部swiper的下标
    headerSwiperImgs: [], // 当前头部展示的图片列表
    listHeight: 0, // 列表高度
    pageHeight: 0, // 页面高度
    isScroll: false, // 控制列表滚动部分是否滚动
    scrollTop: transformRpx('412rpx'), // 头部高度，用于计算是否让列表滚动部分滚动
    isShowIntroPanel: false, // 介绍弹层，只显示一次
    isRefresh: false, // 是否刷新页面
    showModal: false,// 是否显示modal
    modalText: '', // modal显示的文字
  },
  onLoad: function (options) {
    let info = wx.getSystemInfoSync()
    this.setData({
      listHeight: info.windowHeight - transformRpx('72rpx'),
      pageHeight: info.windowHeight
    })
    // 加载banner列表
    this.getBannerList()
    this.listTabsInit()
  },
  onReady() {
    let listIntro = wx.getStorageSync(localStorageKey.LIST_INTRO)
    if (!listIntro) {
      let st = setTimeout(() => {
        clearTimeout(st)
        this.setData({
          isShowIntroPanel: true
        })
      }, 1000)
    }
  },
  onShow() {
    this.positionTabSlide()
    // 获取用户订单状态

    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
   // console.log(userInfo)
    this.getBannerList()
    if (userInfo) {
      let orderIsCheck = wx.getStorageSync(localStorageKey.ORDER_IS_CHECK)
      if (orderIsCheck) return
      let orderStatus = wx.getStorageSync(localStorageKey.ORDER_STATUS)
      userApi.checkCarOwner(+userInfo.phoneNumber).then(res => {
        if (res.code == 0) {
          if (res.data) {
            let status = res.data.orderType
            let showModal = false
            let modalText = ''
            if (status.indexOf('已交车') < 0) {
              if (!orderStatus || orderStatus.indexOf('下订客户') < 0) {
                orderStatus = '下订客户'
                showModal = true
                modalText = `感谢您下订${res.data.carSeries} ${res.data.carType}车型，欢迎加入天纵联盟大家庭`
              }
            }
            if (status && status.indexOf('已交车') > -1) {
              if (!orderStatus || orderStatus.indexOf('认证车主') < 0) {
                orderStatus = '认证车主'
                showModal = true
                modalText = `恭喜您已提${res.data.carSeries} ${res.data.carType}车型`
              }
            }
            this.setData({
              modalText,
              showModal
            })
            wx.setStorageSync(localStorageKey.ORDER_STATUS, orderStatus)
          } else {
            if (!orderStatus) {
              orderStatus = '暂未匹配'
              this.setData({
                modalText: '非常感谢您对第七代天籁的关注。\n想继续获取更多天籁信息，请继续关注东风日产第七代天籁官方车主社区——天纵联盟，或垂询当地经销商。',
                showModal: true,
                orderStatus
              })
              wx.setStorageSync(localStorageKey.ORDER_STATUS, orderStatus)
            }
          }
        }
      })
    }
  },
  /**
   * 列表页tab展现
   */
  listTabsInit() {
    let listDatas = this.data.listDatas
    let pageInfo = this.data.pageInfo
    let pageTabs = this.data.pageTabs
    listTabs.forEach((val,index) => {
      if (val.isShow) {
        listDatas[val.alias] = []
        pageInfo[val.alias] = { currentPage: 1, pageSize: 10, hasNext: true, isLoading: false }
        pageTabs.push(val)
      }
    })
    this.setData({
      listDatas,
      pageInfo,
      pageTabs,
      tabId: pageTabs[0].alias
    })
    this.loadListData()
  },
  /**
   * 滑动tab 下方的滚动条
   */
  positionTabSlide() {
    let tabOffset = this.data.tabSlideLeft
    const tab = this.data.nowTab
    const query = wx.createSelectorQuery()
    query.selectAll('.tab').fields({
      rect: true,
      size: true
    })
    query.exec(list => {
        tabOffset = list[0][tab]
        tabOffset.left = tabOffset.left - transformRpx('40rpx')
        this.setData({
          tabOffset
        })
    })
  },
  // 复制
  copyText() {
    wx.setClipboardData({
      data: 'https://www.chebaba.com/clue_activity_retention-1-71194.html',
      success() {
        wx.showModal({
          title: '已复制到剪切板',
          content: '请使用手机浏览器打开复制的网址，\n进行预约试驾！',
          showCancel: false,
          confirmColor: '#cd0124',
        })
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
  // 关闭小程序介绍
  closeIntro() {
    this.setData({
      isShowIntroPanel: false
    })
    wx.setStorageSync(localStorageKey.LIST_INTRO, true)
  },
  // 监听页面滚动
  onPageScroll(e) {
    if (e.scrollTop >= this.data.scrollTop && !this.data.isScroll) {
      this.setData({
        isScroll: true
      })
    } else if (e.scrollTop < this.data.scrollTop && this.data.isScroll) {
      this.setData({
        isScroll: false
      })
    }
  },
  // 下拉刷新
  onPullDownRefresh(e) {
    if (this.data.showModal) {
      wx.stopPullDownRefresh()
      return
    }
    let tab = this.data.nowTab 
    this.resetPageInfo(tab)
    this.setData({
      isRefresh: true
    })
    this.loadListData()
  },
  // 重置pageInfo
  resetPageInfo(tab) {
    let pageInfoItem = { currentPage: 1, pageSize: 10, hasNext: true, isLoading: false}
    let pageInfo = this.data.pageInfo
    let tabId = this.data.tabId
    let pageIndoStr = `pageInfo.${tabId}`
    this.setData({
      [pageIndoStr]: pageInfoItem
    })
  },
  // 关闭下拉刷新动画
  stopRefresh() {
    wx.stopPullDownRefresh()
    this.setData({
      isRefresh: false
    })
  },
  // 加载更多
  loadMore(e) {
    let tab = this.data.nowTab
    let tabId = this.data.tabId
    let pageInfo = this.data.pageInfo[tabId]
    if (pageInfo.isLoading) return
    if (!pageInfo.hasNext) {
      wx.showToast({
        title: '没有更多了',
        icon: 'none'
      })
      return
    }
    this.loadListData()
  },
  // 头部swiper自动切换事件
  headerSwiperChange(e) {
    let index = e.detail.current
    this.setData({
      headerSwiperIndex: index
    })
  },
  // 切换tab
  switchTab(e) {
    let tab = +e.target.dataset.tab
    let id = e.target.dataset.id
    if (id) {
      this.setData({
        nowTab: tab,
        tabId: id
      })
      this.positionTabSlide()
    }
   
  },
  // 切换tab内容
  changePageSwiper(e) {
    let tab = e.detail.current
    let listDatas = this.data.listDatas
    let pageTabs = this.data.pageTabs
    let tabId = pageTabs[tab].alias
    this.setData({
      nowTab: tab,
      tabId
    })
    this.positionTabSlide()
    if (!listDatas[tabId].length) {
      this.loadListData()
    }
  },
  /**
   * 加载数据
   */
  loadListData() {
    wx.showLoading({
      title: '正在加载...',
    })
    const tab = this.data.nowTab
    const tabId = this.data.tabId
    const pageTabs = this.data.pageTabs
    let pageInfo = this.data.pageInfo[tabId]
    let listDatas = this.data.listDatas

    let pageInfoStr = `pageInfo.${tabId}`
    let listDataStr = `listDatas.${tabId}`

    // 此列表正在加载
    pageInfo.isLoading = true
    this.setData({
      [pageInfoStr]: pageInfo
    })
    cloudApi[pageTabs[tab].func](Object.assign({}, pageTabs[tab].funcData, pageInfo))
      .then(res => {
        let data = res.result.data
        let count = res.result.count
        if (data && data.length) {
          // 检查是否点赞
          data = this.checkIsLike(data)
          if (data.length < pageInfo.pageSize 
              || pageInfo.currentPage * pageInfo.pageSize === count) {
            pageInfo.hasNext = false
          } else {
            pageInfo.currentPage++
          }
          data = data.map(val => {
            val.createtime = moment(val.createtime).fromNow()
            return val
          })
          // 此列表加载完毕
          pageInfo.isLoading = false
          this.setData({
            [listDataStr]: data,
            [pageInfoStr]: pageInfo
          })
          wx.hideLoading()
          // 关闭下拉刷新界面
          this.stopRefresh()
        } else {
          wx.hideLoading()
          // 关闭下拉刷新界面
          this.stopRefresh()
        }
      })
  },
  // 去详情页
  toDetail(e) {
    let type = e.detail.type
    let id = e.detail.id
    let isActivity = e.detail.isActivity
    let activityUrl = e.detail.activityUrl
    if (isActivity) {
      wx.navigateTo({
        url: `/pages/web-view/web-view?url=${val.activityUrl}`,
      })
      return 
    }
    if (type == 1 || type == 5) {
      wx.navigateTo({
        url: `/pages/article/article?id=${id}`,
      })
    } else if (type == 2 || type == 6) {
      wx.navigateTo({
        url: `/pages/video/video?id=${id}`,
      })
    }
  },
  // 检查文章或视频是否已经被此用户点赞
  checkIsLike(data) {
    let likeInfo = wx.getStorageSync(localStorageKey.LIKE_INFO)
    if (!likeInfo) {
      likeInfo = []
    }
    let isLike = false
    return data.map(val => {
      val.isLike = likeInfo.includes(val._id)
      return val
    })
  },
  // 切换点赞
  switchLike(e) {
    let item = e.detail
    let likeInfo = wx.getStorageSync(localStorageKey.LIKE_INFO)
    if (!likeInfo) {
      likeInfo = []
    }
    item.isLike = !item.isLike
    cloudApi.updateArticleLikeNum(item._id, item.isLike).then(res => {
      if (res.result.stats.updated) {
        // 将此文章id存入用户点赞信息中
        if (item.isLike) {
          likeInfo.push(item._id)
        } else {
          likeInfo.splice(likeInfo.indexOf(item._id), 1)
        }
        wx.setStorageSync(localStorageKey.LIKE_INFO, likeInfo)
      }
    })
  },
  // 获取banner列表
  getBannerList() {
    cloudApi.getBannerList().then(res => {
      let data = res.result.data
      if (data && data.length) {
        data = data.map(val => {
          if (val.isActivity) {
            val.url = '/pages/activity-detail/detail'
          } else if (val.type == 1) {
            val.url = "/pages/article/article?id=" + val.articleId
          } else if (type == 2) {
            val.url = "/pages/article/article?id=" + val.articleId
          }
          return val
        })
        this.setData({
          headerSwiperImgs: data
        })
      }
    })
  },
  // 分享
  onShareAppMessage(e) {
    if (e.target && e.target.dataset.item) {
      let item = e.target.dataset.item
      // 获取本地存储的用户分享信息
      let shareInfo = wx.getStorageSync(localStorageKey.SHARE_INFO)
      if (!shareInfo) {
        shareInfo = []
      }
      if (!submiting && !shareInfo.includes(item._id)) {
        submiting = true
        cloudApi.updateArticleShareNum(item._id).then(res => {
          submiting = false
          shareInfo.push(item._id)
          wx.setStorageSync(localStorageKey.SHARE_INFO, shareInfo)
        })
      }
      return {
        title: item.title,
        path: item.type === 1 ? `/pages/article/article?id=${item._id}&from=share` : `/pages/video/video?id=${item._id}&from=share`,
        imageUrl: 'https://7978-yx-8d220c-1258124532.tcb.qcloud.la' + item.cover.slice(item.cover.lastIndexOf('/'))
      }
    } else {
      return {
        title: '天纵联盟',
        path:  `/pages/index/index`,
        imageUrl: '/resource/imgs/minip_intro.jpg'
      }
    }
  },
})