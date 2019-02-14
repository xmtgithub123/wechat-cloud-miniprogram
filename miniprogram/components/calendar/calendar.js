Component({
  properties: {
    dateCover: {
      type: Array,
      value: []
    }
  },
  ready() {
    // 实例化当前月信息
    this._initMonthDays(new Date())
  },
  data: {
    monthWeekDays: [], //当前月的信息，二维数组，第一维表示周，第二维表示天
    monthDays: [], // 存储所有展示的日期信息
    weekText: ['日', '一', '二', '三', '四', '五', '六'],
    showCalendarDate: '',
    nowYear: '',
    nowMonth: ''
  },
  methods: {
    // 实例化月份信息
    _initMonthDays(date) {
      if (!date instanceof Date) {
        throw new Error('参数必须是Date类型')
      }
      let monthDays = [] // 存储所有展示的日期信息
      let monthWeekDays = [] //当前月的信息，二维数组，第一维表示周，第二维表示天
      let month = date.getMonth() // 获取当前月份 0-11
      let year = date.getFullYear() // 获取当前年份 yyyy
      let nowMonthLastDay = new Date(year, month + 1, 0) // 当前月最后一天
      let preMonthLastDay = new Date(year, month, 0) // 上个月最后一天

      // 设定显示的日期为6周，不足的上个月或下个月补足
      // 获取上个月最后一天是星期几，用于补足数据
      let preMonthLastDayOfWeek = preMonthLastDay.getDay() // 0-6 表示星期日-星期六
      // 存储上个月的日期信息
      for (let i = preMonthLastDayOfWeek; i >= 0; i--) {
        monthDays.push({
          date: new Date(year, month, -i),
          isPre: true
        })
      }
      // 存储当前月份的日期
      for (let i = nowMonthLastDay.getDate() - 1; i >= 0; i--) {
        monthDays.push({
          date: new Date(year, month + 1, -i),
          isNow: true
        })
      }
      // 检查monthDays,如果长度小于6*7 则继续添加下一个月开始几天的日期
      if (monthDays.length < 6 * 7) {
        let restDayLength = 6 * 7 - monthDays.length
        // 从下个月中补足剩余的天数
        for (let i = 1; i <= restDayLength; i++) {
          monthDays.push({
            date: new Date(year, month + 1, i),
            isNext: true
          })
        }
      }
      // 处理数据
      for (let i = 0; i < monthDays.length; i++) {
        // 当i !== 0 && i % 6 === 0 时，表示一周结束
        let day = monthDays[i]
        let row = Math.floor(i / 7)
        if (!monthWeekDays[row]) monthWeekDays[row] = []
        day.index = i
        day.day = day.date.getDate()
        monthWeekDays[row].push(day)
      }
      // 设定日期
      let showCalendarDate = `${year}年${month+1}月`
      this.setData({
        monthWeekDays,
        monthDays,
        showCalendarDate,
        nowYear: year,
        nowMonth: month
      })
    },
    // 切换月份
    switchMonth(e) {
      let action = e.currentTarget.dataset.action
      let nowYear = this.data.nowYear
      let nowMonth = this.data.nowMonth
      if (action === 'next') {
        // 切换到下一个月
        this._initMonthDays(new Date(nowYear, nowMonth + 1, 1))
      }
      if (action === 'pre') {
        // 切换到上一个月
        this._initMonthDays(new Date(nowYear, nowMonth - 1, 1))
      }
    },
  }
})