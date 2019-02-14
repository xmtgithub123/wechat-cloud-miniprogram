const cloudApi = require('../../api/index.js')
const localStorageKey = require('../../config/localStorageKey.js')
const activityApi = require('../../api/activity.js')

Page({
  data: {
    detailImg: '',
    detailHeader: '',
    isSubmit: false,
    decalerList: [],
    showPicker: false,
    site: '请选择',
    participantList: [], // 参与者-最多显示四个
    noticeText: '',
    showNotice: false,
    activityInfo: '',
    from: '',
    showShare: false, // 是否显示分享
    shareImg: '', // 分享图片地址 
    remoteShareBg: '', // 远程分享图片地址
    isJoin: false, // 是否已经参加活动
    isSave: false, // 是否已经保存
    showWinner: false, // 是否显示中奖名单
    isClose: false,
    winnerList: {
      ticket: [],
      model: []
    }
  },
  onLoad: function(options) {
    // 来源 正常访问或分享
    let from = options.from
    if (from) {
      this.setData({
        from
      })
    }
   
    // 获取海报背景图
    let self = this
    wx.cloud.downloadFile({
      fileID: 'cloud://yx-8d220c.7978-yx-8d220c/post_bg_2.png',
      success(res) {
        self.setData({
          remoteShareBg: res.tempFilePath
        })
      }
    })
    // 获取活动图片
    cloudApi.getActivityImg().then(res => {
      if (res.result.data) {
        let img = res.result.data.find(val => {
          return val.isDetail
        })
        let header = res.result.data.find(val => {
          return val.isDetailHeader
        })
        if (img) {
          this.setData({
            detailImg: img.imgUrl
          })
        }
        if (header) {
          this.setData({
            detailHeader: header.imgUrl
          })
        }
      }
    })
    // // 获取当前活动信息
    // let id = options.id
    // cloudApi.getArticleById(id).then(res => {
    //   if (res.result.data) {
    //     this.setData({
    //       activityInfo: res.result.data
    //     })
    //   }
    // })
    // // 每次进入都会增加访问量
    // cloudApi.updateArticleViewCount(id)
  },
  onShow() {
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    if (userInfo) {
      // 获取经销商列表
      activityApi.getDealerList().then(res => {
        if (res.code == 0) {
          this.setData({
            decalerList: res.data
          })
        }
      })
      // 从本地获取是否参加活动的信息
      let isJoin = wx.getStorageSync(localStorageKey.IS_JOIN)
      let isSave = wx.getStorageSync(localStorageKey.IS_SAVE)
      // 从远程获取用户参加活动的信息
      if (!isJoin) {
        // 本地没有数据，从远程获取
        activityApi.checkUserIsJoinActivity(userInfo.phoneNumber).then(res => {
          if (res.code == 0) {
            if (res.data && res.data != 'null') {
              this.setData({
                site: { storeName: res.data },
                isJoin: true
              })
              wx.setStorageSync(localStorageKey.IS_JOIN, true)
              wx.setStorageSync(localStorageKey.POST_INFO, { storeName: res.data })
            }
          }
        })
      } else {
        // 已参加
        this.setData({
          isJoin: true
        })
      }
      if (isSave) {
        this.setData({
          isSave: true
        })
      }
      // 获取已经参加活动的人
      activityApi.getActivityParticipant().then(res => {
        if (res.code == 0) {
          let data = res.data
          if (data.length > 4) {
            data = data.slice(0, 4)
          }
          this.setData({
            participantList: data
          })
        }
      })
      // 判断是否需要显示活动中奖名单
      activityApi.getWinner().then(res => {
        if (res.code == 0) {
          let winnerList = this.data.winnerList
          let data = res.data.map(val => {
            val.phoneNumber = val.phoneNumber.toString().replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
            if (val.name.length > 2) {
              val.name = val.name.replace(/(.{1}).*(.{1}$)/, "$1*$2")
            } else {
              val.name = val.name.substring(0, 1) + '*'
            }
            return val
          })
          winnerList.ticket = res.data.filter(val => {
            return val.prizeInfo.indexOf('门票') > -1
          })
          winnerList.model = res.data.filter(val => {
            return val.prizeInfo.indexOf('车模') > -1
          })
          this.setData({
            showWinner: true,
            winnerList,
            isClose: true
          })
        }
      })
      
    }
  },
  
  // 返回
  goBack() {
    let from = this.data.from
    if (from == 'share') {
      wx.switchTab({
        url: '/pages/activity/activity',
      })
    } else {
      wx.navigateBack({})
    }
  },
  // 打开经销商选择页面
  showSelectDealerPicker() {
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    let isJoin = this.data.isJoin
    let isSave = this.data.isSave
    if (userInfo) {
      // 已参加活动未保存海报
      if (isJoin && !isSave) {
        let site = wx.getStorageSync(localStorageKey.POST_INFO)
        this.setData({
          site
        })
        this.drawShareImg()
      } else if (!isJoin) {
        this.setData({
          showPicker: true
        })
      }
    } else {
      wx.navigateTo({
        url: '/pages/login/login',
      })
    }
  },
  // 选择经销商
  selectDealer(e) {
    let index = +e.detail.value
    let site = this.data.decalerList[index]
    this.setData({
      site
    })
  },
  // 提交信息
  submitInfo() {
    let site = this.data.site
    let isSubmit = this.data.isSubmit
    if (isSubmit) return
    if (!site.storeName) {
      this.setData({
        noticeText: '请先选择经销商',
        showNotice: true
      })
      return
    }
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    let data = {
      name: userInfo.name,
      phoneNumber: userInfo.phoneNumber,
      activityId: 1,
      dealerId: site.dealerId,
      headImg: userInfo.avatarUrl
    }
    this.setData({
      isSubmit: true
    })
    activityApi.saveActivity(data).then(res => {
      if (res.code == 0) {
        wx.showToast({
          title: '参加成功',
        })
        this.setData({
          showPicker: false,
          isJoin: true
        })
        // 存储本地参加信息
        wx.setStorageSync(localStorageKey.IS_JOIN, true)
        wx.setStorageSync(localStorageKey.POST_INFO, site)
        let st = setTimeout(() => {
          this.drawShareImg()
        }, 1500)
      } else {
        this.setData({
          noticeText: res.msg ? res.msg : '提交失败',
          showNotice: true
        })
      }
    }).catch(err => {
      this.setData({
        noticeText: '提交失败',
        showNotice: true
      })
    }).finally(() => {
      this.setData({
        isSubmit: false
      })
    })
  },
  // 绘制海报
  drawShareImg() {
    wx.showLoading({
      title: '正在生成...',
    })
    let si = setInterval(() => {
      let remoteShareBg = this.data.remoteShareBg
      if (!remoteShareBg) {
        return
      }
      clearInterval(si)
      wx.hideLoading()
      let site = this.data.site
      let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
      let self = this
      // 获取画布ctx
      const ctx = wx.createCanvasContext('shareCanvas', this)
      ctx.drawImage(remoteShareBg, 0, 0, 1200, 1630)
      ctx.setFillStyle('#333333')
      ctx.setFontSize(60)
      let text = '东风日产第七代天籁盛意邀请'
      let widthE = ctx.measureText(text)
      ctx.fillText(text, (1200 / 2 - widthE.width / 2), 208 * 2)
      text = `${userInfo.nickName}`
      widthE = ctx.measureText(text)
      ctx.save()
      ctx.font = 'normal bold 60px sans-serif'
      ctx.fillText(text, (1200 / 2 - widthE.width / 2), (208 + 52) * 2)
      ctx.restore()
      text = '和您的朋友一起到'
      widthE = ctx.measureText(text)
      ctx.fillText(text, (1200 / 2 - widthE.width / 2), (208 + 52 +52) * 2)
      ctx.save()
      ctx.font = 'normal bold 60px sans-serif'
      text = `${site.storeName}专营店`
      widthE = ctx.measureText(text)
      text = `${site.storeName}`
      ctx.fillText(text, 1200 / 2 - widthE.width / 2, (262+52 +52) * 2)
      ctx.restore()
      text = '专营店'
      let widthE1 = ctx.measureText(text)
      ctx.fillText(text, 1200 / 2 + widthE.width / 2 - widthE1.width, (262 + 52 + 52) * 2)
      ctx.fillText('共同收看《时间的朋友》', 148.5 * 2, (314+52 +52) * 2)
      ctx.setFontSize(52)
      ctx.fillText('东风日产', 369 * 2, (399+52+52) * 2)
      ctx.fillText('2018年12月', 334.5 * 2, (436.5+52+52) * 2)
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          fileType: 'png',
          canvasId: 'shareCanvas',
          quality: 1,
          success(ress) {
            self.setData({
              shareImg: ress.tempFilePath,
              showShare: true
            })
          }
        })
      })
    }, 100)

  },
  //关闭弹层
  closePanel(e) {
    let id = e.target.dataset.id
    if (id == 'close') {
      this.setData({
        showPicker: false
      })
    }
    if (id == 'close-share') {
      this.setData({
        showShare: false
      })
    }
    if (id == 'close-winner') {
      this.setData({
        showWinner: false
      })
    }
  },
  // 保存图片
  saveImg() {
    let self = this
    wx.showLoading({
      title: '正在保存...',
    })
    wx.saveImageToPhotosAlbum({
      filePath: this.data.shareImg,
      success(res) {
        wx.hideLoading()
        wx.showToast({
          title: '已保存到相册',
        })
        self.setData({
          showShare: false,
          isSave: true
        })
        // 存储本地参加信息
        wx.setStorageSync(localStorageKey.IS_SAVE, true)
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          title: '保存失败',
        })
      }
    })
  },
  // 活动按钮
  copyText() {
    wx.setClipboardData({
      data: 'https://www.chebaba.com/clue_activity_retention-1-71195.html',
      success() {
        wx.showModal({
          title: '已复制到剪切板',
          content: '请使用手机浏览器打开复制的网址，\n参与活动',
          showCancel: false,
          confirmColor: '#cd0124',
        })
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let activityInfo = this.data.activityInfo
    cloudApi.updateArticleShareNum(activityInfo._id)
    return {
      title: activityInfo.title,
      path: `/pages/activity/activity?from=share`,
      imageUrl: 'https://7978-yx-8d220c-1258124532.tcb.qcloud.la' + activityInfo.cover.slice(activityInfo.cover.lastIndexOf('/'))
    }
  }
})