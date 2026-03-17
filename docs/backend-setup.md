## 后端搭建教程（面向零基础）

目标：在你的电脑上，把后端服务跑起来，让手机 App 可以通过 HTTP 访问。

后端技术栈：**Node.js + Express + TypeScript + MySQL + Prisma**

### 一、前置软件安装

#### 1. 安装 Node.js

1. 打开浏览器访问 Node.js 官网，下载 **LTS 版本** 安装包。
2. 安装完成后，在终端（命令行）中输入：

```bash
node -v
npm -v
```

有版本号输出即可。

#### 2. 安装 MySQL

你可以选择：

- 直接安装 MySQL 服务器（本机）
- 或者使用 Docker 运行 MySQL（推荐如果你熟悉 Docker）

##### 方式 A：本机安装 MySQL（适合新手）

1. 安装 MySQL Community Server（选择默认配置即可）。
2. 记住你设置的：
   - **root 用户密码**
3. 安装完后，用图形工具或命令行创建一个数据库：

```sql
CREATE DATABASE gas_delivery DEFAULT CHARACTER SET utf8mb4;
```

记住连接参数，例如：

- 主机：`localhost`
- 端口：`3306`
- 用户：`root`
- 密码：你的密码
- 数据库名：`gas_delivery`

##### 方式 B：使用 Docker 运行 MySQL（如果你有 Docker）

在终端运行：

```bash
docker run --name gas-mysql -e MYSQL_ROOT_PASSWORD=your_password -e MYSQL_DATABASE=gas_delivery -p 3306:3306 -d mysql:8
```

把 `your_password` 改成你自己的密码。

### 二、配置后端项目

在终端中进入项目根目录：

```bash
cd /rondsai/lab/lizhiyuan/codes/self_app/backend
```

#### 1. 安装依赖

```bash
npm install
```

#### 2. 配置环境变量 `.env`

复制示例文件：

```bash
cp .env.example .env
```

打开 `.env` 文件，根据你的 MySQL 配置修改 `DATABASE_URL`：

```env
DATABASE_URL="mysql://root:你的密码@localhost:3306/gas_delivery"
PORT=4000
JWT_SECRET="随便写一个较长的字符串即可"
```

> 注意：`root`、`你的密码`、`localhost`、`3306`、`gas_delivery` 根据你真实情况调整。

### 三、初始化数据库（Prisma）

#### 1. 生成 Prisma Client

```bash
npm run prisma:generate
```

#### 2. 创建数据表（迁移，默认方式：有创建数据库权限）

第一次运行迁移：

```bash
npm run prisma:migrate -- --name init
```

这一步会：

- 连接 MySQL
- 根据 `prisma/schema.prisma` 创建表

如果报错，多半是 `DATABASE_URL` 或 MySQL 没启动，检查后重试。

#### 3. 如果你的数据库账号没有「创建新数据库」权限（只能使用现有数据库）

有些云数据库或托管环境只允许你使用已经创建好的数据库（例如只给你一个 `gas_delivery` 数据库），**不能执行 `CREATE DATABASE`**。这种情况下，`npm run prisma:migrate` 可能会报类似错误：

```text
Prisma Migrate could not create the shadow database. Please make sure the database user has permission to create databases.
User `xxx` was denied access on the database `gas_delivery`
```

这不是连接问题，而是 Prisma 在执行迁移时，默认会尝试创建一个「影子数据库（shadow database）」用来对比 schema，但你当前账号没有建库权限。

此时可以改用 **`prisma db push`** 直接在现有数据库里创建 / 更新表结构，而不使用迁移文件和 shadow database：

1. 确保 `.env` 中的 `DATABASE_URL` 指向你已经创建好的数据库（例如 `gas_delivery`）：

   ```env
   DATABASE_URL="mysql://你的用户:你的密码@你的数据库地址:端口/gas_delivery"
   ```

2. 在 `backend` 目录执行：

   ```bash
   npx prisma db push
   ```

   这一命令会：

   - 直接连接到 `DATABASE_URL` 对应的数据库；
   - 根据 `prisma/schema.prisma` 创建 / 修改表；
   - **不会尝试创建新的数据库，也不会使用 shadow database**。

3. 执行完成后，你可以在图形工具（如 DBeaver）中打开 `gas_delivery` 数据库，检查是否已经自动生成了相关表（如 `User`、`Courier` 等对应的表）。

> 提示：在“没有建库权限、只能用已有库”的环境中，开发阶段只用 `npx prisma db push` 即可完成表结构初始化与更新；如果将来迁移到有完整权限的数据库，再考虑使用 `npm run prisma:migrate` 来生成正式的迁移文件。

**说明（UUID + 联系人归属）：** 当前项目所有主键均为 UUID（随机字符串），且联系人（Contact）与配送员（Courier）绑定，每个登录用户只能看到、操作自己创建的联系人。若你之前已经跑过旧版迁移（自增 id、联系人未绑定用户），需要先重置数据库再迁移，否则会因字段类型不兼容而失败：

```bash
cd backend
npx prisma migrate reset
```

按提示确认后，会重新执行全部迁移并应用新 schema。

### 四、启动后端服务

开发模式启动：

```bash
npm run dev
```

看到类似输出：

```text
Backend server is running on http://localhost:4000
```

说明后端已经跑起来。

你可以在浏览器访问：

```text
http://localhost:4000/health
```

如果返回：

```json
{"status":"ok"}
```

就成功了。

### 五、创建一个测试配送员账号

当前后端示例只实现了登录接口，没有暴露注册接口，你可以通过 Prisma Studio 或直接插入一条测试数据。

#### 1. 使用 Prisma Studio（图形界面方式）

在 `backend` 目录执行：

```bash
npx prisma studio
```

浏览器会打开一个界面，选择 `Courier` 表，手动添加一条记录：

- `name`: 随便写，如：`测试配送员`
- `phone`: 如：`13800000000`
- `password`: 需要是 **bcrypt 加密后的字符串**（这对新手有点麻烦）

#### 2. 简单方式：临时放开密码校验（开发阶段）

为了方便你快速跑通流程，可以先把 `backend/src/routes/auth.ts` 中的密码校验逻辑理解为“只要手机号存在就可以登录”，等你熟悉之后再加强安全。

当前代码中是严格校验密码的，如果你不会手动插入加密密码，可以暂时用下面的思路：

1. 直接在数据库 `Courier` 表里插入一条记录，把 `password` 随便填一个字符串（例如 `123456`）。
2. 后续如果登录总失败，可以让我帮你把登录逻辑改成临时不校验密码（开发模式专用）。

> 建议：你先完成后端和前端跑通，如果登录遇到问题，再单独告诉我，我给你精确改动片段。

### 六、让手机可以访问后端

如果你在同一局域网中用手机测试（比如家里的 WiFi）：

1. 确认电脑和手机在 **同一个 WiFi**。
2. 在电脑上查看本机 IP 地址，例如 `192.168.0.100`。
3. 确认后端监听端口是 `4000`（`.env` 中的 `PORT`）。

那么手机要访问的地址就是：

```text
http://192.168.0.100:4000
```

记住这个地址，后面前端 App 要配置。

