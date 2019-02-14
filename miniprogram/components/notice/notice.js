Component({
  properties: {
    text: {
      type: String,
      value: '',
    },
    type: {
      type: String,
      value: 'error'
    },
    switchNotice:{
      type: Boolean,
      value: false,
      observer:'_setNotice'
    }
  },
  data: {
    st: null,
    isShow: false
  },
  methods: {
    switchThis() {
      if (this.data.isShow) {
        if (this.data.st) {
          clearTimeout(this.data.st)
        }
        this.setData({
          isShow: false,
          st: null
        })
      }
    },
    _setNotice(newVal, oldVal) {
  
      if (newVal) {
        if (this.data.st) {
          clearTimeout(this.data.st)
        }
        let st = setTimeout(() => {
          clearTimeout(st)
          this.setData({
            st: null,
            isShow: false
          })
        }, 3000)
        this.setData({
          st,
          isShow: newVal,
          switchNotice: false
        })
      }
    },
    transitionEnd(e) {
      if (!this.data.isShow) {
        this.setData({
          text: ''
        })
      } 
    }
  }
})
