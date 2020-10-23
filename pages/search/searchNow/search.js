// pages/search/searchNow/search.js
import request from '../../../utils/request.js'
import util from '../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fabricList: [
      { id: 0, name: '选择面料规格' }
    ],
    statusList: ['全部','审核不通过', '待审核', '已审核', '已上浆', '已分配', '已打印', '已蒸花', '已检验', '已发货', '退货'],
    statusIndex:0,
    companyName:'',
    concat:'',
    fabricIndex: 0,
    date: '2016-09-01',
    orderStatus:'',
    flowerNum:''
  },

  // 公司名
  companyNameChange(e) {
    this.setData({
      companyName: e.detail.value
    })
  },
  // 联系人
  concatChange(e) {
    this.setData({
      concat: e.detail.value
    })
  },
  // 花型编号
  flowerNumChange(e) {
    this.setData({
      flowerNum: e.detail.value
    })
  },
  // 选择面料
  bindPickerChange(e) {
    this.setData({
      fabricIndex: e.detail.value
    })
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  // 获取面料规格
  getFabricList() {
    let _this = this;
    let data = {
      page: 1,
      rows: 999
    }
    request.request('/fabric', data, 'get', '', (res) => {
      let fabricList = _this.data.fabricList;
      if (res.data.data.list.length>0){
        for (let i = 0; i < res.data.data.list.length; i++) {
          fabricList.push(res.data.data.list[i]);
        }
        _this.setData({
          fabricList: fabricList
        })
      }
    })
  },
  // 用户点击订单状态
  bindOrderStateChange(e) {
    this.setData({
      statusIndex: e.detail.value
    })
    let orderStatus;
    switch (this.data.statusList[this.data.statusIndex]) {
      case '全部':
        orderStatus = '';
        break;
      case '审核不通过':
        orderStatus = -1;
        break;
      case '待审核':
        orderStatus = 0;
        break;
      case '已审核':
        orderStatus = 1;
        break;
      case '已上浆':
        orderStatus = 2;
        break;
      case '已分配':
        orderStatus = 3;
        break;
      case '已打印':
        orderStatus = 4;
        break;
      case '已蒸花':
        orderStatus = 5;
        break;
      case '已检验':
        orderStatus = 6;
        break;
      case '已发货':
        orderStatus = 7;
        break;
      case '退货':
        orderStatus = 8;
        break;
      case '发货审核':
        orderStatus = 9;
        break;
      case '已取消':
        orderStatus = 100;
        break;
      default:
        return;
        break;
    }
    this.setData({
      orderStatus: orderStatus
    })
  },
  //设置可选择的订单状态
  setOrderStatus() {
    let userInfo = wx.getStorageSync("userInfo");
    let orderStatus = [];
    switch (userInfo.role) {
      case 1:
        orderStatus = ['全部','审核不通过', '待审核', '已审核', '已上浆', '已分配', '已打印', '已蒸花', '已检验', '已发货', '退货', '已取消'];
        break;
      case 2:
        orderStatus = ['全部','审核不通过', '待审核', '已审核', '已上浆', '已分配', '已打印', '已蒸花', '已检验', '已发货', '退货', '已取消'];
        break;
      case 3:
        orderStatus = ['全部','审核不通过', '待审核', '已审核', '已上浆', '已分配', '已打印', '已蒸花', '已检验', '已发货', '退货'];
        break;
      case 4:
        orderStatus = ['全部','已审核', '已分配'];
        break;
      case 5:
        orderStatus = ['全部','已分配', '已打印', '已蒸花', '已上浆'];
        break;
      case 6:
        orderStatus = ['全部','已打印', '已蒸花', '已上浆']
        break;
      default:
        break;
    }
    this.setData({
      statusList: orderStatus
    })
  },
  //搜索
  searchOrder(){
    console.log(this.data.orderStatus)
    wx.navigateTo({
      url: '/pages/orderPart/orderList/orderList?&startTime=' + this.data.date + ' 00:00:00' + ' &endTime=' + this.data.date + '&orderStatus=' + this.data.orderStatus + '&fkFabricId=' + this.data.fabricList[this.data.fabricIndex].id + '&companyName=' + this.data.companyName + '&concat=' + this.data.concat + '&flowerNum=' + this.data.flowerNum
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let date = util.formaData();
    this.setData({
      date: date
    })
    this.setOrderStatus();
    this.getFabricList();
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