import request from "../../../utils/request.js";
import util from "../../../utils/util.js";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: wx.getSystemInfoSync().statusBarHeight,
    screenHeight: wx.getSystemInfoSync().screenHeight,
    request:{
      order:'/order'
    },
    typeList:['全部','待处理','已完成'],
    selectTypeIndex:0,
    page:1,
    orderList:[],
    pageSize:6,
    total:0,
    role:0,
    userId:0,
    statusList: ['审核不通过','待审核','已审核','已上浆','打印中','已打印','已蒸化','已检验','已发货','已退货','已发货审核'],
    total:0,
    role:0,
    machineList:[],
    selectMachineId:0,
    //未完成米数
    unfinishMeter:0,
    //已完成米数
    finishMeter :0,
    //完成米数
    meter:'',
    //是否显示打印米数输入弹框
    showPrintBox:false,
    orderId:0,
    //是否显示检验米数输入弹框
    showCheckBox:false,
    //正常米数
    okMeter:'',
    //次品米数
    badMeter:'',
    //是否显示快递单号输入弹框
    showSendBox:false,
    //是否显示调拨米数输入弹框
    showNextBox:false,
    //快递单号
    expressNumber:'',
    //快递公司列表
    expressCompanyList: ['自提', '顺丰快递', '韵达快递', '申通快递', '中通快递', '天天快递', '百世汇通', '邮政包裹', 'EMS'],
    companyName:'自提',
    //退货备注
    returnNote:'',
    //是否显示退货备注输入弹框
    showReturnBox:false,
    // 页面传入参数
    type:'',
    key: '',
    companyIndex:0,
    searchOrderId:-1,
    //搜索页面跳转到当前页面，传递的搜索时间
    searchEndTime:null,
    searchFkFabricId:0,
    searchCompanyName:'',
    searchContacts:'',
    searchFlowerNum:'',
    // 库存id
    inventoryId:'',
    // 半票仓米数
    num1:'',
    // 半票仓匹数
    rollNum:'',
    // 上浆仓米数
    num2:'',
    // 上浆调拨米数输入值
    shangjiangNum:'',
    // 打印米数
    dayinMeter:''
  },
  back() {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  //点击顶部分类
  changeType(e){
    this.setData({
      selectTypeIndex: e.currentTarget.dataset['index']
    })
    this.setData({
      pageSize:6
    })
    this.getList(e.currentTarget.dataset['index']);
  },
  //查询列表数据
  getList() {
    wx.stopPullDownRefresh()
    wx.showLoading({
      title:'正在加载'
    })
    let _this = this;
    let obj = _this.data.searchOrderId == -1 ? {
      rows: _this.data.pageSize,
      page: _this.data.page,
      type1: _this.data.selectTypeIndex,
      type: '',
      key: '',
      companyName:this.data.searchCompanyName,
      fkFabricId:this.data.searchFkFabricId,
      contacts:this.data.searchContacts,
      flowerNum:this.data.searchFlowerNum
    } : {
        rows: _this.data.pageSize,
        page: _this.data.page,
        type1: _this.data.selectTypeIndex,
        type: '',
        key: '',
        id: _this.data.searchOrderId,
        companyName: this.data.searchCompanyName,
        fkFabricId: this.data.searchFkFabricId,
        contacts: this.data.searchContacts,
        flowerNum: this.data.searchFlowerNum
      }
    if (_this.data.searchEndTime != null){
      obj.endTime = _this.data.searchEndTime+" 23:59:59";
    }
    // console.log(this.data.type)
    if(this.data.type != ''){
      obj.type = this.data.type
    }
    if (this.data.key != '') {
      obj.key = this.data.key
    }
    request.request('/order', obj, 'get','orderPart', (res) => {
      // console.log('订单列表',res)
      wx.showToast({
        title: '加载完成',
        duration:2000
      })
      let orderList = res.data.data.list;
      if(orderList.length>0){
        for (var i = 0; i < orderList.length; i++) {
          orderList[i].createTime = util.formatTime2(orderList[i].createTime)
          orderList[i].totalPrice = util.fmoney(orderList[i].totalPrice)
        }
      }
      _this.setData({
        orderList: orderList,
        imgBaseUrl: res.data.wwwFileBaseUrl,
        total: res.data.data.total
      });
    })
  },
  //点击驳回原因，跳转到审核结果页
  showResult(e){
    //存储订单信息
    wx.removeStorageSync("orderInfo")
    wx.setStorageSync("orderInfo", this.data.orderList[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/orderPart/orderResult/orderResult?code=-1&failMessage=' + e.currentTarget.dataset.message
    })
  },
  //点击审核按钮
  handlerReview(e){
    let _this = this;
    wx.showActionSheet({
      itemList: ['通过', '驳回'],
      success(res) {
        //点击通过
        if(res.tapIndex==0){
          wx.showLoading({
            title: '正在提交审核'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, { 
            type: 1, 
            note: '', 
            meter: 0, 
            okMeter: 0, 
            badMeter: 0, 
            expressNumber: '', 
            machineId: 0,
            machineName: '',
            id: e.currentTarget.dataset.id },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                duration: 2000,
                success: () => {
                  //刷新列表
                  _this.getList();
                  //_this.handlerExpedite(e.currentTarget.dataset.id);
                }
              })
            })
        }else{
          //点击驳回,跳转到驳回页面
          wx.navigateTo({
            url: '/pages/orderPart/turnDown/turnDown?id=' + e.currentTarget.dataset.id
          })
        }
      },
      fail(res) {
        //console.log(res.errMsg)
      }
    })
  },
  //审核通过后，确认是否要加急
  handlerExpedite(id) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '该订单要加急吗？',
      success(res) {
        if (res.confirm) {
          //点击确认加急
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/order/expedite/' + id, {},
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
          _this.getList();
        }
      }
    })
  },
  // 查看订单信息
  toOrderMsg(e){
    let role = wx.getStorageSync("userInfo").role;
    let msg = JSON.stringify(e.currentTarget.dataset.msg)
    let url = this.data.imgBaseUrl;
    wx.navigateTo({
      url: '/pages/orderPart/orderMsg/index?msg=' + msg + '&url=' + url,
    })
  },
  //点击调色按钮
  changeColor(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认已调色完成吗？',
      success(res) {
        if (res.confirm) {
          //点击确认已调色完成
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, {
            type: 11,
            note: '',
            meter: 0,
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: e.currentTarget.dataset.id
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //点击分配打印按钮
  handlerGive(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认已分配打印吗？',
      success(res) {
        if (res.confirm) {
          //点击确认已上浆
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, {
            type: 2,
            note: '',
            meter: 0,
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: e.currentTarget.dataset.id
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //打印员接单
  receivePrint(e){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认接单吗？',
      success(res) {
        if (res.confirm) {
          //点击确认接单
          wx.showLoading({
            title: '正在接单'
          })
          request.request('/order/open/onlinePrinter', {
            id: e.currentTarget.dataset.id
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //打印员点击换班
  changePrint(e){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认换班吗？',
      success(res) {
        if (res.confirm) {
          //点击确认换班
          wx.showLoading({
            title: '正在换班'
          })
          request.request('/order/close/onlinePrinter', {
            id: e.currentTarget.dataset.id
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //获取机器列表
  getMachineList(){
    let _this = this;
    let obj = {
      rows: 999999,
      page: 1,
      key: ''
    };
    request.request('/machine', obj, 'get', 'orderPart', (res) => {
      _this.setData({
        machineList: res.data.data.list
      });
    })
  },
  bindPickerChange(e){
    let _this = this;
    wx.showLoading({
      title: '正在分配打印'
    })
    request.request('/flow/' + e.currentTarget.dataset.id, {
      type: 3,
      note: '',
      meter: 0,
      okMeter: 0,
      badMeter: 0,
      expressNumber: '',
      id: e.currentTarget.dataset.id,
      machineId:_this.data.machineList[e.detail.value].id,
      machineName: _this.data.machineList[e.detail.value].name
    },
      'POST', 'orderPart', (res) => {
        wx.hideLoading();
        wx.showToast({
          title: res.data.message,
          duration: 2000,
          success: () => {
            _this.getList();
          }
        })
      })
  },
  //点击数量输入按钮显示打印米数输入框
  handlerHavePrint(e){
    // console.log(e)
    this.setData({
      finishMeter: e.currentTarget.dataset.finishmeter
    })
    this.setData({
      unfinishMeter: e.currentTarget.dataset.unfinishmeter
    })
    this.setData({
      dayinMeter:''
    })
    this.setData({
      orderId: e.currentTarget.dataset.id
    })
    //显示弹框
    this.setData({
      showPrintBox: true
    })
  },
  //米数输入框取消按钮
  cancelPrint(){
    this.setData({
      showPrintBox:false,
      dayinMeter:''
    })
  },
  // 上浆调拨输入框已调拨按钮
  toNext() {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否跳过上浆调拨',
      success(res) {
        if (res.confirm) {
          request.request('/flow/' + _this.data.orderId, {
            type: 2,
            note: '',
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: _this.data.orderId
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
              _this.cancelNext();
            })
        }
      }
    })
  },
  //打印米数输入框确认按钮
  surePrint(){
    let _this = this;
    //判断
    if (_this.data.dayinMeter==''){
      wx.showToast({
        title:'请输入打印米数',
        icon:'none'
      })
    } else if (_this.data.dayinMeter=='0') {
      wx.showToast({
        title: '请输入正确的打印米数',
        icon: 'none'
      })
    } else{
      wx.showLoading({
        title: '正在提交'
      })
      request.request('/flow/' + _this.data.orderId, {
        type: 4,
        note: '',
        meter: parseInt(_this.data.dayinMeter),
        okMeter: 0,
        badMeter: 0,
        expressNumber: '',
        machineId: 0,
        machineName: '',
        id: _this.data.orderId
      },
        'POST', 'orderPart', (res) => {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            duration: 2000,
            success: () => {
              _this.setData({
                showPrintBox: false
              })
              _this.getList();
            }
          })
        })
    }
  },
  //点击上浆调拨显示调拨米数输入框
  handlerNext(e) {
    const indexE = e.currentTarget.dataset.index
    const objE = this.data.orderList[indexE]
    // console.log(objE)
    this.setData({
      meter: ''
    })
    this.setData({
      orderId: e.currentTarget.dataset.id
    })
    const a = {
      fkCustomerId: objE.fkCustomerId,
      fkFabricId: objE.fkFabricId
    }
    // 上浆调拨显示库存
    request.request('/inventory/xcx', a, 'get', 'orderPart', (res) => {
      // console.log('库存', res)
      wx.showToast({
        title: res.data.message,
      })
      this.setData({
        num1: res.data.data.num1,
        rollNum: res.data.data.rollNum,
        inventoryId: res.data.data.id,
        num2: res.data.data.num2,
        showNextBox: true,
        meter:'',
        shangjiangNum:''
      })
      // let orderList = res.data.data.list;
      // if (orderList.length > 0) {
      //   for (var i = 0; i < orderList.length; i++) {
      //     orderList[i].createTime = util.formatTime2(orderList[i].createTime)
      //     orderList[i].totalPrice = util.fmoney(orderList[i].totalPrice)
      //   }
      // }
      // _this.setData({
      //   orderList: orderList,
      //   imgBaseUrl: res.data.wwwFileBaseUrl,
      //   total: res.data.data.total
      // });
    })
    //显示弹框
    // this.setData({
    //   showNextBox: true
    // })
  },
  // 上浆调拨输入框验证规则
  maxNum1(a){
    // console.log(a.detail.value)
    // console.log(this.data.num1)
    if (parseFloat(a.detail.value)>this.data.num1){
      this.setData({
        meter: this.data.num1
      })
    }else{
      this.setData({
        meter: a.detail.value
      })
    }
  },
  maxRollnum(a) {
    if (a.detail.value > this.data.rollNum) {
      this.setData({
        shangjiangNum: this.data.rollNum
      })
    }
  },
  //调拨米数输入框取消按钮
  cancelNext() {
    this.setData({
      showNextBox: false
    })
  },
  //调拨米数输入框确认按钮
  sureNext() {
    let _this = this;
    //判断
    if (_this.data.meter == '') {
      wx.showToast({
        title: '请输入米数',
        icon: 'none'
      })
    } else if (_this.data.shangjiangNum == '') {
      wx.showToast({
        title: '请输入匹数数',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '正在提交'
      })
      request.request('/inventory/transfer', {
        num: this.data.meter,
        rollNum: this.data.shangjiangNum,
        inventoryId: this.data.inventoryId,
      },
        'POST', 'orderPart', (res) => {
          // wx.hideLoading();
          // wx.showToast({
          //   title: res.data.message,
          // })
          // _this.getList();
          // _this.cancelNext();
          // console.log(res)
          if (res.data.code !== 0) {
            return wx.showToast({
              title: res.data.message,
            })} else{
            wx.showToast({
              title: res.data.message,
            })
          }
        })
      request.request('/flow/' + _this.data.orderId, {
        type: 2,
        note: '',
        meter: this.data.meter,
        okMeter: 0,
        badMeter: 0,
        expressNumber: '',
        id: _this.data.orderId
      },
        'POST', 'orderPart', (res) => {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
          })
          _this.getList();
          _this.cancelNext();
        })
    }
  },
  // 上浆调拨米数输入框
  bindMeterInput(e) {
    // console.log(e.detail.value)
    // console.log(this.data.unfinishMeter)
    // if (e.detail.value > this.data.unfinishMeter){
    //   e.detail.value = this.data.unfinishMeter
    // }
    this.setData({
      meter: e.detail.value
    })
  },
  // 上浆调拨匹数输入框
  bindShangjiangNumInput(e) {
    this.setData({
      shangjiangNum: e.detail.value
    })
  },
  // 打印米数输入框
  bindDayinMeterInput(e) {
    // console.log(e.detail.value)
    if (e.detail.value > this.data.unfinishMeter){
      this.setData({
        dayinMeter: this.data.unfinishMeter
      })
    }else{
      this.setData({
        dayinMeter: e.detail.value
      })
    }
  },
  //点击完成打印按钮待修改
  handlerHavePrintFinish(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认已经完成打印吗？',
      success(res) {
        if (res.confirm) {
          //点击完成打印
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, {
            type: 10,
            note: '',
            meter: 0,
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: e.currentTarget.dataset.id
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
              })
              _this.getList();
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //点击蒸化显示确认框
  handlerSteam(e){
    // console.log('蒸化按钮点击')
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认该订单已蒸化吗?',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, {
            type: 5,
            note: '',
            meter: 0,
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: e.currentTarget.dataset.id,
            machineId: 0,
            machineName: ''
          },
            'POST', 'orderPart', (res) => {
              // console.log(res)
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                duration: 2000,
                success: () => {
                  _this.getList();
                  // console.log('蒸化成功')
                }
              })
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  //点击检验显示检验米数输入框
  handlerCheck(e) {
    this.setData({
      orderId: e.currentTarget.dataset.id
    })
    // this.setData({
    //   okMeter: ''
    // })
    // this.setData({
    //   badMeter: ''
    // })
    // //显示弹框
    // this.setData({
    //   showCheckBox: true
    // })
    wx.navigateTo({
      url: '/pages/orderPart/flaw/index?orderId=' + this.data.orderId
    })
  },
  //检验米数输入框取消按钮
  cancelCheck() {
    this.setData({
      showCheckBox: false
    })
  },
  //检验米数输入框确认按钮
  sureCheck() {
    let _this = this;
    //判断
    if (_this.data.okMeter == '') {
      wx.showToast({
        title: '请输入合格数量',
        icon: 'none'
      })
    }else if (_this.data.badMeter == '') {
      wx.showToast({
        title: '请输入次品数量',
        icon: 'none'
      })
    } else if (_this.data.okMeter == '0'&&_this.data.badMeter == '0') {
      wx.showToast({
        title: '请输入正确的次品/合格数量',
        icon: 'none'
      })
    } else {
      wx.showLoading({
        title: '正在提交'
      })
      request.request('/flow/' + _this.data.orderId, {
        type: 6,
        note: '',
        meter: 0,
        okMeter: _this.data.okMeter,
        badMeter: _this.data.badMeter,
        expressNumber: '',
        machineId: 0,
        machineName: '',
        id: _this.data.orderId
      },
        'POST', 'orderPart', (res) => {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            duration: 2000,
            success: () => {
              _this.setData({
                showCheckBox: false
              })
              wx.navigateTo({
                url: '/pages/orderPart/flaw/index?orderId=' + _this.data.orderId
              })
              //_this.getList();
            }
          })
        })
    }
  },
  bindOkMeterInput(e) {
    this.setData({
      okMeter: e.detail.value
    })
  },
  bindBadMeterInput(e) {
    this.setData({
      badMeter: e.detail.value
    })
  },
  //点击发货审核
  handlerSendCheck(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '确认该订单通过发货审核吗?',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '正在提交'
          })
          request.request('/flow/' + e.currentTarget.dataset.id, {
            type: 9,
            note: '',
            meter: 0,
            okMeter: 0,
            badMeter: 0,
            expressNumber: '',
            id: e.currentTarget.dataset.id,
            machineId: 0,
            machineName: ''
          },
            'POST', 'orderPart', (res) => {
              wx.hideLoading();
              wx.showToast({
                title: res.data.message,
                duration: 2000,
                success:()=>{
                  _this.getList();
                }
              })
            })
        } else if (res.cancel) {
        }
      }
    })
  },
  bindCompanyNameChange(e){
    this.setData({
      companyIndex: e.detail.value
    })
    this.setData({
      companyName:this.data.expressCompanyList[e.detail.value]
    })
  },
  //点击发货显示快递单号输入框
  handlerSend(e) {
    this.setData({
      orderId: e.currentTarget.dataset.id
    })
    this.setData({
      companyName: '自提'
    })
    this.setData({
      expressNumber: ''
    })
    //显示弹框
    this.setData({
      showSendBox: true
    })
  },
  //快递单号输入框取消按钮
  cancelSend() {
    this.setData({
      showSendBox: false
    })
  },
  //快递单号输入框确认按钮
  sureSend() {
    let _this = this;
    //判断
    if (_this.data.companyName == '') {
      wx.showToast({
        title: '请输入快递公司',
        icon: 'none'
      })
    } else if (_this.data.companyName !='自提'&&_this.data.expressNumber == '') {
      wx.showToast({
        title: '请输入快递单号',
        icon: 'none'
      })
    }else {
      wx.showLoading({
        title: '正在提交'
      })
      request.request('/flow/' + _this.data.orderId, {
        type: 7,
        note: '',
        meter: 0,
        okMeter: 0,
        badMeter: 0,
        expressType: _this.data.companyName,
        expressNumber: _this.data.expressNumber,
        machineId: 0,
        machineName: '',
        id: _this.data.orderId
      },
        'POST', 'orderPart', (res) => {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            duration: 2000,
            success: () => {
              _this.setData({
                showSendBox: false
              })
              _this.getList();
            }
          })
        })
    }
  },
  bindExpressNumberInput(e) {
    this.setData({
      expressNumber: e.detail.value
    })
  },
  bindCompanyNameInput(e) {
    this.setData({
      companyName: e.detail.value
    })
  },
  //点击退货按钮显示退货备注输入框
  handlerReturn(e) {
    this.setData({
      orderId: e.currentTarget.dataset.id
    })
    this.setData({
      returnNote: ''
    })
    //显示弹框
    this.setData({
      showReturnBox: true
    })
  },
  //退货备注输入框取消按钮
  cancelReturnNote() {
    this.setData({
      showReturnBox: false
    })
  },
  //退货备注输入框确认按钮
  sureReturnNote() {
    let _this = this;
    //判断
    if (_this.data.returnNote == '') {
      wx.showToast({
        title: '请输入退货备注',
        icon: 'none'
      })
    }else {
      wx.showLoading({
        title: '正在提交'
      })
      request.request('/flow/' + _this.data.orderId, {
        type: 8,
        note: _this.data.returnNote,
        meter: 0,
        okMeter: 0,
        badMeter: 0,
        expressType:'',
        expressNumber: '',
        machineId: 0,
        machineName: '',
        id: _this.data.orderId
      },
        'POST', 'orderPart', (res) => {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            duration: 2000,
            success: () => {
              _this.setData({
                showReturnBox: false
              })
              _this.getList();
            }
          })
        })
    }
  },
  //点击评论按钮，跳转到评论页面
  goToRate(e){
    wx.navigateTo({
      url: "/pages/orderPart/rateOrder/index?orderId="+ e.currentTarget.dataset.id
    })
  },
  bindReturnNoteInput(e) {
    this.setData({
      returnNote: e.detail.value
    })
  },
  //厂长点击修改订单
  updateOrder(e){
    // console.log(e)
    //存储订单信息
    wx.removeStorageSync("orderInfo")
    wx.setStorageSync("orderInfo", this.data.orderList[e.currentTarget.dataset.index])
    wx.navigateTo({
      url: '/pages/order/order?orderUpdate=true'
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options)
    let _this = this;
    if (options["id"]){
      _this.setData({
        searchOrderId: options["id"]
      })
    }
    if(options.q){
      let id=options.q+"";
      let index = id.indexOf('%3D')+3;
      _this.setData({
        searchOrderId: id.substring(index,id.length)
      })
    }
    // console.log(options.orderStatus)
    if (options.orderStatus){
      let status = options.orderStatus;
      _this.setData({
        type: status
      })
    }
    if (options.key) {
      let status = options.key;
      _this.setData({
        key: status
      })
    }
    if (options.endTime) {
      let status = options.endTime;
      _this.setData({
        searchEndTime: status
      })
    }
    if (options.fkFabricId) {
      let status = options.fkFabricId;
      _this.setData({
        searchFkFabricId: status
      })
    }
    if (options.companyName) {
      let status = options.companyName;
      _this.setData({
        searchCompanyName: status
      })
    }
    if (options.contacts) {
      let status = options.contacts;
      _this.setData({
        searchContacts: status
      })
    }
    // console.log(options.flowerNum)
    if (options.flowerNum) {
      let status = options.flowerNum;
      _this.setData({
        searchFlowerNum: status
      })
    }
    // 判断是否为首页跳转
    if(options.type){
      _this.setData({
        selectTypeIndex: options.type
      })
    }
    _this.getList();
    wx.getStorage({
      key: 'userInfo',
      success(res) {
        if (res.data) {
          _this.setData({
            'userId': res.data.id
          })
          _this.setData({
            'role': res.data.role
          })
          //如果是打印组长，则事先获取打印员列表
          if (res.data.role == 4||res.data.role==2) {
            _this.getMachineList();
          }
        }
      }
    })
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
    this.getList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.total > this.data.pageSize){
      this.setData({
        pageSize: this.data.pageSize + 6
      })
      this.getList();
    }else{
      wx.showToast({
        title: '已全部加载完成',
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})