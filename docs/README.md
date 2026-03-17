## 项目说明总览

这是一个为 **燃气配送员** 设计的应用，包括：

- **移动端 App（React Native + Expo）**：用于记录客户、查看待配送列表、发起导航、标记已配送、查看统计。
- **后端服务（Node.js + Express + TypeScript）**：提供用户/联系人/家庭/订单/统计等 API。
- **数据库（MySQL + Prisma ORM）**：保存配送员、联系人、家庭地址、订单、备注等信息。

项目目录结构：

- `backend/`：后端服务源码
- `mobile-app/`：移动端 App 源码
- `docs/`：文档（你最常看的就是这里）

使用顺序建议：

1. 先看 `docs/backend-setup.md`，把后端搭建好，并启动成功。
2. 再看 `docs/mobile-setup.md`，在手机上跑起来 App。
3. 遇到问题或要打包发布时，看 `docs/debug-and-build.md`。

### 快速说明：如何打包生成安卓 APK

详细步骤请看 `docs/debug-and-build.md` 的「安卓 APK 打包（使用 EAS Build）」一节，这里给一个**最简流程速查**：

1. **安装 EAS CLI 并登录 Expo**

```bash
npm install -g eas-cli
eas login
```

2. **在移动端项目中初始化 EAS**

```bash
cd /rondsai/lab/lizhiyuan/codes/self_app/mobile-app
eas init
```

3. **确认 Android 包名**

编辑 `mobile-app/app.json`，保证有类似配置（可以按需修改为你自己的前缀）：

```json
"android": {
  "package": "com.example.gasdelivery"
}
```

4. **云端构建 APK**

```bash
cd /rondsai/lab/lizhiyuan/codes/self_app/mobile-app
eas build -p android --profile preview
```

首构建时按提示一路选择（证书建议选择自动生成）。构建完成后，终端会给出一个下载链接，你可以：

- 在手机浏览器中直接打开链接下载并安装；
- 或者先下载到电脑，再拷贝到手机安装。

> 如果你在任意一步遇到错误或看不懂提示，可以把终端输出复制给我，我会帮你逐步排查。

