## 前端移动 App 搭建与运行（Expo）

目标：在你的安卓手机上，跑起来“燃气配送助手”App 的开发版。

前端技术栈：**React Native + Expo**

### 一、安装 Node.js 和 npm

如果你已经在后端部分安装过 Node.js，可以跳过本节。

在终端中确认：

```bash
node -v
npm -v
```

有版本号就说明安装好了。

### 二、进入前端项目并安装依赖

在终端执行：

```bash
cd /rondsai/lab/lizhiyuan/codes/self_app/mobile-app
npm install
```

第一次会花一点时间下载依赖。

### 三、安装 Expo CLI（可选）

你可以全局安装，也可以每次用 `npx`。

全局安装方式：

```bash
npm install -g expo-cli
```

如果安装过程遇到权限问题，可以加 `sudo` 或使用 `npx expo` 代替。

### 四、配置后端 API 地址

我们在 `app.json` 里预留了一个 `extra.apiBaseUrl` 字段。

打开 `mobile-app/app.json`，找到：

```json
"extra": {
  "eas": {
    "projectId": "replace-with-your-project-id"
  },
  "apiBaseUrl": "http://192.168.0.100:4000"
}
```

请把 `192.168.0.100` 改成你电脑在局域网中的 IP 地址（在后端文档中已经说明如何查 IP）。

例如你的电脑 IP 是 `192.168.1.10`，则改为：

```json
  "apiBaseUrl": "http://192.168.1.10:4000"
```

端口号需要和后端 `.env` 里的 `PORT` 一致（默认 4000）。

### 五、在手机上安装 Expo Go

1. 打开安卓手机的应用商店（或 Google Play）。
2. 搜索并安装 **“Expo Go”** 应用。

这是一个通用 App，用来预览你自己开发的 React Native 应用。

### 六、启动前端开发服务器

在 `mobile-app` 目录中执行：

```bash
npx expo start
```

控制台会出现一个二维码，同时在浏览器中打开一个 Expo DevTools 页面。

如果你有安装 Expo CLI，也可以：

```bash
expo start
```

### 七、用手机打开 App

1. 确认电脑和手机在 **同一个 WiFi**。
2. 手机打开 **Expo Go**。
3. 用手机扫描终端/浏览器中显示的二维码。
4. 等待打包加载完毕后，就能在手机上看到“燃气配送助手”的界面：
   - 首先是 **登录界面**；
   - 登录成功后是 **配送列表（暂用列表代替地图）**。

> 注意：如果加载失败，多半是网络问题（不能互通）或后端没跑起来。  
> 请先确认：  
> - 后端 `npm run dev` 在运行，并能访问 `http://电脑IP:4000/health`；  
> - `app.json` 中 `apiBaseUrl` 写的是 **电脑的 IP**，不是 `localhost`。

### 八、简单操作流程

1. 打开 App，进入登录页。
2. 输入你在数据库中创建的配送员手机号和密码。
3. 登录后进入“配送地图”页（当前以列表形式展示待配送订单）。
4. 点击“智能路径规划”：
   - 首次会弹出系统权限申请，允许定位；
   - 后端会返回推荐顺序，在列表中按顺序排列。
5. 点击每一项中的“导航”：
   - 会尝试通过 URL 调起安卓手机上的 **高德地图 App**；
   - 如果手机未安装，会提示错误。
6. 完成配送后，点击“已配送”：
   - 会调用后端接口把订单状态改为 `done`；
   - 再次刷新列表时，该订单会消失。

### 九、后续你可以继续完善的点

- 把当前列表形式的 `MapScreen` 替换为真正的高德地图组件：  
  使用 `react-native-amap3d` 或 Expo 中的 `WebView` 嵌入高德 JS 地图，把每个 `household` 的经纬度画成 Marker。
- 在 `SettingsScreen` 中加入选项：选择默认导航软件（高德/百度），修改跳转 URL。
- 在 `ContactDetailScreen` 中增加：查看该联系人的所有家庭地址、历史配送记录，新建今日订单等。

