<template>
  <div id="app">
    <title></title>
    <div class="container">
      <div class="ctrl">
        <button type="button" class="btn btn-default" @click="newMockModal=true">
          + 新增mock项
        </button>
        <modal :show.sync="newMockModal" cancel-text="取消" ok-text="确定" title="新增mock项" :callback=addNewMockData :large=true>
          <div slot="modal-body" class="modal-body">
            <div class="row">
              <label>匹配URL：</label><input type="text" name="urlReg" v-model="newMock.urlReg">
            </div>
            <div class="row">
              <div class="group">
                <label>Status Code：</label><input type="text" name="urlReg" v-model="newMock.statusCode">
              </div>
              <div class="group jsonp-group">
                <input type="checkbox" name="jsonp" v-model="newMock.jsonp"><span>JSONP</span>
              </div>
            </div>
            <div class="row">
              <label>Headers：</label>
              <textarea name="headers" v-model="newMock.headersStr"></textarea>
            </div>
            <div class="row">
              <label>Body: </label>
              <textarea name="body" v-model="newMock.body"></textarea>
            </div>
          </div>
        </modal>
      </div>
      <panel v-for="mock in mockData | formatMockList" :header="mock.urlReg" :status="mock.enabled">
        <div class="row">
          <div class="group">
            <span class="mock-label">匹配URL：</span><div class="mock-content">{{ mock.urlReg }}</div>
          </div>
          <div class="group">
            <span class="mock-label">当前状态：</span><div class="mock-content">{{ mock.enabled?'启用中':'停用' }}</div>
          </div>
        </div>
        <div class="row">
          <div class="group">
            <span class="mock-label">Status Code：</span><div class="mock-content">{{ mock.statusCode }}</div>
          </div>
          <div class="group">
            <span class="mock-label">JSONP：</span><div class="mock-content">{{ mock.jsonp }}</div>
          </div>
        </div>
        <div class="row">
          <span class="mock-label">Headers：</span>
          <div class="mock-content">
            <ul>
              <li v-for="header in mock.headers">{{ $key }}: {{ header }}</li>
            </ul>
          </div>
        </div>
        <div class="row">
          <span class="mock-label">body</span>
          <div class="mock-content">
            <pre>{{ mock.body | formatJSONStr }}</pre>
          </div>
        </div>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" @click="showEditMockModal(mock)">编辑</button>
          <button type="button" class="btn" :class="{'btn-success': !mock.enabled, 'btn-warning': mock.enabled}" @click="toggleEnabled(mock.urlReg, mock.enabled)">{{ mock.enabled?"停用":"启用" }}</button>
          <button type="button" class="btn btn-danger" @click="deleteMockData(mock.urlReg)">删除</button>
        </div>
      </panel>
    </div>
    <alert
      :show.sync="showTop"
      :duration="1500"
      type="danger"
      width="400px"
      placement="top"
      dismissable>
      <span class="icon-info-circled alert-icon-float-left"></span>
      <strong>{{ alertInfo }}</strong>
    </alert>
    <alert
      :show.sync="showTopSuccess"
      :duration="1500"
      type="success"
      width="400px"
      placement="top"
      dismissable>
      <span class="icon-info-circled alert-icon-float-left"></span>
      <strong>{{ alertInfo }}</strong>
    </alert>
    <modal :show.sync="editMockModal" cancel-text="取消" ok-text="确定" title="编辑mock项" :callback=editMockData :large=true>
      <div slot="modal-body" class="modal-body">
        <div class="row">
          <label>匹配URL：</label><span>{{ editMock.urlReg }}</span>
        </div>
        <div class="row">
          <div class="group">
            <label>Status Code：</label><input type="text" name="urlReg" v-model="editMock.statusCode">
          </div>
          <div class="group jsonp-group">
            <input type="checkbox" name="jsonp" v-model="editMock.jsonp"><span>JSONP</span>
          </div>
        </div>
        <div class="row">
          <label>Headers：</label>
          <textarea name="headers" v-model="editMock.headersStr"></textarea>
        </div>
        <div class="row">
          <label>Body: </label>
          <textarea name="body" v-model="editMock.body"></textarea>
        </div>
        <alert
          :show.sync="showTop"
          :duration="1500"
          type="danger"
          width="400px"
          placement="top"
          dismissable>
          <span class="icon-info-circled alert-icon-float-left"></span>
          <strong>{{ alertInfo }}</strong>
        </alert>
      </div>
    </modal>
  </div>
