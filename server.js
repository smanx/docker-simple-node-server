const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();
const PORT = 3000;
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
const FIXED_FILE_NAME = 'downloaded-file.txt'; // 固定的文件名
const FILE_PATH = path.join(DOWNLOADS_DIR, FIXED_FILE_NAME); // 文件的完整路径

// 确保下载目录存在
if (!fs.existsSync(DOWNLOADS_DIR)){
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// 下载文件并覆盖现有文件
function downloadFile(url, filePath, res) {
  const fileStream = fs.createWriteStream(filePath, { flags: 'w' }); // 使用 'w' 标志来覆盖文件

  https.get(url, (downloadRes) => {
    downloadRes.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close(() => {
        res.send(`File downloaded (or overwritten) to ${filePath}`);
      });
    });

    downloadRes.on('error', (err) => {
      res.status(500).send(`Error downloading file: ${err.message}`);
    });
  }).on('error', (err) => {
    res.status(500).send(`Error initiating download: ${err.message}`);
  });
}

// 路由：处理下载请求
app.get('/download', (req, res) => {
  const urlParam = req.query.url;
  if (!urlParam) {
    return res.status(400).send('URL parameter is missing.');
  }

  const fileUrl = decodeURIComponent(urlParam);
  downloadFile(fileUrl, FILE_PATH, res);
});

// 路由：返回文件内容
app.get('/file-content', (req, res) => {
  fs.readFile(FILE_PATH, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).send('File not found. It might be empty if the download failed.');
      }
      return res.status(500).send(`Error reading file: ${err.message}`);
    }

    res.send(data); // 返回文件内容
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});