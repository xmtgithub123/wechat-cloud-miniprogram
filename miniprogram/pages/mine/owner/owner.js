const userApi = require('../../../api/user.js')
const localStorageKey = require('../../../config/localStorageKey.js')
Page({
  data: {
    imageUrl: '/resource/icons/plus.jpg',
    selected: false, // 是否选择了文件
    isSubmiting: false, // 是否正在提交
    showNotice: false, // 是否显示提示信息
    noticeType: 'error', // 提示框的；类型
    noticeText: '', // 提示信息
  },
  onLoad: function (options) {
    
  },
  chooseImg() {
    let self = this
    wx.chooseImage({
      success: function(res) {
        let tempPaths = res.tempFilePaths
        self.setData({
          imageUrl: tempPaths[0],
          selected: true
        })
      },
    })
  },
  // 提交订单
  submitInvoice() {
    let isSubmiting = this.data.isSubmiting
    if (isSubmiting) return
    let filePath = this.data.imageUrl
    let selected = this.data.selected
    if (!selected)  {
      this.setData({
        showNotice: true,
        noticeText: '请先上传购车发票',
        noticeType: 'error'
      })
      return
    }
    this.setData({
      isSubmiting: true
    })
    wx.showLoading({
      title: '正在提交...',
    })
    userApi.varify(this.data.imageUrl, { beanName:'invoice'}).then(res => {
      wx.hideLoading()
      if (res.code == 0) {
       wx.showToast({
         title: '提交成功',
       })
       let st = setTimeout(() =>{
         wx.navigateBack({})
       },1500)
      } else {
        this.setData({
          showNotice: true,
          noticeText: '提交失败',
          noticeType: 'error'
        })
      }
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        showNotice: true,
        noticeText: '提交失败，请重试',
        noticeType: 'error'
      })
    }).finally(() => {
      this.setData({
        isSubmiting: false
      })
    })
  },
  onShareAppMessage: function () {
    return {
      title: '天纵联盟',
      path: `/pages/index/index`,
      imageUrl: '/resource/imgs/minip_intro.jpg'
    }
  }
})