</template>

<script>
import title from './components/title';
import panel from './components/panel';
import { modal, alert } from 'vue-strap';

export default {
  components: {
    title,
    panel,
    modal,
    alert
  },
  data() {
    return {
      mockData: [],
      newMockModal: false,
      editMockModal: false,
      showTop: false,
      showTopSuccess: false,
      newMock: {
        urlReg: '',
        enabled: false,
        jsonp: false,
        statusCode: '200',
        jsonpReg: '',
        headers: {},
        headersStr: `{"Content-Type":"text/html"}`,
        body: '',
      },
      editMock: {
        urlReg: '',
        enabled: false,
        jsonp: false,
        statusCode: '200',
        jsonpReg: '',
        headers: {},
        headersStr: '',
        body: '',
      },
      alerts:{
        noUrlReg: 'urlReg不能为空！',
        notValidUrlReg: 'urlReg无效！',
        notValidJsonpReg: 'jsonpReg无效！',
        notValidheaders: 'headers格式错误，非有效json',
        noStatusCode: 'statusCode不能为空！',
        notValidStatusCode: 'statusCode无效，应为3位数字！',
        noBody: 'body不能为空！',
        newMockData: '成功添加新Mock项！',
        editMockData: '成功编辑Mock项！',
        delMockData: '成功删除！',
        enableMockData: '成功启用！',
        disableMockData: '成功停用！'
      },
      alertInfo: ''
    }
  },
  ready() {
    this.$http.get('/mockData').then((response) => {
      this.mockData = response.json();
      console.log(response.json());
    }, (response) => {
      console.log(response);
    });
  },
  methods: {
    addNewMockData() {

      this.newMock.urlReg = this.newMock.urlReg.trim();
      this.newMock.statusCode = this.newMock.statusCode.trim();
      this.newMock.headersStr = this.newMock.headersStr.trim();
      this.newMock.body = this.newMock.body.trim();

      if(!this.validateInfo(this.newMock)){return;}

      //如果没有填写header，加个默认
      this.newMock.enabled = true;
      if(!this.newMock.headersStr) {
        this.newMock.headers = {
          "Content-Type": "text/html"
        }
      }

      console.log(this.newMock.headers);
      this.$http.post('/addMockData', this.newMock).then((response) => {
        let res = response.json();
        if(res.result == 1) {
          console.log('成功添加！');
          this.newMockModal = false;
          this.alertInfo = this.alerts.newMockData;
          this.showTopSuccess = true;
          this.mockData = res.mockData;
        }
      }, (response) => {
        console.log(response);
      });
    },
    deleteMockData(urlReg) {
      this.$http.post('/delMockData', {urlReg: urlReg}).then((response) => {
        let res = response.json();
        if(res.result == 1) {
          console.log('成功删除！');
          this.alertInfo = this.alerts.delMockData;
          this.showTopSuccess = true;
          this.mockData = res.mockData;
        }
      }, (response) => {
        console.log(response);
      });
    },
    toggleEnabled(urlReg, enabled) {
      if(enabled) {
        this.$http.post('/disableMockData', {urlReg: urlReg}).then((response) => {
          let res = response.json();
          console.log(res);
          if(res.result == 1) {
            console.log('成功停用！');
            this.alertInfo = this.alerts.disableMockData;
            this.showTopSuccess = true;
            this.mockData = res.mockData;
          }
        }, (response) => {
          console.log(response);
        });
      }else {
        this.$http.post('/enableMockData', {urlReg: urlReg}).then((response) => {
          let res = response.json();
          if(res.result == 1) {
            console.log('成功启用！');
            this.alertInfo = this.alerts.enableMockData;
            this.showTopSuccess = true;
            this.mockData = res.mockData;
          }
        }, (response) => {
          console.log(response);
        });
      }
    },
    showEditMockModal(mockData) {
      this.editMock = mockData;
      console.log(this.editMock.headers);
      if(this.editMock.headers) {
        this.editMock.headersStr = JSON.stringify(this.editMock.headers, 4);
      }
      this.editMockModal = true;
    },
    editMockData() {
      this.editMock.urlReg = this.editMock.urlReg.trim();
      this.editMock.statusCode = this.editMock.statusCode.trim();
      this.editMock.headersStr = this.editMock.headersStr.trim();
      this.editMock.body = this.editMock.body.trim();

      if(!this.validateInfo(this.editMock)){return;}

      //如果没有填写header，加个默认
      if(!this.editMock.headersStr) {
        this.editMock.headers = {
          "Content-Type": "text/html"
        }
      }

      this.$http.post('/editMockData', this.editMock).then((response) => {
        let res = response.json();
        if(res.result == 1) {
          console.log('成功编辑！');
          this.editMockModal = false;
          this.alertInfo = this.alerts.editMockData;
          this.showTopSuccess = true;
          this.mockData = res.mockData;
        }
      }, (response) => {
        console.log(response);
      });
    },
    validateInfo(mockData) {
      //urlReg不能为空
      if(!mockData.urlReg) {
        this.alertInfo = this.alerts.noUrlReg;
        this.showTop = true;
        return false;
      }
      //检查urlReg有效性
      try{
        let testUrlReg = new RegExp(mockData.urlReg, 'i');
      }catch(e) {
        this.alertInfo = this.alerts.notValidUrlReg + e;
        this.showTop = true;
        return false;
      }
      //检查statusCode有效性且不能为空
      if(!mockData.statusCode) {
        this.alertInfo = this.alerts.noStatusCode;
        this.showTop = true;
        return false;
      }else if (mockData.statusCode.search(/^\d{3}$/) == -1) {
        this.alertInfo = this.alerts.notValidStatusCode;
        this.showTop = true;
        return false;
      }
      //检查headers格式
      if(mockData.headersStr) {
        try{
          mockData.headers = JSON.parse(mockData.headersStr);
        }catch(e){
          this.alertInfo = this.alerts.notValidheaders + e;
          this.showTop = true;
          return false;
        }
      }
      //body不能为空
      if(!mockData.body) {
        this.alertInfo = this.alerts.noBody;
        this.showTop = true;
        return false;
      }
      return true;
    }
  }
}
</script>

