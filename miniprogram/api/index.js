class CloudApi {
  constructor() {
    this.cloudReq = wx.cloud.callFunction
  }
  // 根据类型获取文章或视频
  getArticleListByType(params) {
    return this.cloudReq({
      name: 'getArticleList',
      data: params
    })
  }
  // 获取推荐列表
  getRecommendationList(params) {
    return this.cloudReq({
      name: 'getRecommendationList',
      data: params
    })
  }
  // 获取晓说列表
  getXiaoShuoList(params) {
    return this.cloudReq({
      name: 'getXiaoShuoList',
      data: params
    })
  }

  // 根据文章id获取文章
  getArticleById(id) {
    return this.cloudReq({
      name: 'getArticle',
      data: { id }
    })
  }

  // 获取推荐阅读文章列表
  getRecommendationArticleList(id, type=1) {
    return this.cloudReq({
      name: 'getRecommendationArticleList',
      data: {id, type}
    })
  }
  
  // 更新文章的分享数
  updateArticleShareNum(id) {
    return this.cloudReq({
      name: 'updateArticleShareNum',
      data: {id}
    })
  }

  // 更新文章点赞数
  updateArticleLikeNum(id, isLike) {
    return this.cloudReq({
      name: 'updateArticleLikeNum',
      data: {id, isLike}
    })
  }

  //更新文章浏览数
  updateArticleViewCount(id) {
    return this.cloudReq({
      name: 'updateArticleViewCount',
      data: {id}
    })
  }

  // 检查首页视频是否更新
  checkIndexVideoIsUpdate() {
    return this.cloudReq({
      name: 'checkIndexVideoIsUpdate',
      data: {}
    })
  }
  // 获取banner列表
  getBannerList() {
    return this.cloudReq({
      name: 'getBannerList',
      data:{}
    })
  }
  // 获取banner列表
  getActivityList() {
    return this.cloudReq({
      name: 'getActivityList',
      data: {}
    })
  }
  // 获取活动规则
  getActivityRule(activity) {
    return this.cloudReq({
      name: 'getActivityRule',
      data: { activity}
    })
  }

  getActivityImg() {
    return this.cloudReq({
      name: 'getActivityImg',
      data: {}
    })
  }
}

module.exports = new CloudApi()

