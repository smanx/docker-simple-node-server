# 使用官方的Node.js镜像作为基础镜像
FROM node:alpine3.21

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json（如果存在）到工作目录
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]