<style lang="scss">
@import '../node_modules/ress/dist/ress.min.css';
@import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
@import './common/sass/bass';

html {
  height: 100%;
}
body {
  font: normal 14px/22px "Hiragino Sans GB", "Microsoft YaHei", "\5FAE\8F6F\96C5\9ED1", sans-serif;/*no*/
  height: 100%;
}
.container {
  margin: 0 auto;
}
.ctrl {
  overflow: hidden;
  margin: 20px 0;
}
button {
  float: right;
  margin: 0 20px;
}
.row {
  display: flex;
  padding: 0 50px;
  margin: 5px 0;
  .group {
    flex: 1;
    display: flex;
  }
  .mock-label {
    width: 150px;
    flex-shrink: 0;
  }
  input {
    border: 1px solid #ccc;
    flex: 1;
  }
  input[type="checkbox"] {
    margin-left: 20px;
    margin-right: 10px;
    margin-top: 0;
    flex: initial;
  }
  textarea {
    border: 1px solid #ccc;
    flex: 1;
    height: 100px;
    resize: none;
  }
  textarea[name="body"] {
    height: 300px;
  }
  label {
    width: 150px;
    flex-shrink: 0;
  }
  .mock-content {
    flex: 1;
    ul {
      margin-left: 20px;
    }
    pre {
      width: 100%;
      height: 300px;
    }
  }
  .jsonp-group {
    align-items: center;
  }
  span {
    margin-left: 0;
  }
}
.btn-row{
  .btn {
      margin: 0 5px;
  }
}
.modal-footer .btn{
  margin: 0 5px;
}
</style>
