// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  // 将阅读用户存储到阅读表
  let { openId } = event.userInfo
  const articleRes = await db.collection('article').doc(event.id).get()
  return db.collection('article').doc(event.id)
    .update({
      data: {
        viewCount: _.inc(1)
      }
    })
}