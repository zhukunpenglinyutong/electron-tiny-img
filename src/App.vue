<template>
  <div class="main">
    <div class="top">
      <div class="upload-main">
        <el-button @click="clear" size="mini" type="primary" icon="el-icon-delete" class="clear-btn">清空当前上传内容</el-button>
        <a-upload-dragger
          v-if="isUpload"
          name="file"
          :multiple="true"
          :director="true"
          :default-file-list="[]"
          :before-upload="beforeUpload"
          @change="handleChange"
        >
          <p class="ant-upload-drag-icon">
            <a-icon type="inbox" />
          </p>
          <p class="ant-upload-text">你可以点击上传，或者拖拽上传（支持文件夹，单文件，多文件）</p>
        </a-upload-dragger>
      </div>
      <el-button class="upload-btn" type="danger" @click="imgCompression">执行图片压缩</el-button>
    </div>
    <a-divider dashed />
    <el-table
      :data="tableData"
      style="width: 100%;"
      height="420"
      border>
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="80">
      </el-table-column>
      <el-table-column
        label="图片名称"
        align="center"
        prop="path"
        width="260">
      </el-table-column>
      <el-table-column
        label="压缩前 kb"
        align="center"
        prop="input"
        width="160">
      </el-table-column>
      <el-table-column label="进度" align="center">
        <template slot-scope="scope">
          <a-progress v-if="scope.row.percent !== 100" :percent="scope.row.percent" status="active" />
          <a-progress v-else :percent="scope.row.percent" />
        </template>
      </el-table-column>
      <el-table-column
        label="压缩后 kb"
        align="center"
        prop="output"
        width="100">
      </el-table-column>
      <el-table-column
        label="压缩比例"
        align="center"
        width="100">
        <template slot-scope="scope">
          <span style="color: #72c040; font-weight: 600;">{{ scope.row.ratio }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="180">
        <template slot-scope="scope">
          <el-button @click="recompression(scope.row)" type="primary">重新压缩</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { fileList } from './plugin/@electron-tinypng/index.js'
import { readDirToPathArr } from './plugin/node-tool/index.js'

export default {

  data() {
    return {
      files: [], // 上传的文件的列表
      tableData: [], // 压缩过程预览表格
      info: undefined,
      isUpload: true // 重置加载组件使用
    }
  },
  methods: {

    // 图片压缩（核心方法）
    imgCompression() {

      // 容错处理
      if (this.info === undefined) {
        this.$message.error(`请上传内容之后，在执行压缩`);
        return;
      }
      
      this.uploadStatus() // 处理文件上传 & 文件夹上传的多种情况
      this.execution() // 完成情况进度加载 初始化
      console.log(this.files, this.reduceCallback)
      fileList(this.files, this.reduceCallback) // 执行压缩
    },

    // 重新压缩
    recompression(row) {
      row.percent = 35;
      row.input = row.output
      row.output = ''
      fileList([row.imgpath], this.reduceCallback) // 执行压缩
    },

    // 清空数据
    clear() {
      this.files = [];
      this.tableData = [];
      this.info = undefined;
      this.isUpload = false
      setTimeout(() => {
        this.isUpload = true
      }, 100);
    },

    // 上传情况处理
    uploadStatus() {
      this.files = []
      this.info.fileList.forEach(fileItem => {
        /image/.test(fileItem.type)
          ? this.files.push(fileItem.originFileObj.path)
          : this.files = [...this.files, ...readDirToPathArr(fileItem.originFileObj.path)];
      })
    },

    // 完成情况进度加载 初始化
    execution() {
      this.tableData = [] 
      this.files.forEach(file => {
        let path = file.split('/')[file.split('/').length - 1];
        if (path.split('.')[1] === 'png' || path.split('.')[1] === 'jpg') {
          this.tableData.push({
            path: path,
            percent: 35,
            imgpath: file
          })
        }
      })
    },

    // 完成的回调事件（主要是更改完成进度表格的情况）
    reduceCallback(resData) {
      console.log('完成了 数据是：', resData)
      this.tableData.forEach(item => {
        if (item.path === resData.currentImg) {
          item.percent = 100;
          item.input = resData.input;
          item.output = resData.output;
          item.ratio = resData.ratio;
        }
      })
    },
    
    // 禁止主动上传
    beforeUpload() {
      return false;
    },
    
    // 监听改变之后的内容
    handleChange(info) {
      this.info = info
      this.$message.success(`上传成功, 目前共有：${this.info.fileList.length} 项`);
    },

  }
}
</script>

<style lang="less" scoped>
.main {
  padding: 50px 20px 20px;
}

.top {
  width: 1000px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  overflow-y: hidden;

  .clear-btn {
    position: absolute;
    z-index: 2;
    right: 20px;
    top: 20px;
  }

  .upload-main {
    height: 160px;
    width: 600px;
    position: relative;

    .ant-upload-list {
      display: none;
    }
  }

  .upload-btn {
    width: 150px;
    height: 50px;
  }
}
</style>