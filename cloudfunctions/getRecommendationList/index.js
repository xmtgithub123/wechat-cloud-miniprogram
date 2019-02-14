// 云函数入口文件
const cloud = require('wx-server-sdk')
console.log(cloud)
cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  let { pageSize, currentPage } = event
  pageSize = pageSize ? pageSize : 10
  currentPage = currentPage ? currentPage : 1
  const resCount = await db.collection('article').count()
  return db.collection('article')
    .field({
      _id: true,
      title: true,
      cover: true,
      tags: true,
      imageNum: true,
      createtime: true,
      viewCount: true,
      likeNum: true,
      videoUrl: true,
      type: true,
      from: true,
      fromImg: true,
      isActivity: true
    })
    .where({
      type: _.in([1, 2])
    })
    .orderBy('viewCount', 'desc')
    .orderBy('likeNum', 'desc')
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize)
    .get().then(res => {
      res.count = resCount.total
      return res
    })
}