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

