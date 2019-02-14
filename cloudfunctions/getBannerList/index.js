// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  // {
  //   env :{
  //     database:'dev-ccc16d'
  //   }
  // }
)
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection('list_banner')
    .where({
      status: 0
    })
    .orderBy('priority', 'asc')
    .get()
}