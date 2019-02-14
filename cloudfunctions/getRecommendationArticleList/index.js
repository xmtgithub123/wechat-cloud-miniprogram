// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  return db.collection('article')
    .field({
      _id: true,
      title: true,
      cover: true,
      duration: true,
      tags: true,
      from: true,
      fromImg: true
    })
    .where({
      type: event.type
    }).get().then(docs => {
      console.log(docs)
      if (docs.data.length > 3) {
        let list = []
        while (list.length < 3) {
          let random = Math.floor(Math.random() * docs.data.length)
          let item = docs.data[random]
          if (item && item._id !== event.id && list.findIndex(val => val._id === item._id) < 0) {
            list.push(item)
          }
        }
        return list
      } else {
        return docs.data
      }
      return []
    })
}