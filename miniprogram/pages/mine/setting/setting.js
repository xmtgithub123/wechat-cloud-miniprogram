const Validator = require('../../../utils/Validator.js')
const userApi = require('../../../api/user.js')
const checkCodeApi = require('../../../api/checkCode.js')
const localStorageKey = require('../../../config/localStorageKey.js')
Page({
  data: {
    // 用户信息
    userInfo: {
      avatarUrl: '/resource/imgs/user-placeholder.png'
    },
    updateUserInfo: {
      address: {}
    },
    showModal: false, // 是否显示模态框
    checkCodeTxt: '发送验证码', // 验证码文字
    isLodingCheckCode: false, // 是否正在发送验证码
    modalInfo: {
      phoneNumber: '',
      code: ''
    }, // 验证信息
    canIUpdate: false, // 是否已经验证
    showNotice: false, // 是否显示提示信息
    noticeType: 'error', // 提示框的；类型
    noticeText: '', // 提示信息
    isSubmiting: false, // 是否正在提交
  },
  onLoad: function(options) {
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    let updateUserInfo = {}
    if (userInfo) {
      let address = userInfo.address
      let phoneNumber = userInfo.phoneNumber
      if (address) {
        address = address.split(/\s/)
        updateUserInfo.address = {
          province: address[0],
          city: address[1],
          //detail: address[2].slice(0, 5) + '*****',
          detail: address[2],
          values: [address[0], address[1]]
        }
      } else {
        updateUserInfo.address = {
          values: []
        }
      }
      updateUserInfo.phoneNumber = phoneNumber.toString().slice(0, 6) + '*****'
      this.setData({
        userInfo,
        updateUserInfo
      })
    } else {
      wx.redirectTo({
        url: '/pages/login/login',
      })
    }
  },
  // 获取用户编辑信息
  getValue(e) {
    let key = e.currentTarget.dataset.key
    if (key === 'modal:phone') {
      this.setData({
        'modalInfo.phoneNumber': e.detail.value,
      })
    }
    if (key === 'modal:code') {
      this.setData({
        'modalInfo.code': e.detail.value
      })
    }
    let updateUserInfo = this.data.updateUserInfo
    if (key.indexOf('.') > -1) {
      key = key.split('.')
      updateUserInfo[key[0]][key[1]] = e.detail.value
    } else {
      updateUserInfo[key] = e.detail.value
    }
    this.setData({
      updateUserInfo
    })

  },
  // 获取验证码
  getCheckCode() {
    let st = setTimeout(() => {
      clearTimeout(st)
      let modalInfo = this.data.modalInfo
      if (!modalInfo.phoneNumber || !Validator.validPhoneNumber(modalInfo.phoneNumber)) {
        this.setData({
          showNotice: true,
          noticeText: '请输入正确格式的手机号码',
          noticeType: 'error'
        })
        return
      }
      let isLodingCheckCode = this.data.isLodingCheckCode
      if (isLodingCheckCode) return
      let count = 60
      // 验证码重发倒计时开始
      isLodingCheckCode = true
      this.setData({
        isLodingCheckCode,
        checkCodeTxt: `重新发送(${count}S)`
      })
      let si = setInterval(() => {
        count--
        let text = `重新发送(${count}S)`
        if (count < 1) {
          clearInterval(si)
          this.setData({
            isLodingCheckCode: false,
            checkCodeTxt: '获取验证码'
          })
        } else {
          this.setData({
            checkCodeTxt: text
          })
        }
      }, 1000)
      // 调用后端接口，发送验证码
      checkCodeApi.sendCode(+modalInfo.phoneNumber).then(res => {
        if (res.code != 0) {
          clearInterval(si)
          this.setData({
            noticeText: '获取验证码失败，请重试',
            showNotice: true,
            noticeType: 'error',
            isLodingCheckCode: false,
            checkCodeTxt: '获取验证码'
          })
        }
      }).catch(err => {
        clearInterval(si)
        this.setData({
          noticeText: '获取验证码失败，请重试',
          showNotice: true,
          noticeType: 'error',
          isLodingCheckCode: false,
          checkCodeTxt: '获取验证码'
        })
      })
    }, 200)
  },
  // 保存个人信息
  savePersonalInfo() {
    let isSubmiting = this.data.isSubmiting
    if (isSubmiting) return
    let updateUserInfo = this.data.updateUserInfo
    let userInfo = this.data.userInfo
    let phoneNumber = updateUserInfo.phoneNumber

    if (!(phoneNumber.substring(phoneNumber.length - 5) == '*****')) {
      if (!phoneNumber || !Validator.validPhoneNumber(phoneNumber)) {
        this.setData({
          showNotice: true,
          noticeText: '请输入正确格式的手机号码',
          noticeType: 'error'
        })
        return
      }
    }else {
      phoneNumber = ''
    }

    let address = updateUserInfo.address
    if (!address.province || !address.city) {
      this.setData({
        showNotice: true,
        noticeText: '请选择省市信息',
        noticeType: 'error'
      })
      return
    }
    if (!address.detail) {
      this.setData({
        showNotice: true,
        noticeText: '请输入详细地址',
        noticeType: 'error'
      })
      return
    }
    this.setData({
      isSubmiting: true
    })
    
    let data = {
      phoneNumber: phoneNumber,
      address: address.province + ' ' + address.city + ' ' + address.detail.replace(/\s/, '')
    }
    // 请求后端接口，进行用户信息保存
    wx.showLoading({
      title: '正在保存...',
    })
    userApi.updateUserInfo(data).then(res => {
      if (res.code == 0) {
        phoneNumber = updateUserInfo.phoneNumber
        wx.setStorageSync(localStorageKey.USER_INFO, Object.assign(userInfo, data))
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
        })
      }
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        showNotice: true,
        noticeText: '保存失败',
        noticeType: 'error'
      })
    }).finally(() => {
      this.setData({
        isSubmiting: false
      })
    })
  },
  // 是否显示验证用户身份的弹框
  validateUserAuth(e) {
    if (!this.data.canIUpdate) {
      this.setData({
        showModal: true
      })
    }
  },
  // 验证是否是用户本人
  checkIsUserSelf() {
    let st = setTimeout(() => {
      clearTimeout(st)
      let data = this.data.modalInfo
      if (!data.phoneNumber || !Validator.validPhoneNumber(data.phoneNumber)) {
        this.setData({
          showNotice: true,
          noticeText: '请输入正确格式的手机号码',
          noticeType: 'error'
        })
        return
      }
      if (!data.code) {
        this.setData({
          showNotice: true,
          noticeText: '请输入验证码',
          noticeType: 'error'
        })
        return
      }
      // 验证用户身份
      wx.showLoading({
        title: '正在验证...',
      })
      checkCodeApi.varifyCodeToUpdateUserInfo(data.phoneNumber, data.code).then(res => {
        if (res.code == 0) {
          let updateUserInfo = this.data.updateUserInfo
          let userInfo = this.data.userInfo
          let address = userInfo.address
          let phoneNumber = userInfo.phoneNumber
          if (address) {
            address = address.split(/\s/)
            updateUserInfo.address = {
              province: address[0],
              city: address[1],
              detail: address[2],
              values: [address[0], address[1]]
            }
          }
          updateUserInfo.phoneNumber = phoneNumber

          this.setData({
            canIUpdate: true,
            showModal: false,
            showNotice: true,
            noticeText: '验证成功，您可以修改信息',
            noticeType: 'success',
            updateUserInfo
          })
        } else {
          this.setData({
            showNotice: true,
            noticeText: '验证失败',
            noticeType: 'error'
          })
        }
      }).catch(err => {
        this.setData({
          showNotice: true,
          noticeText: '验证失败',
          noticeType: 'error'
        })
      }).finally(() => {
        wx.hideLoading()
      })
    }, 200)
  },
  // 获取省市区信息
  getPC(e) {
    let values = e.detail.value
    this.setData({
      'updateUserInfo.address.province': values[0],
      'updateUserInfo.address.city': values[1]
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
  onShareAppMessage: function() {
    return {
      title: '天纵联盟',
      path: `/pages/index/index`,
      imageUrl: '/resource/imgs/minip_intro.jpg'
    }
  }
})