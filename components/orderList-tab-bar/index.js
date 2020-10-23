import request from "../../utils/request.js";
Component({
  properties:{
    selected: {
      type: Number,
      value: 0
    }
  },
  data: {
    color: "#a9b7b7",
    selectedColor: "#1B82D2;",
    borderStyle: 'black',
    list: [{
      "selectedIconPath": "../../pages/images/orderList/homeImg.png",
      "iconPath": "../../pages/images/orderList/homeImg.png",
      "pagePath": "pages/orderPart/orderIndex/index",
      "text": "首页"
    },
    {
      "selectedIconPath": "../../pages/images/orderList/orderImg.png",
      "iconPath": "../../pages/images/orderList/orderImg.png",
      "pagePath": "pages/orderPart/orderList/orderList",
      "text": "订单"
    },
    {
      "selectedIconPath": "../../pages/images/orderList/searchImg.png",
      "iconPath": "../../pages/images/orderList/searchImg.png",
      "pagePath": "pages/search/searchNow/search",
      "text": "搜索"
    },
    {
      "selectedIconPath": "../../pages/images/orderList/myImg.png",
      "iconPath": "../../pages/images/orderList/myImg.png",
      "pagePath": "pages/user/userHome/index",
      "text": "我的"
    }]
  },
  attached() {

  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset;
      const url = data.path;
      wx.reLaunch({
        url: '/' + url
      })
    }
  },
})