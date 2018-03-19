// pages/article/article.js
const app = getApp()
const util = require('../../utils/util.js')

//假数据
const good = require('../../data/good1.js')

Page({

  data: {
    articleId: 0,                 // 商品ID
    goodInfo: null,               // 商品信息
    selectStyleId: null,          // 选中的款式ID
    selectStyleName: null,        // 选中的款式名称
    selectStylePrice: null,       // 选中款式的价格
    selectStyleCount: 1,          // 选中款式的数量
    selectStyleStock: 0,          // 选中款式的库存
    presellTime: null,            // 预售时间
    styleNum: 1,                  // 款式数量
    modulesUserGoods: null,       // 卖家其他商品
    modulesGuessLike: null,       // 猜你喜欢商品
    chartNum: 0,                  // 购物车数量
    addLikeStatus: false,         // 是否收藏
    selectStatus: false,          // 选择款式框显示状态
    selectType: 0,                // 调起选择框：0文中选择 1加入购物车 2立即购买 （单个款式不调起）
    isIphoneX: app.isIphoneX      // 是否IphoneX
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '商品详情'
    })
    // this.setData({
    //   articleId: options.id
    // })
    // 更新购物车图标数量
    this.getChartNum()

    // 单个用户头像替换
    good.data.seller.avatar = util.singleUserAvatarTransform(good.data.seller.avatar)
    good.data.modules[0].data.result[0].avatar = util.singleUserAvatarTransform(good.data.modules[0].data.result[0].avatar)
    // 多个用户头像替换
    good.data.modules[1].data.result = util.userAvatarTransform(good.data.modules[1].data.result, 'user_avatar')

    // 替换文本<br />
    good.data.desc = util.replaceBr(good.data.desc)
    good.data.content = util.replaceBr(good.data.content)
    
    // 设置收藏状态
    if (good.data.is_favorited != 0){
      this.setData({
        addLikeStatus: true
      })
    }

    // 单个款式 直接显示预售且 选择框消失
    // 多个款式 选择框显示 预售消失 （在选中款式时，更新预售状态，以及选中的款式）
    const styleNum = good.data.type.length
    let presellTime = null
    let selectStyleId = null
    // 单个订单 初始 预售 款式ID
    if (styleNum == 1){
      presellTime = util.formatTime(good.data.type[0].estimated_delivery_date)
      selectStyleId = good.data.type[0].id
    }

    this.setData({
      goodInfo: good.data,
      modulesUserGoods: good.data.modules[0],
      modulesGuessLike: good.data.modules[1].data.result,
      presellTime: presellTime,
      styleNum: styleNum,
      selectStyleId: selectStyleId
    })
  },
  // 分享
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '商品详情转发标题',
      path: '/pages/article/articleId?id=' + 123,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  // 获取购物车数量
  getChartNum: function() {
    this.setData({
      chartNum: 1
    })
  },
  // 图片预览
  previewImage: function(e) {
    const url = e.target.dataset.url
    // 图片加入预览列表
    wx.previewImage({
      current: url, // 当前显示图片的http链接
      urls: this.data.goodInfo.images // 需要预览的图片http链接列表
    })
  },
  // 收藏
  addLike: function() {
    // 需要商品id 
    console.log(this.articleId)
    // 已经收藏直接返回
    if (this.data.addLikeStatus){
      return false
    }
    wx.showToast({
      title: '成功',
      duration: 2000
    })
    this.setData({
      addLikeStatus: true
    })
  },
  // 加入购物车
  addChart: function(e) {
    // appv2/additemintocart 接口参数商品id 款式id 数量
    // this.data.articleId 商品id 
    // this.data.selectStyleId 款式id
    // this.data.selectStyleCount 数量
    console.log(this.data)
    wx.showToast({
      title: '添加成功',
      duration: 2000
    })
  },
  // 显示款式选择框
  selectShow: function(e) {
    // 调起选择框状态
    const selectType = e.target.dataset.type ? e.target.dataset.type : 0
    // 每次打开选择款式框 初始数量
    this.setData({
      selectStatus: true,
      selectStyleCount: 1,
      selectType: selectType
    })
  },
  // 关闭款式选择框
  selectHide: function(e) {
    if (e.target.dataset.status == 'true'){
      this.setData({
        selectStatus: false
      })
    }
  },
  // 选中款式
  selectedStyle: function(e) {
    const id = e.target.dataset.typeid
    const name = e.target.dataset.name
    const stock = e.target.dataset.stock
    const price = e.target.dataset.price
    const presellTime = e.target.dataset.presellTime ? util.formatTime(e.target.dataset.presellTime) : null
    if (stock <= 0){
      return false
    }
    // 每次切换款式 初始数量
    this.setData({
      selectStyleId: id,
      selectStyleName: name,
      presellTime: presellTime,
      selectStylePrice: price,
      selectStyleStock: stock,
      selectStyleCount: 1
    })
  },
  // 当没有选中款式时 点击加入购物车/立即购买
  noSelect: function() {
    wx.showToast({
      title: '请选择一个款式',
      icon: 'none',
      duration: 1000
    })
  },
  // 数量加减
  subGoodNum: function() {
    if (this.data.selectStyleCount <= 1){
      return false
    }
    let m = this.data.selectStyleCount - 1
    this.setData({
      selectStyleCount: m
    })
  },
  addGoodNum: function() {
    const stock = this.data.selectStyleStock
    if (this.data.selectStyleCount == stock) {
      return wx.showToast({
        title: '库存不足，仅剩' + stock + '件',
        icon: 'none',
        duration: 1000
      })
    }
    let m = this.data.selectStyleCount + 1
    this.setData({
      selectStyleCount: m
    })
  },
  // 跳转下订单
  navigateToCreateOrder: function () {
    // 设置选择的款式，以及数量，进行数据缓存（没有款式，直接存储）
    let goodInfo = this.data.goodInfo
    if (this.data.styleNum == 1){
      goodInfo.type[0]['number'] = 1
      wx.setStorageSync('orderData', goodInfo)
    }else{
      let selectStyleId = this.data.selectStyleId
      let selectStyleCount = this.data.selectStyleCount
      let newType = []
      goodInfo.type.forEach(function(item, index){
        if (item.id == selectStyleId){
          item['number'] = selectStyleCount
          newType.push(item)
        }
      })
      goodInfo.type = newType
      wx.setStorageSync('orderData', goodInfo)
    }
    const url = '/pages/createOrder/createOrder?type=0'
    wx.navigateTo({
      url: url
    })
  },
  // 跳转购物车
  navigateToChart: function() {
    wx.switchTab({
      url: "/pages/chart/chart"
    })
  },
  // 跳转商品
  navigateToGoods: function (e) {
    let id = e.target.dataset.id
    const url = '/pages/article/article?id=' + id
    wx.navigateTo({
      url: url
    })
  },
  // 跳转用户
  navigateToUser: function (e) {
    let id = e.target.dataset.id
    let name = e.target.dataset.name
    const url = '/pages/user/user?id=' + id + '&name=' + name
    wx.navigateTo({
      url: url
    })
  }
})