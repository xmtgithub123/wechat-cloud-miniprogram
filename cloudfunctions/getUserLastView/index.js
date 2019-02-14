// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  // 获取用户id
  let { openId } = event.userInfo
  let { pageSize, currentPage } = event
  pageSize = pageSize ? pageSize : 10
  currentPage = currentPage ? currentPage : 1
  // 获取此用户的阅读记录数目
  let countRes = await db.collection('article_read_info').where({
    openId
  }).count()
  const readInfos = await db.collection('article_read_info')
    .where({
      openId
    })
    .get().then(res => {
      return res.data
    }).catch(err => {
      return []
    })
  let resultData = []
  readInfos.forEach(async val => {
    let res = await db.collection('article')
      .field({
        type: true,
        cover: true
      })
      .doc(val.articleId)
      .then(res => res.data)
    if (res) {
      val.type = res.type
      val.cover = res.cover
      resultData.push(val)
    }
  })
  return readInfos
}