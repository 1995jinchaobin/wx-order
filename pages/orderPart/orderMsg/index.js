// pages/orderPart/orderMsg/index.js
import request from '../../../utils/request.js'
import util from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    requestUrl:{
      order:'/order/cancel/'
    },
    orderInfo:[],
    flowerList:[],
    baseUrl:'',
    maxImgShow: false,
    maxImgUrl:'',
    maxFlowerName:'',
    role:0,
    statusList: ['审核不通过', '下单', '审核通过', '上浆', '分配打印', '打印', '蒸化', '检验', '发货', '退货', '发货审核','完成打印','调色','检验','提交快递单'],
    wwwFileBaseUrl:''
  },
  clickImg(e){
    let item = e.target.dataset.item;
    let _this = this;
    let imgUrl="";
    wx.getStorage({
      key: 'imgUrl',
      success: function (res) {
        imgUrl=res.data;
        _this.setData({
          maxImgUrl: imgUrl + item.flowerUrl,
          maxImgShow: true,
          maxFlowerName: item.flowerName
        })
      },
    })
  },
  clickRateImg(e) {
    let url = e.target.dataset.url;
    let _this = this;
    let imgUrl = "";
    _this.setData({
      maxImgUrl: url,
      maxImgShow: true,
      maxFlowerName: ''
    })
  },
  cancelOrder(){
    let _this = this;
    wx.showModal({
      title: '订单取消',
      content: '是否要取消订单',
      success(res){
        if (res.confirm){
          let id = _this.data.orderInfo.orderDetails[0].fkOrderId
          request.request(_this.data.requestUrl.order + id,'','get','',function(res){
            wx.showToast({
              title: res.data.message,
              success(){
                setTimeout(function(){
                  wx.redirectTo({
                    url: '/pages/orderPart/orderList/orderList?type=0',
                  })
                },1000)
              }
            })
          })
        }
      }
    })

  },
  againOrder(){
    let orderInfo = JSON.stringify(this.data.orderInfo);
    wx.showModal({
      title: '再次下单',
      content: '是否要再次下单',
      success(res){
        if (res.confirm){
          wx.navigateTo({
            url: '/pages/order/order?again=' + orderInfo,
          })
        }
      }
    })

  },
  maxImgShow(){
    this.setData({
      maxImgUrl:'',
      maxImgShow: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单信息'
    })
    this.setData({
      role: wx.getStorageSync("userInfo").role
    })
    if(options.msg){
      let msg = JSON.parse(options.msg);
      msg.orderOperations = msg.orderOperations.reverse();
      for (let i = 0;i< msg.orderOperations.length;i++){
        msg.orderOperations[i].createTime = util.formatTime3(msg.orderOperations[i].createTime);
      }
      let url = options.url;
      this.setData({
        orderInfo: msg,
        flowerList: msg.orderDetails,
        baseUrl: url
      })
    }else{
      wx.showToast({
        title: '错误',
        icon:'none',
        success(res){
          wx.navigateBack({})
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})