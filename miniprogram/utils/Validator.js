class Validator {
  static validPhoneNumber(number) {
    return /^1[3456789]\d{9}$/.test(number)
  }
}

module.exports = Validator