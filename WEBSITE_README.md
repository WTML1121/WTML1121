# 天依 MMD 官方网站

网站采用无框架依赖的静态 HTML / CSS / JavaScript，通过现有仓库 `WTML1121/WTML1121` 的 GitHub Pages 发布。仓库原 README 保留；本文件说明新增官网。

已发布官网：https://wtml1121.github.io/WTML1121/

## 本地开发

```bash
python3 -m http.server 18100 --bind 127.0.0.1 --directory public
# 打开 http://127.0.0.1:18100/
node --check public/app.js
python3 tools/check_site.py
python3 tools/build.py
```

`public/` 是唯一公开发布目录，`dist/` 由构建工具生成。所有资源使用相对路径，兼容 GitHub Pages 项目子路径。页面无第三方字体、CDN 脚本、分析追踪或运行时 npm 依赖；视频点击后才加载，不有声自动播放。

## 内容事实

- 原视频是 27 秒功能示意，明确标注非实机录屏；官网原帧不伪装成 APK 截图。
- 项目方在本次开发中确认“全部功能都可以使用了”，据此介绍角色/动作、三角色编排、三种光影、可选 AI 和跨端项目接力能力。
- 未提供 APK 和已发布 Release，不伪造版本、大小、日期、SHA256 或下载链接。
- 作者和测试 QQ 取自用户视频：歪头美啦、3256364096，备注“天依MMD测试”。

逐段证据见 [docs/VIDEO_ANALYSIS.md](docs/VIDEO_ANALYSIS.md)，媒体来源和时间码见 [docs/media-provenance.json](docs/media-provenance.json)。

## 更新入口

- 页面文案与结构：`public/index.html`
- 视觉与手机断点：`public/styles.css`
- 菜单、视频、图片预览和下载展示：`public/app.js`
- 网站与未来 API 配置预留：`public/data/site.json`
- 真实版本元数据：`public/data/release.json`
- 视频和截图：`public/assets/`
- Pages 自动发布：`.github/workflows/pages.yml`

GitHub Releases 上传真实 APK 后，用 `tools/update_release.py` 同时核对本地文件大小、SHA256 与平台附件摘要，再写入版本元数据。发布及后续更新步骤见 [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)。

官网不包含现有会员后端源码、数据库、私钥、管理员信息或 Cloudflare 凭据，也不依赖手机服务器持续在线。将来接账号/会员功能应沿用服务器已有 v1 协议，另行确认正式 HTTPS API；不要把 localhost 或任何 Token 写进官网。
