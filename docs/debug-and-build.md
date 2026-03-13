## 调试与打包指南

本文件帮助你在开发过程中排查问题，并最终打包出安卓 APK 安装包。

### 一、后端调试

#### 1. 启动方式回顾

在 `backend` 目录：

```bash
npm run dev
```

这会以开发模式启动，支持代码修改后自动重启。

#### 2. 查看日志

后端日志直接打印在终端里：

- 如果有错误堆栈（很多英文），你可以直接复制给我，我帮你分析。
- 常见错误：
  - `ECONNREFUSED`：通常是 MySQL 没启动或地址错误；
  - `PrismaClientInitializationError`：`DATABASE_URL` 配置不对；
  - 端口被占用：已经有另一个程序占用了 `4000` 端口，可以改 `.env` 中 `PORT`。

你也可以通过访问接口来简单测试：

```text
http://localhost:4000/health
```

浏览器返回 `{"status":"ok"}` 说明后端正常。

### 二、前端调试（Expo）

#### 1. 启动前端

在 `mobile-app` 目录：

```bash
npx expo start
```

#### 2. 使用 Expo DevTools

Expo 启动后会在浏览器打开一个 DevTools 页面：

- 你可以看到连接的设备（你的手机）；
- 可以重启、清缓存（`Restart` / `Clear cache and restart`）。

#### 3. 查看前端日志

- 在 Expo DevTools 中点击“Logs”；
- 或者在终端里直接看到 React Native 的日志；
- 出错时通常会在手机上显示一个红色错误页面，里面有堆栈信息。

遇到问题时，可以：

1. 截图错误信息；
2. 或复制错误文字；
3. 发给我，我帮你定位。

### 三、常见网络问题排查

如果 App 提示“请求失败”或白屏：

1. 确认后端是否在运行：`npm run dev` 终端有没有挂着。
2. 在电脑浏览器访问 `http://电脑IP:4000/health` 是否正常。
3. 确认 `mobile-app/app.json` 中的 `apiBaseUrl` 与后端实际地址一致。
4. 确认手机和电脑在同一个 WiFi 网段。

如果你不确定 IP、端口、配置是否正确，把这些信息截图发给我即可。

### 四、安卓 APK 打包（使用 EAS Build）

Expo 官方推荐使用 EAS Build 打包，无需本机安装 Android Studio。

#### 1. 注册 Expo 账号

1. 打开 `https://expo.dev`；
2. 注册一个账号（邮箱/ GitHub 登录均可）。

#### 2. 安装 EAS CLI

在任意终端中执行：

```bash
npm install -g eas-cli
```

登录：

```bash
eas login
```

按提示输入你的 Expo 账号和密码。

#### 3. 在项目中初始化 EAS

回到 `mobile-app` 目录：

```bash
cd /rondsai/lab/lizhiyuan/codes/self_app/mobile-app
eas init
```

按提示一路回车即可。

#### 4. 配置 Android 包名

在 `app.json` 中确保：

```json
"android": {
  "package": "com.example.gasdelivery"
}
```

你可以把 `com.example.gasdelivery` 改为你自己的前缀，例如 `com.yourname.gasdelivery`。

#### 5. 触发云端打包

执行：

```bash
eas build -p android --profile preview
```

首次执行会：

- 让你选择是否自动生成证书（选择“是”即可，EAS 帮你管理）；
- 上传项目代码到 Expo 云端，开始构建。

构建完成后，终端和网页中会出现一个下载链接：

- 你可以直接在手机浏览器打开这个链接下载 APK；
- 或者下载到电脑后，通过数据线拷贝到手机安装。

### 五、安装和测试 APK

1. 把 APK 文件拷贝到安卓手机；
2. 在手机上找到这个文件并点击安装；
3. 安装后在应用列表找到你的 App 名称（如“GasDelivery”）；
4. 打开后，和开发版的操作流程相同：
   - 登录；
   - 查看配送列表；
   - 智能路径规划；
   - 调起导航；
   - 标记“已配送”。

### 六、如果你遇到问题怎么办？

如果以上某一步你感觉“看不懂 / 不会操作”，你可以：

1. 告诉我“你做到哪一步了”；
2. 把终端里的报错、或屏幕截图发给我；
3. 我会根据你的实际情况，给出一步一步的操作指引（甚至可以帮你改代码）。

你可以简单说：“我现在卡在 XXX 这一步”，不用顾虑术语是否正确，我会帮你翻译成技术步骤。

