const app = getApp()
Component({
  properties: {
    color: {
      type: String,
      value: '#909090'
    }, // tab 上的文字默认颜色，仅支持十六进制颜色
    selectedColor: {
      type: String,
      value: '#666666'
    }, //tab 上的文字选中时的颜色，仅支持十六进制颜色
    backgroundColor: {
      type: String,
      value: 'white'
    }, // tab 的背景色，仅支持十六进制颜色
    borderColor: {
      type: String,
      value: '#dddddd'
    }, // tabbar上边框的颜色 ，仅支持十六进制颜色
    list: {
      type: Array,
      value: [],
      observer: '_listChange'
    }, // tab 的列表，详见 list 属性说明，最少2个、最多5个 tab
    position: {
      type: String,
      value: 'bottom'
    }, // tabBar的位置，仅支持 bottom / top
  },
  data: {
    selectedIndex: 0, // 选中的tabbar 下标
  },
  created() {
    wx.hideTabBar()
  },
  attached() {
    
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    let index = this.data.list.findIndex(val => val.pagePath.indexOf(currentPage.route) > -1)
    this.setData({
      selectedIndex: index
    })
    console.log(index)
  },
  methods: {
    selectdTabBar(e) {
      let index = +e.currentTarget.dataset.index
      if (this.data.selectedIndex === index) return
      // wx.reLaunch({
      //   url: this.data.list[index].pagePath,
      // })
      wx.switchTab({
        url: this.data.list[index].pagePath,
      })
    },
    _listChange(newVal, oldVal) {
      console.log(newVal)
    }
  }
})
