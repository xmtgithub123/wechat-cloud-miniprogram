const createRecycleContext = require('miniprogram-recycle-view')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    listId: String, // 组件id
    listData: {
      type: Array,
      value: [],
      observer: '_propertyChange'
    },
    isScroll: {
      type: Boolean,
      value: false
    },
    isRefresh: {
      type: Boolean,
      value: false
    }
  },
  data: {
    listHeight: 0,
    batchSetRecycleData: true,
    showData: []
  },
  ready() {
    let info = wx.getSystemInfoSync()
    this.count = 0
    let ctx=this.ctx = createRecycleContext({
      id: this.data.listId,
      dataKey: 'showData',
      page: this,
      itemSize: () => {
        return {
          width: info.windowWidth,
          height: ctx.transformRpx(730)
        }
      }
    })

    this.setData({
      listHeight: info.windowHeight - ctx.transformRpx(72)
    })
  },
  methods: {
    loadMore() {
      this.triggerEvent('loadmore', {}, {})
    },
    toDetail(e) {
      let id = e.currentTarget.dataset.id
      let type = e.currentTarget.dataset.type
      let isActivity = e.currentTarget.dataset.activity
      let activityUrl = e.currentTarget.dataset.activityurl
      this.triggerEvent('todetail', { id, type, isActivity, activityUrl}, {})
    },
    switchLike(e) {
      let item = e.currentTarget.dataset.item
      let itemTemp = JSON.parse(JSON.stringify(item))
      let idx = e.currentTarget.dataset.index
      item.isLike = !item.isLike
      if (!item.isLike) {
        // 当前为已点赞，点击一次，变成取消点赞
        item.likeNum--
      } else {
        // 当前为未点赞，点击一次，变成点赞
        item.likeNum ? item.likeNum++ : item.likeNum = 1
      }
      this.triggerEvent('switchlike', itemTemp, {})
      this.ctx.update(idx, [item])
    },
    _propertyChange(newVal, oldVal) {
      if (newVal && newVal.length && this.ctx) {
        if (this.data.isRefresh) {
          this.setData({
            isRefresh: false
          })
          this.ctx.splice(0,this.count)
          this.count = 0
        }
        let index = this.count
        let data = newVal.map(val => {
          val.idx = index
          index++
          return val
        })
        this.count += newVal.length
        this.ctx.append(data)
        this.setData({
          listData: []
        })
      }
    }
  }
})
