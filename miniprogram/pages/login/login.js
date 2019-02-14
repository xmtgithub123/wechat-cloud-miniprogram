const Validator = require('../../utils/Validator.js')
const checkCodeApi = require('../../api/checkCode.js')
const localStorageKey = require('../../config/localStorageKey.js')
const app = getApp()
Page({
  data: {
    noticeText: '',
    showNotice: false,
    loginInfo: {
      name: '',
      phoneNumber: '',
      verifyCode: '',
      clientIp: '127.0.0.1',
    },
    userInfo: {}, // 用户信息
    checkCodeBtnTxt: '获取验证码', // 验证码文字
    isLodingCheckCode: false, // 是否正在发送验证码
    stepText: '登录',
    nowStep: 1, // 当前步骤
    countDownText: '3s后自动登录',
    imageUrl: '', // step2 提交的图片临时地址
    isSubmiting: false, // 是否正在提交
    showModal: false, // 是否显示用户服务协议
   
  },
  onLoad(options) {
    console.log(options)
    if(!!options.shareUserId){
      let shareActivity = 'loginInfo.shareActivity'
      this.setData({
        [shareActivity]: 'answer|shareUserId=' + options.shareUserId
      })
    }
  },
  // 获取输入框数据
  getValue(e) {
    let key = e.currentTarget.dataset.key
    let value = e.detail.value
    if (key) {
      // 校验电话号码
      if (key === 'phoneNumber') {
        if (!value) {
          this.setData({
            noticeText: '手机号码不能为空',
            showNotice: true
          })
          return
        }
        if (!Validator.validPhoneNumber(value)) {
          this.setData({
            noticeText: '手机号码格式不正确',
            showNotice: true
          })
          return
        }
        value = +value
      }
      let loginInfo = this.data.loginInfo
      if (key === 'isChecked') {
  
        loginInfo[key] = Boolean(value[0])
      } else {
        loginInfo[key] = value
      }
      this.setData({
        loginInfo
      })
    }
  },
  // 获取验证码
  getCheckCode(e) {
    if (e.detail.errMsg.indexOf('fail') > -1) return   
    let loginInfo = this.data.loginInfo
    if (!loginInfo.phoneNumber) return
    let isLodingCheckCode = this.data.isLodingCheckCode
    if (isLodingCheckCode) return
    let self = this
    wx.getUserInfo({
      success(res) {
        console.log(res)
        debugger;
        self.setData({
          userInfo: res.userInfo
        })
      }
    })
    let count = 60
    // 验证码重发倒计时开始
    isLodingCheckCode = true
    this.setData({
      isLodingCheckCode,
      checkCodeBtnTxt: `重新发送(${count}S)`
    })
    let si = setInterval(() => {
      count--
      let text = `重新发送(${count}S)`
      if (count < 1) {
        clearInterval(si)
        this.setData({
          isLodingCheckCode: false,
          checkCodeBtnTxt: '获取验证码'
        })
      } else {
        this.setData({
          checkCodeBtnTxt: text
        })
      }
    }, 1000)
    // 调用后端接口，发送验证码
    checkCodeApi.sendCode(+loginInfo.phoneNumber).then(res => {
 
      if(res.code != 0) {
        clearInterval(si)
        this.setData({
          noticeText: '获取验证码失败，请重试',
          showNotice: true,
          isLodingCheckCode: false,
          checkCodeBtnTxt: '获取验证码'
        })
      }
    }).catch(err => {
      clearInterval(si)
      this.setData({
        noticeText: '获取验证码失败，请重试',
        showNotice: true,
        isLodingCheckCode: false,
        checkCodeBtnTxt: '获取验证码'
      })
    })
  },
  // 下一步
  nextStep() {
    let step = this.data.nowStep
    if (step == 1) {
      this.login()
    }
    if (step == 2) {
      this.submitOrderInfo(() => {
        this.setData({
          nowStep: 3,
          stepText: '登录'
        })
        this.autoSwitchTabToMinePage()
      })
    }
    if (step == 3) {
      this.toMinePage()
    }
  },
  // step1 操作
  login(cb){
    // 验证数据完整性
    let isSubmiting = this.data.isSubmiting
    if (isSubmiting) return
    let loginInfo = this.data.loginInfo
    let text = ''
    if (!loginInfo.name) {
      text = '姓名不可为空'
    } else if (!loginInfo.phoneNumber) {
      text = '手机号码不可为空'
    } else if (!Validator.validPhoneNumber(loginInfo.phoneNumber)) {
      text = '手机号码格式不正确'
    } else if (!loginInfo.verifyCode) {
      text = '验证码不可为空'
    } else if (!loginInfo.isChecked) {
      text = '请先同意用户服务协议'
    }
    if (text) {
      this.setData({
        noticeText: text,
        showNotice: true
      })
      return
    }
    // 进行提交
    this.setData({
      isSubmiting: true
    })
    console.log(loginInfo)
    checkCodeApi.varifyCode(loginInfo).then(res => {
      if (res.code == 0) {
        let userInfo = this.data.userInfo
        Object.assign(userInfo, res.data)
        wx.setStorageSync(localStorageKey.USER_INFO, userInfo)
        wx.showToast({
          title: '登录成功',
        })
        app.globalData.from = 'login'
        let st = setTimeout(() => {
          wx.navigateBack({})
        },1500)
      } else {
        this.setData({
          noticeText: '登录失败，请重试',
          showNotice: true
        })
      }
    }).catch(err => {
      this.setData({
        noticeText: '登录失败，请重试',
        showNotice: true
      })
    }).finally(() => {
      wx.hideLoading()
      this.setData({
        isSubmiting: false
      })
    })
  },
  // step2 操作-废弃
  submitOrderInfo(cb) {
    let isSubmiting = this.data.isSubmiting
    if(isSubmiting) return
    if (!this.data.imageUrl)  {
      this.setData({
        noticeText: '请上传您的订单信息',
        showNotice: true
      })
    } else {
      wx.showLoading({
        title: '正在提交...',
      })
      // 进行提交
      this.setData({
        isSubmiting: true
      })
      let loginInfo = JSON.parse(JSON.stringify(this.data.loginInfo))
      delete loginInfo.isChecked
      checkCodeApi.varifyCode(this.data.imageUrl, loginInfo).then(res => {
        if (res.code == 0) {
          let userInfo = this.data.userInfo
          Object.assign(userInfo, res.data)
          wx.setStorageSync(localStorageKey.USER_INFO, userInfo)
          let st = setTimeout(() => {
            wx.navigateBack({})
          }, 1500)
          app.globalData.from = 'login'
        } else {
          this.setData({
            noticeText: '提交失败，请重试',
            showNotice: true
          })
        }
      }).catch(err => {
        this.setData({
          noticeText: '提交失败，请重试',
          showNotice: true
        })
      }).finally(() => {
        wx.hideLoading()
        this.setData({
          isSubmiting: false
        })
      })
    }
  },
  // step3操作
  toMinePage() {
    wx.switchTab({
      url: '/pages/list/list',
    })
  },
  // step3 自动跳转
  autoSwitchTabToMinePage() {
    let countDown = 3
    let si = setInterval(() => {
      countDown--
      let text = `${countDown}s后自动登录`
      this.setData({
        countDownText: text
      })
      if (countDown == 0) {
        clearInterval(si)
        this.toMinePage()
      }
    }, 1000)
  },
  // 选择图片
  chooseImage() {
    let self = this
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        console.log(tempFilePaths)
        self.setData({
          imageUrl: tempFilePaths[0]
        })
      }
    })
  },
  // 显示用户协议
  showAgreement() {
    this.setData({
      showModal: true
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
  // 分享
  onShareAppMessage: function () {
    return {
      title: '天纵联盟',
      path: `/pages/index/index`,
      imageUrl: '/resource/imgs/minip_intro.jpg'
    }
  }
})