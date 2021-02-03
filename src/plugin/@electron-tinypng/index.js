/**
 * electron版本的图片压缩工具
 * 
 * 优化：通过 X-Forwarded-For 添加了动态随机伪IP，绕过 tinypng 的上传数量限制
 *
 *  */

const fs = window.require("fs");
const path = window.require("path");
const https = window.require("https");
const { URL } = window.require("url");

const exts = [".jpg", ".png"];
const max = 10000000

const options = {
  method: "POST",
  hostname: "tinypng.com",
  path: "/web/shrink",
  headers: {
    rejectUnauthorized: false,
    "Postman-Token": Date.now(),
    "Cache-Control": "no-cache",
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
  },
};

let reduceCallback = null;

// 获取文件列表
export function fileList(files, callback) {
  reduceCallback = callback;
  files.forEach((full) => {
    fileFilter(full);
  });
}

// 过滤文件格式，返回所有jpg,png图片
function fileFilter(file) {
  fs.stat(file, (err, stats) => {
    if (err) return console.error(err);
    if (
      // 必须是文件，小于10MB，后缀 jpg||png
      stats.size <= max &&
      stats.isFile() &&
      exts.includes(path.extname(file))
    ) {
      // 通过 X-Forwarded-For 头部伪造客户端IP
      options.headers["X-Forwarded-For"] = getRandomIP();
      fileUpload(file); // console.log('可以压缩：' + file);
    }
  });
}

// 异步API,压缩图片
// {"error":"Bad request","message":"Request is invalid"}
// {"input": { "size": 887, "type": "image/png" },"output": { "size": 785, "type": "image/png", "width": 81, "height": 81, "ratio": 0.885, "url": "https://tinypng.com/web/output/7aztz90nq5p9545zch8gjzqg5ubdatd6" }}
function fileUpload(img) {
  let req = https.request(options, function (res) {
    res.on("data", async (buf) => {
      let obj = JSON.parse(buf.toString());
      if (obj.error) {
        console.log(`[${img}]：压缩失败！报错：${obj.message}`);
      } else {
        await fileUpdate(img, obj);
      }
    });
  });
  req.write(fs.readFileSync(img), "binary");
  req.on("error", (e) => {
    console.error(e);
  });
  req.end();
}

// 该方法被循环调用,请求图片数据
function fileUpdate(imgpath, obj) {
  return new Promise((resovle, rejet) => {
    if (!fs.existsSync(imgpath)) {
      fs.mkdirSync(imgpath);
    }

    let options = new URL(obj.output.url);
    let req = https.request(options, (res) => {
      let body = "";
      res.setEncoding("binary");
      res.on("data", function (data) {
        body += data;
      });
      res.on("end", function () {
        fs.writeFile(imgpath, body, "binary", (err) => {
          if (err) {
            console.error(err);
            rejet(err)
          }
          // 消息通知
          let imgpathArr = imgpath.split('/');
          const myNotification = new Notification('图片压缩成功通知', {
            body: `[${imgpathArr[imgpathArr.length - 1]}] 原始大小：${obj.input.size / 1000}kb，压缩后：${obj.output.size / 1000}kb，压缩比例：${Math.ceil((1 - obj.output.ratio) * 100)}%`
          })
          
          reduceCallback({
            input: obj.input.size / 1000, // 压缩前大小（kb）
            output: obj.output.size / 1000, // 压缩后大小（kb）
            imgpath: imgpath, // 图片路径
            currentImg: imgpathArr[imgpathArr.length - 1], // 当前图片的名称
            ratio: Math.ceil((1 - obj.output.ratio) * 100) + '%' // 压缩比例 
          })

          myNotification.onclick = () => { }
          resovle();
        });
      });
    });
    req.on("error", (e) => {
      console.error(e);
    });
    req.end();
  })
}

// 生成随机IP， 赋值给 X-Forwarded-For
function getRandomIP() {
  return Array.from(Array(4))
    .map(() => parseInt(Math.random() * 255))
    .join(".");
}