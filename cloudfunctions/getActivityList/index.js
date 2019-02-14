// 云函数入口文件
const cloud = require('wx-server-sdk')

//cloud.init()
cloud.init(
  // {
  //   env: {
  //     database: 'dev-ccc16d'
  //   }
  // }
)
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection('article').where({
   isActivity:true,
  })
  .orderBy('createtime', 'asc')
  .get({
    success(res) {
      console.log(res)
    }
  })
}