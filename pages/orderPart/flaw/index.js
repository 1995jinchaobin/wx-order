// pages/orderPart/flaw/index.js
import request from '../../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    screenHeight: wx.getSystemInfoSync().screenHeight,
    num:'',
    flawName:'',
    flawList:[{id:0,name:'请选择疵点类型'}],
    flawIndex:0,
    flawInfoList:[
      { pishu: 1, xiaci: []},
    ],
    orderId:0,
    flawCountNum:0,
    showFlawSelectArea:false,
    // 当前匹数
    piNum:1,
    flawRollList:[],
    // 输入合格米数和不合格米数弹框
    showInputPishu: false,
    // 合格米数
    okMeter:'',
    // 次品米数
    badMeter:''
  },
  //疵点米数
  numChange(e){
    this.setData({
      num:e.detail.value
    })
  },
  //疵点类型
  bindIndexChange(e){
    this.setData({
      flawIndex: e.detail.value
    })
  },
  // 获取瑕疵列表
  getFlawList() {
    let _this = this;
    let data = {
      page: 1,
      rows: 999
    }
    request.request('/flaw', data, 'get', '', (res) => {
      if (res.data.data.list.length > 0) {
        _this.setData({
          flawList: res.data.data.list
        })
      }
    })
  },
  //点击提交疵点
  addFlaw(e){
    if(this.data.num==''){
      wx.showToast({
        title: '请填写疵点米数',
        icon: 'none',
        success() {
        }
      })
    } else if (this.data.flawList[this.data.flawIndex] =='请选择疵点类型'){
      wx.showToast({
        title: '请选择疵点类型',
        icon: 'none',
        success() {
        }
      })
    } else {
      // piNum
      // console.log(this.data.piNum)
      // console.log()
      let flawInfo = {
        fkFlawId: this.data.flawList[this.data.flawIndex].id,
        flawName: this.data.flawList[this.data.flawIndex].name,
        num: this.data.num,
        reduceScore: this.data.flawList[this.data.flawIndex].num
      }
      // { pishu: 1, xiaci: [{ num: 1, name: '111' }] },
      // console.log(flawInfo)
      // let flawInfo={
      //   fkFlawId: this.data.flawList[this.data.flawIndex].id,
      //   flawName: this.data.flawList[this.data.flawIndex].name,
      //   reduceScore: this.data.flawList[this.data.flawIndex].num,
      //   num: this.data.num
      // }
      // let flawCountNum = flawInfo.reduceScore;
      this.setData({
        flawCountNum: parseFloat(this.data.flawCountNum) + parseFloat(flawInfo.reduceScore)
      })
      // console.log(this.data.flawInfoList[this.data.piNum - 1])
      let beforListXiaci = this.data.flawInfoList[this.data.piNum - 1].xiaci
      // console.log(beforListXiaci)
      // console.log(flawInfo)
      beforListXiaci.push(flawInfo)
      const addListXiaci = this.data.flawInfoList
      addListXiaci[this.data.piNum - 1].xiaci = beforListXiaci
      // console.log(addListXiaci)
      // let a = flawInfoList[].push(flawInfo)

      // console.log(a)
      // let a = 
      this.setData({
        flawInfoList: addListXiaci,
        num:''
      })
      // console.log(this.data.flawInfoList)
    }
  },
  // 当前匹数完成按钮
  pishuFinish () {
    this.setData({
      showInputPishu: true
    })
    // console.log(this.data.flawInfoList[this.data.piNum - 1])
    const arr = this.data.flawInfoList[this.data.piNum - 1].xiaci
    let flawStr = ""
    for (let i = 0; i < arr.length; i++) {
      flawStr += arr[i].fkFlawId + "&"
        + arr[i].flawName + "&"
        + arr[i].num + "&"
        + arr[i].reduceScore + "&"
        + this.data.piNum + ";"
    }
    // console.log(flawStr)
    const data = {
      id: this.data.orderId,
      flawStr: flawStr
    }
    //请求
    request.request('/order/flaw', data, 'post', '', (res) => {
      // console.log(res)
      // if (res.data.code===0){
      //   request.request('/flow/' + this.data.orderId, {
      //     type: 6,
      //     id: this.data.orderId
      //     },
      //     'POST', '', (res) => {
      //       console.log(res)
      //     }
      //   )
      // }
      if (res.data.code === 0) {
        this.setData({
          showInputPishu: true
        })
      }
    })
  },
  // 合格米数输入框
  bindOkMeterInput(e) {
    this.setData({
      okMeter: e.detail.value
    })
  },
  // 不合格米数输入框
  bindBadMeterInput(e) {
    this.setData({
      badMeter: e.detail.value
    })
  },
  // 米数输入框取消按钮
  cancelCheck() {
    this.setData({
      okMeter: '',
      badMeter: '',
      showInputPishu: false,
    })
  },
  // 合格米数输入确定按钮
  sureCheck(){
    // request.request('/order/flaw', data, 'post', '', (res) => {
    //   console.log(res)
      // if (res.data.code===0){
        request.request('/flow/' + this.data.orderId, {
          type: 6,
          id: this.data.orderId,
          okMeter:this.data.okMeter,
          badMeter:this.data.badMeter
          },
          'POST', '', (res) => {
            // console.log(res)
            if (res.data.code===0){
              const afterPinum = this.data.piNum + 1
              // { pishu: 1, xiaci: [] }
              let arr = this.data.flawInfoList
              arr.push({
                pishu: afterPinum,
                xiaci:[]
              })
              this.setData({
                okMeter:'',
                badMeter:'',
                piNum: afterPinum,
                showInputPishu: false,
                flawInfoList: arr,
                num:''
              })
              // console.log(this.data.flawInfoList)
            }
          }
        )
      // }
    // })
  },
  orderPost(){
    // let flawStr = "";
    // for (let i = 0; i < this.data.flawInfoList.length;i++){
    //   flawStr += this.data.flawInfoList[i].fkFlawId + "&" 
    //     + this.data.flawInfoList[i].flawName + "&" 
    //     + this.data.flawInfoList[i].num + "&" 
    //     + this.data.flawInfoList[i].reduceScore + ";" 
    // }
    // if (flawStr.length>0){
    //   flawStr = flawStr.substring(0, flawStr.length-1);
    // }
    const data = {
      id:this.data.orderId,
      type: 12
    }
    //请求
    request.request('/flow/' + this.data.orderId,{
      type: 12,
      id: this.data.orderId,
    } ,'POST', '',(res) => {
      // console.log(res)
      wx.navigateTo({
        url: '/pages/orderPart/orderList/orderList',
      })
    })

  },
  cancelSelect(){
    this.setData({
      showFlawSelectArea:false
    })
  },
  sureSelect(){
    this.setData({
      showFlawSelectArea: false
    })
    //this.orderPost();
  },
  selectFlaw(e){
    this.setData({
      flawIndex:e.currentTarget.dataset.index
    })
  },
  showFlawSelectArea(){
    this.setData({
      showFlawSelectArea: true
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    // console.log(options.orderId)
    if (options.orderId != undefined && options.orderId!=''){
      _this.setData({
        orderId: options.orderId
      })
    }
    this.getFlawList();
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