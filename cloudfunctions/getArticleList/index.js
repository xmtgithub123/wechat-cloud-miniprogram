// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init(
  //   {
  //   env: {
  //     database: 'dev-ccc16d'
  //   }
  // }
)
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  let { pageSize, currentPage } = event
  pageSize = pageSize ? pageSize : 10
  currentPage = currentPage ? currentPage : 1
  const resCount = await db.collection('article').where({
    type: event.type
  }).count()
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
      isActivity: true,
    })
    .where({
      type: event.type
    })
    .orderBy('createtime', 'desc')
    .orderBy('viewCount', 'desc')
    .orderBy('likeNum', 'desc')
    .skip(pageSize * (currentPage - 1))
    .limit(pageSize)
    .get().then(res => {
      res.count = resCount.total
      return res
    })
}