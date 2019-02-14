const localStorageKey = require('../config/localStorageKey.js')
class Http {
  constructor() {
    Http.instance = wx.request
  }
  _http(url, data, type, contentType ='application/x-www-form-urlencoded') {
    let p = new Promise((resolve, reject) => {
      let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
      Http.instance({
        url,
        method: type,
        data,
        header: {
          'content-type': contentType,
          'Authorization': userInfo ? userInfo.token : ''
        },
        success(res) {
          resolve(res.data)
        },
        fail() {
          reject()
        }
      })
    })
    return p
  }
  uploadFile(url, filePath, data={}, fileName ='file') {
    return fileUpload(url, filePath, fileName, data)
  }
  get(url, data) {
    return this._http(url, data, 'GET')
  }
  post(url, data, contentType) {
    return this._http(url, data, 'POST', contentType)
  }
  delete(url, data) {
    return this._http(url, data, 'DELETE')
  }
  put(url, data) {
    return this._http(url, data, 'PUT')
  }
}
function fileUpload(url, filePath, fileName, data) {
  return new Promise((resolve, reject) => {
    let userInfo = wx.getStorageSync(localStorageKey.USER_INFO)
    wx.uploadFile({
      url,
      filePath,
      name: fileName,
      header: {
        'charset': 'utf-8',
        'Authorization': userInfo ? userInfo.token : ''
      },
      formData: data,
      success(res) {
        resolve(JSON.parse(res.data))
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
// Promise polyfill
Promise.prototype.finally = function (callback) {
  let P = this.constructor
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  )
}
module.exports = Http