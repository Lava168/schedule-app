# Schedule Planner

A full-featured mobile schedule management app built with Expo and React Native, supporting event creation, editing, deletion, reminder scheduling, and calendar-based views. Users can conveniently manage daily schedules, set reminders for important events, and view all arrangements through an intuitive calendar interface.

## Features

- **Calendar View** — Interactive month-grid calendar with day selection, month navigation, and event indicator dots
- **Schedule List** — Chronologically grouped event list with section headers by date, "Today" highlight, and quick preview
- **Event Management** — Full CRUD: create, view, edit, and delete events with title, date, time range, and optional description
- **Local Reminders** — Schedule device-level push notifications via `expo-notifications` (at event time, or 5/10/15/30/60 minutes before)
- **Dark / Light Theme** — Automatic system theme detection with manual toggle; NativeWind (Tailwind CSS for RN) theming throughout
- **Cross-Platform** — Runs on iOS, Android, and Web via Expo
- **OAuth Authentication** — Manus OAuth 2.0 integration for user login and session management
- **Offline-First** — Events stored locally in AsyncStorage; no server dependency for core scheduling features

## Screenshots

| Calendar View | Schedule List | Create Event | Event Detail |
|:---:|:---:|:---:|:---:|
| Month grid with event dots | Grouped by date | Form with date/time pickers | View / Edit / Delete |

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Expo](https://expo.dev) 54, React Native 0.81, React 19 |
| **Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing) |
| **Styling** | [NativeWind](https://www.nativewind.dev/) 4 (Tailwind CSS for React Native) |
| **State** | React Context + AsyncStorage (events), TanStack React Query 5 (server state) |
| **Backend** | Express + [tRPC](https://trpc.io/) 11, MySQL + [Drizzle ORM](https://orm.drizzle.team/) |
| **Auth** | OAuth 2.0 (Manus SDK), JWT via `jose`, Secure Store |
| **Notifications** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) (local push) |
| **Storage** | S3-compatible (Forge API) for file uploads |
| **Language** | TypeScript throughout |

## Project Structure

```
schedule-app/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout (providers, theme)
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Calendar tab (month grid + daily events)
│   │   └── schedule.tsx        # Schedule list tab (sectioned by date)
│   ├── event/
│   │   ├── create.tsx          # Create new event form
│   │   └── [id].tsx            # Event detail / edit screen
│   ├── oauth/
│   │   └── callback.tsx        # OAuth callback handler
│   └── dev/
│       └── theme-lab.tsx       # Theme development playground
├── components/
│   ├── calendar.tsx            # Month calendar grid component
│   ├── event-card.tsx          # Event list item card
│   ├── screen-container.tsx    # SafeAreaView wrapper
│   ├── themed-view.tsx         # Theme-aware View
│   ├── haptic-tab.tsx          # Tab button with haptic feedback
│   └── ui/                     # Reusable UI primitives
├── server/
│   ├── routers.ts              # tRPC router definitions
│   ├── db.ts                   # Database helpers (user CRUD)
│   ├── storage.ts              # S3 file storage
│   └── _core/                  # Express server, auth, context
├── lib/
│   ├── event-store.tsx         # Event state management + AsyncStorage
│   ├── date-utils.ts           # Date formatting/parsing helpers
│   ├── notification-service.ts # expo-notifications wrapper
│   ├── trpc.ts                 # tRPC client setup
│   └── theme-provider.tsx      # Theme context provider
├── shared/                     # Shared types and constants
├── hooks/                      # Custom React hooks
├── constants/                  # App-wide constants and config
├── types/                      # TypeScript type definitions
├── drizzle/                    # Database schema and migrations
├── tests/                      # Unit tests (Vitest)
└── scripts/                    # Utility scripts
```

## Data Model

```typescript
interface Event {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  description?: string;
  reminder?: number;     // Minutes before event (-1 = none, 0 = at time, 5/10/15/30/60)
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}
```

Events are stored locally in AsyncStorage (`@schedule_events`). The MySQL database (via Drizzle) is used only for user accounts.

## Reminder Options

| Option | Value |
|--------|-------|
| No reminder | -1 |
| At event time | 0 |
| 5 minutes before | 5 |
| 10 minutes before | 10 |
| 15 minutes before | 15 |
| 30 minutes before | 30 |
| 1 hour before | 60 |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** (package manager)
- **MySQL** database (for user auth)
- **Expo CLI** (`npx expo`)

### Installation

```bash
git clone https://github.com/Lava168/schedule-app.git
cd schedule-app
pnpm install
```

### Environment Setup

Create a `.env` file based on your environment:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/schedule_app

# OAuth
OAUTH_SERVER_URL=https://your-oauth-server
APP_ID=your-app-id

# Server
PORT=3000
EXPO_PORT=8081

# Storage (optional)
S3_ENDPOINT=https://your-s3-endpoint
S3_BUCKET=your-bucket
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
```

### Database Migration

```bash
pnpm db:push
```

### Run Development Server

```bash
pnpm dev
```

This starts both the Express backend and the Expo Metro bundler concurrently.

### Platform-Specific

```bash
pnpm android    # Run on Android
pnpm ios        # Run on iOS
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start backend + Metro concurrently |
| `pnpm dev:server` | Start Express/tRPC backend in watch mode |
| `pnpm dev:metro` | Start Expo Metro bundler (web) |
| `pnpm build` | Bundle server with esbuild |
| `pnpm start` | Run production server |
| `pnpm check` | TypeScript type check |
| `pnpm lint` | ESLint check |
| `pnpm format` | Prettier format |
| `pnpm test` | Run tests (Vitest) |
| `pnpm db:push` | Generate and run database migrations |

## User Flows

### Create an Event

1. Tap the **+** button on the Calendar or Schedule tab
2. Fill in the event title (required), date, start/end time
3. Optionally add a description and set a reminder
4. Tap **Save** — the event appears on the calendar with an indicator dot

### View and Edit

1. Tap a date on the calendar to see its events
2. Tap an event card to open the detail view
3. Tap **Edit** to modify, then **Save**

### Delete an Event

1. Open the event detail view
2. Tap **Delete** and confirm
3. Associated notifications are automatically cancelled

## Color Scheme

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| primary | `#3B82F6` | `#60A5FA` | Selected date, buttons, accents |
| background | `#FFFFFF` | `#151718` | Page background |
| surface | `#F8FAFC` | `#1E2022` | Cards, event items |
| foreground | `#1E293B` | `#F1F5F9` | Primary text |
| muted | `#64748B` | `#94A3B8` | Secondary text |
| border | `#E2E8F0` | `#334155` | Borders, dividers |
| success | `#10B981` | `#34D399` | Success states |
| warning | `#F59E0B` | `#FBBF24` | Reminder indicators |
| error | `#EF4444` | `#F87171` | Delete, errors |

## License

MIT

---

# 日程规划器

一款功能完善的移动端日程安排应用，基于 Expo 和 React Native 构建，支持事件创建、编辑、删除、提醒设置以及基于日历的视图展示。用户可以方便地管理日常日程，设置重要事件提醒，并通过直观的日历界面查看所有安排。

## 功能特性

- **日历视图** — 交互式月份网格日历，支持日期选择、月份切换、事件指示点显示
- **日程列表** — 按日期分组的事件列表，带有日期分区标题、"今天"高亮和快速预览
- **事件管理** — 完整的增删改查：创建、查看、编辑和删除事件，支持标题、日期、时间范围和可选描述
- **本地提醒** — 通过 `expo-notifications` 调度设备级推送通知（事件开始时，或提前 5/10/15/30/60 分钟）
- **深色/浅色主题** — 自动检测系统主题并支持手动切换；全局 NativeWind (Tailwind CSS for RN) 主题方案
- **跨平台** — 通过 Expo 在 iOS、Android 和 Web 上运行
- **OAuth 认证** — 集成 Manus OAuth 2.0 用户登录和会话管理
- **离线优先** — 事件本地存储于 AsyncStorage，核心日程功能无需服务器依赖

## 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | [Expo](https://expo.dev) 54、React Native 0.81、React 19 |
| **路由导航** | [Expo Router](https://docs.expo.dev/router/introduction/)（基于文件的路由） |
| **样式** | [NativeWind](https://www.nativewind.dev/) 4（React Native 版 Tailwind CSS） |
| **状态管理** | React Context + AsyncStorage（事件）、TanStack React Query 5（服务端状态） |
| **后端** | Express + [tRPC](https://trpc.io/) 11、MySQL + [Drizzle ORM](https://orm.drizzle.team/) |
| **认证** | OAuth 2.0（Manus SDK）、通过 `jose` 实现 JWT、Secure Store |
| **通知** | [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)（本地推送） |
| **存储** | S3 兼容存储（Forge API）用于文件上传 |
| **语言** | 全栈 TypeScript |

## 项目结构

```
schedule-app/
├── app/                        # Expo Router 页面
│   ├── _layout.tsx             # 根布局（Provider、主题）
│   ├── (tabs)/
│   │   ├── _layout.tsx         # 标签栏配置
│   │   ├── index.tsx           # 日历标签页（月份网格 + 当日事件）
│   │   └── schedule.tsx        # 日程列表标签页（按日期分区）
│   ├── event/
│   │   ├── create.tsx          # 创建新事件表单
│   │   └── [id].tsx            # 事件详情 / 编辑页面
│   ├── oauth/
│   │   └── callback.tsx        # OAuth 回调处理
│   └── dev/
│       └── theme-lab.tsx       # 主题开发调试页
├── components/                 # UI 组件
│   ├── calendar.tsx            # 月份日历网格组件
│   ├── event-card.tsx          # 事件列表卡片
│   ├── screen-container.tsx    # SafeAreaView 包装器
│   └── ui/                     # 可复用 UI 基础组件
├── server/                     # 后端服务
│   ├── routers.ts              # tRPC 路由定义
│   ├── db.ts                   # 数据库操作（用户 CRUD）
│   └── _core/                  # Express 服务器、认证、上下文
├── lib/                        # 工具库
│   ├── event-store.tsx         # 事件状态管理 + AsyncStorage 持久化
│   ├── date-utils.ts           # 日期格式化/解析工具函数
│   ├── notification-service.ts # expo-notifications 封装
│   └── theme-provider.tsx      # 主题上下文 Provider
├── shared/                     # 共享类型和常量
├── hooks/                      # 自定义 React Hooks
├── constants/                  # 全局常量和配置
├── types/                      # TypeScript 类型定义
├── drizzle/                    # 数据库模式和迁移
├── tests/                      # 单元测试（Vitest）
└── scripts/                    # 工具脚本
```

## 数据模型

```typescript
interface Event {
  id: string;
  title: string;
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:mm
  endTime: string;       // HH:mm
  description?: string;
  reminder?: number;     // 提前提醒分钟数（-1 = 无, 0 = 开始时, 5/10/15/30/60）
  notificationId?: string;
  createdAt: string;
  updatedAt: string;
}
```

事件数据本地存储在 AsyncStorage（`@schedule_events`）中。MySQL 数据库（通过 Drizzle）仅用于用户账户管理。

## 提醒选项

| 选项 | 值 |
|------|-----|
| 无提醒 | -1 |
| 事件开始时 | 0 |
| 5 分钟前 | 5 |
| 10 分钟前 | 10 |
| 15 分钟前 | 15 |
| 30 分钟前 | 30 |
| 1 小时前 | 60 |

## 快速开始

### 前置要求

- **Node.js** >= 18
- **pnpm**（包管理器）
- **MySQL** 数据库（用于用户认证）
- **Expo CLI**（`npx expo`）

### 安装

```bash
git clone https://github.com/Lava168/schedule-app.git
cd schedule-app
pnpm install
```

### 环境配置

根据你的环境创建 `.env` 文件：

```env
# 数据库
DATABASE_URL=mysql://user:password@localhost:3306/schedule_app

# OAuth
OAUTH_SERVER_URL=https://your-oauth-server
APP_ID=your-app-id

# 服务器
PORT=3000
EXPO_PORT=8081

# 存储（可选）
S3_ENDPOINT=https://your-s3-endpoint
S3_BUCKET=your-bucket
S3_ACCESS_KEY=your-key
S3_SECRET_KEY=your-secret
```

### 数据库迁移

```bash
pnpm db:push
```

### 启动开发服务器

```bash
pnpm dev
```

此命令会同时启动 Express 后端和 Expo Metro 打包器。

### 平台特定启动

```bash
pnpm android    # 在 Android 上运行
pnpm ios        # 在 iOS 上运行
```

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `pnpm dev` | 同时启动后端和 Metro |
| `pnpm dev:server` | 以监听模式启动 Express/tRPC 后端 |
| `pnpm dev:metro` | 启动 Expo Metro 打包器（Web） |
| `pnpm build` | 使用 esbuild 打包服务端 |
| `pnpm start` | 运行生产环境服务器 |
| `pnpm check` | TypeScript 类型检查 |
| `pnpm lint` | ESLint 检查 |
| `pnpm format` | Prettier 格式化 |
| `pnpm test` | 运行测试（Vitest） |
| `pnpm db:push` | 生成并执行数据库迁移 |

## 用户操作流程

### 创建事件

1. 在日历或日程标签页点击右上角 **+** 按钮
2. 填写事件标题（必填）、选择日期、设置开始/结束时间
3. 可选：添加描述、设置提醒时间
4. 点击 **保存** — 事件出现在日历上并显示指示点

### 查看和编辑

1. 在日历上点击某个日期查看当日事件
2. 点击事件卡片进入详情页
3. 点击 **编辑** 进行修改，完成后点击 **保存**

### 删除事件

1. 打开事件详情页
2. 点击 **删除** 并确认
3. 相关的通知提醒会自动取消

## 配色方案

| 标记 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| primary | `#3B82F6` | `#60A5FA` | 选中日期、按钮、强调色 |
| background | `#FFFFFF` | `#151718` | 页面背景 |
| surface | `#F8FAFC` | `#1E2022` | 卡片、事件项背景 |
| foreground | `#1E293B` | `#F1F5F9` | 主要文字 |
| muted | `#64748B` | `#94A3B8` | 次要文字 |
| border | `#E2E8F0` | `#334155` | 边框、分割线 |
| success | `#10B981` | `#34D399` | 成功状态 |
| warning | `#F59E0B` | `#FBBF24` | 提醒标记 |
| error | `#EF4444` | `#F87171` | 删除、错误 |

## 许可证

MIT
