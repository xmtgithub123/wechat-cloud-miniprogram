module.exports = [
  {
    name: '推荐',
    alias: 'recommendationList',
    func: 'getRecommendationList',
    isShow: false,
  },
  {
    name: '视频',
    alias: 'videoList',
    func: 'getArticleListByType',
    funcData: {type: 2},
    isShow: true,
  },
  {
    name: '图文',
    alias: 'articleList',
    func: 'getArticleListByType',
    funcData: { type: 1 },
    isShow: true,
  },
  {
    name: '晓说',
    alias: 'xiaoshuoList',
    func: 'getXiaoShuoList',
    isShow: true,
  },
]