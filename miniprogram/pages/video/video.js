const cloudApi = require('../../api/index.js')
const WxParse = require('../../plugins/wxParse/wxParse.js')
const wechatApi = require('../../api/wechatApi.js')
const remoteConfig = require('../../config/remoteConfig.js')
const localStorageKey = require('../../config/localStorageKey.js')
const moment = require('../../config/moment.js')
let submiting = false // 是否正在提交
Page({
  data: {
    video: "",
    reVideoList: [], // 推荐视频列表
    isShowPage: false,
    isLike: false, // 是否点赞
    isFromShare: false, // 是否来自分享
    shareInfo: { // 分享相关
      headerImg: '',
      articleQRCode: '',
      shareImg: '',
      finger: '',
      avatarUrl: ''
    },
    isShowModal: false,
    shareTip: '',
    hasAuthToSave: false,
    toSetting: false
  },
  onLoad: function (options) {
    let scene = options.scene
    let id = options.scene ? options.scene : options.id ? options.id : 'XAD5GSfIZl09sSBF'
    let from = options.from
    if (from || scene) {
      this.setData({
        isFromShare: true
      })
    }
    id = id.replace(/\s/g, '')
    wx.showLoading({
      title: '正在加载...',
    })
    cloudApi.getArticleById(id).then(res => {
      let video = res.result.data
      let content = video.article
      delete video.article
      video.createtime = moment(video.createtime).fromNow()
      if (content) {
        WxParse.wxParse('content', 'html', content, this, 20, () => {
          // 待解析完成后，显示页面
          this.setData({
            isShowPage: true
          }, () => {
            wx.hideLoading()
          })
        })
      } else {
        this.setData({
          isShowPage: true
        }, () => {
          wx.hideLoading()
        })
      }
      // 判断是否已经点赞
      this.judgmentIsLikeThisVideo(video._id)
      // 显示推荐阅读
      this.getRecommendationVideoList(video._id)
      this.setData({
        video
      }, () => {
        // 添加视频浏览数
        this.addVideoViewCount()

        this.downloadArticleHeaderImg()
        this.downloadArticleQRCode()
      })
    })
  },
  //canvas - 预先下载文章头图
  downloadArticleHeaderImg() {
    let self = this
    let article = this.data.video
    wx.cloud.downloadFile({
      fileID: article.cover,
      success(res) {
        self.setData({
          'shareInfo.headerImg': res.tempFilePath
        })
      }
    })
    wx.cloud.downloadFile({
      fileID: 'cloud://yx-8d220c.7978-yx-8d220c/finger.png',
      success(res) {
        self.setData({
          'shareInfo.finger': res.tempFilePath
        })
      }
    })
    // 如果已授权，则下载用户头像
    wx.getUserInfo({
      success(res) {
        let avatarUrl = res.userInfo.avatarUrl
        self.downloadUrl(avatarUrl, (res) => {
          self.setData({
            'shareInfo.avatarUrl': res.tempFilePath
          })
        })
      }
    })
  },
  // canvas - 预先下载文章分享二维码
  downloadArticleQRCode() {
    let article = this.data.video
    const self = this
    wechatApi.getShareQRCode('pages/video/video', article._id).then(res => {
      if (res.code === 0) {
        this.downloadUrl(remoteConfig.domain + res.data, (res) => {
          self.setData({
            'shareInfo.articleQRCode': res.tempFilePath
          })
        })
      }
    })
  },
  // canvas -下载
  downloadUrl(url, cb) {
    wx.downloadFile({
      url,
      success(res) {
        cb(res)
      }
    })
  },
  onShow() {
    // 查看是否具有保存到相册的权限
    let self = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.writePhotosAlbum'] === false) {
          self.setData({
            hasAuthToSave: false,
            toSetting: false
          })
        } else if (res.authSetting['scope.writePhotosAlbum'] === true) {
          if (self.data.toSetting) {
            self.saveImage()
          }
          self.setData({
            hasAuthToSave: true,
            toSetting: false
          })
        }
      }
    })
  },
  // canvas - openSetting
  openSetting() {
    let self = this
    wx.openSetting({
      success() {
        self.setData({
          toSetting: true
        })
      }
    })
  },
  // canvas - 分享
  clickPengyouquan(e) {
    if (e.detail.errMsg.indexOf('ok') > -1) {
      let userInfo = e.detail.userInfo
      let article = this.data.video
      let shareInfo = this.data.shareInfo
      if (!shareInfo.headerImg || !shareInfo.articleQRCode || !shareInfo.finger) {
        wx.showModal({
          title: '下载中...',
          content: '资源正在下载，请稍后重试',
          confirmText: '确定',
          confirmColor: '#cd0124',
          showCancel: false
        })
        return
      }
      wx.showLoading({
        title: '正在生成...',
      })
      if (!shareInfo.avatarUrl) {
        // 下载用户头像
        this.downloadUrl(userInfo.avatarUrl, (res) => {
          shareInfo.avatarUrl = res.tempFilePath
          // 绘制
          this.drawShareImg(userInfo, article, shareInfo)
        })
      } else {
        // 绘制
        this.drawShareImg(userInfo, article, shareInfo)
      }
    }
  },
  // canvas - 绘制分享图
  drawShareImg(userInfo, article, shareInfo) {
    const self = this
    // 扩大1倍
    const headerImgSize = {
      width: 555 * 2,
      height: 372 * 2
    }
    const tagPos = {
      dx: 46 * 2,
      dy: 320 * 2
    }
    const tagWrpPos = {
      dx: 24 * 2,
      dy: 313 * 2,
      width: 80 * 2,
      height: 32 * 2,
      radius: 16 * 2,
      lx: (24 + 16) * 2,
      ly: (313 + 16) * 2,
      rx: (24 + 80 - 16) * 2,
      ry: (313 + 16) * 2,
      lineW: (80 - 32) * 2
    }
    const titlePos = {
      dx: 24 * 2,
      dy: 410 * 2,
    }
    this.getDrawImgSize(headerImgSize, shareInfo.headerImg).then(res => {
      const ctx = wx.createCanvasContext('share', this)
      let { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } = res
      // 画白色背景
      ctx.rect(0, 0, 1110, 1436)
      ctx.fillStyle = 'white'
      ctx.fill()
      ctx.beginPath()
      // 画头图
      ctx.drawImage(shareInfo.headerImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)

      // 画tag
      ctx.moveTo(tagWrpPos.lx, tagWrpPos.ly + tagWrpPos.radius)
      ctx.arc(tagWrpPos.lx, tagWrpPos.ly, tagWrpPos.radius, Math.PI * 0.5, Math.PI * 1.5, 0)
      ctx.lineTo(tagWrpPos.dx + tagWrpPos.lineW, tagWrpPos.ry - tagWrpPos.radius)
      ctx.arc(tagWrpPos.rx, tagWrpPos.ry, tagWrpPos.radius, Math.PI * 1.5, Math.PI * 0.5, 0)
      ctx.closePath()
      ctx.fillStyle = '#4e4c4d'
      ctx.fill()
      // 画tag中的文字
      ctx.fillStyle = 'white'
      ctx.font = '36px Arial'
      ctx.setTextBaseline('top')
      ctx.fillText('视频', tagPos.dx, tagPos.dy)
      // 画标题
      ctx.fillStyle = 'black'
      ctx.font = '48px Arial'
      let titleW = ctx.measureText(article.title)
      const baseLineW = headerImgSize.width - 48 * 2
      // 从这里开始使用相对位置，因为文章标题不确定有几行，所以都是相对文章标题的位置来画
      let lastPos = {
        dx: titlePos.dx,
        dy: titlePos.dy
      }
      if (titleW.width > baseLineW) {
        let oneStrWidth = titleW.width / article.title.length
        let oneLineStrNum = Math.floor(baseLineW / oneStrWidth)
        let lineNum = baseLineW % oneStrWidth === 0 ? baseLineW % oneStrWidth : Math.floor(titleW.width / baseLineW) + 1
        let texts = []
        for (let i = 0; i < lineNum; i++) {
          texts.push(article.title.slice(i * oneLineStrNum, (i + 1) * oneLineStrNum))
        }
        texts.forEach((val, index) => {
          ctx.fillText(val, titlePos.dx, titlePos.dy + index * 65)
        })
        lastPos.dy = lastPos.dy + (texts.length - 1) * 50
      } else {
        ctx.fillText(article.title, titlePos.dx, titlePos.dy)
      }
      // 画头像
      const portraitPos = {
        dx: 30 * 2,
        dy: lastPos.dy + 55 * 2,
        width: 59 * 2,
        height: 59 * 2
      }
      // 记录这次的dy位置
      lastPos.dy = portraitPos.dy

      ctx.beginPath()
      ctx.save()
      // 画一个遮罩
      ctx.arc(portraitPos.dx + portraitPos.width / 2, portraitPos.dy + portraitPos.height / 2, portraitPos.height / 2, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(shareInfo.avatarUrl, portraitPos.dx, portraitPos.dy, portraitPos.width, portraitPos.height)
      ctx.restore()
      // 画昵称及时间
      ctx.fillStyle = '#999999'
      ctx.font = '40px Arial'
      ctx.fillText(userInfo.nickName, portraitPos.dx + portraitPos.width + 18 * 2, portraitPos.dy + 10)
      ctx.font = '32px Arial'
      const data = moment().format('YYYY-MM-DD HH:mm')
      ctx.fillText(data, portraitPos.dx + portraitPos.width + 18 * 2, portraitPos.dy + 38 * 2)

      // 画其他内容
      ctx.font = '40px Arial'
      ctx.fillText('我在天纵联盟', lastPos.dx, lastPos.dy + 98 * 2)
      ctx.fillText('找到一条精彩内容。', lastPos.dx, lastPos.dy + 98 * 2 + 50)

      ctx.fillText('ALTIMA', lastPos.dx, lastPos.dy + 180 * 2)
      ctx.fillText('长按扫码查看详情', 380 * 2, lastPos.dy + 180 * 2)
      // 画二维码
      ctx.drawImage(shareInfo.finger, 375 * 2, lastPos.dy + 74 * 2, 81 * 2, 81 * 2);
      ctx.drawImage(shareInfo.articleQRCode, 375 * 2 + 81 * 2, lastPos.dy + 74 * 2, 84 * 2, 84 * 2)

      ctx.draw(true, (res) => {
        wx.canvasToTempFilePath({
          canvasId: 'share',
          fileType: 'jpg',
          quality: 0.8,
          success(res) {
            self.setData({
              'shareInfo.shareImg': res.tempFilePath,
              isShowModal: true,
            }, function () {
              self.saveImage(res.tempFilePath)
            })
          },
          complete() {
            wx.hideLoading()
          }
        }, this)
      })
    })
  },
  //canvas 获取图片裁减尺寸
  getDrawImgSize(targetSize, imgSrc) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: imgSrc,
        success(res) {
          const ratio = targetSize.width / targetSize.height
          let width = res.width
          let height = res.height
          let sx = 0
          let sy = 0
          let sWidth = width
          let sHeight = height
          let dx = 0
          let dy = 0
          let dWidth = targetSize.width
          let dHeight = targetSize.height
          if (width <= height) {
            // 竖图 - 宽度不变，计算裁减高度以及裁减的sy位置
            sHeight = width / ratio
            if (sHeight > height) {
              sHeight = height
              sWidth = height * ratio
              sx = (width - sWidth) / 2
            } else {
              sy = (height - sHeight) / 2
            }
          } else {
            // 横图 - 高度不变，计算裁减宽度以及裁减的sx位置
            sWidth = height * ratio
            if (sWidth > width) {
              sWidth = width
              sHeight = width / ratio
              sy = (height - sHeight) / 2
            } else {
              sx = (width - sWidth) / 2
            }
          }
          resolve({ sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight })
        },
        fail() {
          reject(false)
        }
      })
    })
  },
  //canvas -保存图片
  saveImage() {
    let self = this
    this.setData({
      shareTip: '正在为您保存图片...'
    })
    wx.saveImageToPhotosAlbum({
      filePath: self.data.shareInfo.shareImg,
      success(res) {
        self.setData({
          shareTip: '图片已为您保存到相册'
        })
      },
      fail(err) {
        let tip = ''
        if (self.data.hasAuthToSave) {
          tip = '您取消了保存图片'
        } else {
          tip = '您拒绝授权保存图片，点击此处授权后即可保存'
        }
        self.setData({
          shareTip: tip
        })
      }
    })
  },
  // 关闭modal
  closeModal() {
    this.setData({
      isShowModal: false
    })
  },
  // 返回
  goBack() {
    if (this.data.isFromShare) {
      // 来自分享
      wx.switchTab({
        url: '/pages/list/list',
      })
    } else {
      wx.navigateBack()
    }
  },
  // 分享
  onShareAppMessage: function () {
    let video = this.data.video
    // 获取本地存储的用户分享信息
    let shareInfo = wx.getStorageSync(localStorageKey.SHARE_INFO)
    if (!shareInfo) {
      shareInfo = []
    }
    if (!submiting && !shareInfo.includes(video._id)) {
      submiting = true
      cloudApi.updateArticleShareNum(video._id).then(res => {
        this.setData({
          'video.shareNum': video.shareNum ? video.shareNum + 1 : 1
        }, () => {
          submiting = false
          // 将此视频id存入用户分享信息中
          shareInfo.push(video._id)
          wx.setStorageSync(localStorageKey.SHARE_INFO, shareInfo)
        })
      })
    }
    return {
      title: video.title,
      path: `/pages/video/video?id=${video._id}&from=share`,
      imageUrl: 'https://7978-yx-8d220c-1258124532.tcb.qcloud.la' + video.cover.slice(video.cover.lastIndexOf('/')) 
    }
  },
  // 切换是否点赞视频
  switchLikeThisVideo() {
    let video = this.data.video
    let likeInfo = wx.getStorageSync(localStorageKey.LIKE_INFO)
    if (!likeInfo) {
      likeInfo = []
    }
    let isLike = false
    if (!likeInfo.includes(video._id)) {
      isLike = true
    }
    cloudApi.updateArticleLikeNum(video._id, isLike).then(res => {
      if (res.result.stats.updated) {
        let num = 1
        if (!isLike) {
          num = -1
        }
        this.setData({
          isLike,
          'video.likeNum': (video.likeNum || video.likeNum === 0) ? video.likeNum + num : 1
        }, () => {
          // 将此文章id存入用户点赞信息中
          if (isLike) {
            likeInfo.push(video._id)
          } else {
            likeInfo.splice(likeInfo.indexOf(video._id), 1)
          }
          wx.setStorageSync(localStorageKey.LIKE_INFO, likeInfo)
        })
      }
    })
  },
  // 判断是否已经点赞此视频
  judgmentIsLikeThisVideo(id) {
    id = id.replace(/\s/g, '')
    let likeInfo = wx.getStorageSync(localStorageKey.LIKE_INFO)
    if (!likeInfo) {
      likeInfo = []
    }
    let isLike = false
    if (likeInfo.includes(id)) {
      isLike = true
    }
    this.setData({
      isLike
    })
  },
  // 获取推荐视频
  getRecommendationVideoList(id) {
    id = id.replace(/\s/g, '')
    return cloudApi.getRecommendationArticleList(id, 2).then(res => {
      if (res.result) {
        this.setData({
          reVideoList: res.result
        })
      }
    })
  },
  // 跳转到推荐文章
  toVideo(event) {
    let id = event.currentTarget.dataset.id
    id = id.replace(/\s/g, '')
    wx.navigateTo({
      url: `/pages/video/video?id=${id}`,
    })
  },
  // 添加视频浏览数
  addVideoViewCount() {
    let video = this.data.video
    // 获取用户阅读信息，已经阅读过的不添加阅读量
    let localReadInfo = wx.getStorageSync(localStorageKey.LOCAL_READ_INFO)
    if (!localReadInfo) localReadInfo = []
    let index = localReadInfo.findIndex(val => val._id == video._id)
    if (index < 0) {
      cloudApi.updateArticleViewCount(video._id).then(res => {
        if (res.result.stats.updated) {
          this.setData({
            'video.viewCount': video.viewCount ? video.viewCount + 1 : 1
          }, () => {
            // 存储用户阅读信息
            localReadInfo.push({
              _id: video._id,
              cover: video.cover,
              title: video.title,
              type: video.type,
              createTime: new Date(),
            })
            // 只存储最近300条记录，防止本地存储爆满报错
            if (localReadInfo.length > 300) {
              let start = localReadInfo.length - 300
              localReadInfo = localReadInfo.slice(start)
            }
            wx.setStorageSync(localStorageKey.LOCAL_READ_INFO, localReadInfo)
          })
        }
      })
    }
  }
})