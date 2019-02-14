class Formatter {
  constructor() {}
  static formatTime(date, formatter ='{y}-{m}-{d} {h}:{i}:{s}') {
    if (!date) {
      throw new Error("time can not be empty")
    }
    date = new Date(date)
    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds()
    }
    let time_str = formatter.replace(/{(y|m|d|h|i|s|)+}/g, (result, key) => {
      let value = formatObj[key]
      if (result.length > 0 && value < 10) {
        value = '0' + value
      }
      return value || 0
    })
    return time_str
  }
}

module.exports = Formatter