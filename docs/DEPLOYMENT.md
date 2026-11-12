# 官网部署与后续更新

## 现有仓库与发布方式

复用用户提供的 `https://github.com/WTML1121/WTML1121.git`。初检只有初始 README，没有 Pages 或 Release。保留原 README，不创建重复仓库。官网仅发布 `public/` 构建出的 `dist/`，不发布父目录服务器文件。

GitHub Pages 仓库设置使用 GitHub Actions，`.github/workflows/pages.yml` 在 main 的官网内容变化或手动触发时执行：检出→Python 安全构建→上传 dist→Pages 发布。使用标准 ubuntu-latest 公共仓库托管，不开通付费服务。

正式地址已由 GitHub Pages 返回并实际验收：`https://wtml1121.github.io/WTML1121/`；项目名同用户名不等于用户站点专用仓库 `WTML1121.github.io`，所以保留 `/WTML1121/` 子路径。

## 更新文字、截图和视频

1. 只在独立官网仓库中编辑 `public`；不要在服务器项目根目录执行 `git add .` 后推到 GitHub。
2. 改 `public/index.html` 文案，截图必须来自真实来源。现有视频帧仍标记“示意、非实机”。新增实机截图需明确来源，不混淆。
3. 替换介绍视频时保留浏览器兼容的 H.264/AAC、yuv420p、faststart。可运行 `python3 tools/prepare_media.py /本机/新介绍视频.mp4`，但脚本当前截帧时间码与说明对应原 27 秒视频；新视频时须同步调整脚本与证据文档，不能盲用旧时间码。
4. 执行 `node --check public/app.js`、`python3 tools/check_site.py`、`python3 tools/build.py`，本机浏览器检查手机和电脑布局。
5. 提交官网文件到 main，查看 Actions “发布天依 MMD 官网”。成功后以 HTTPS 地址复验图片、视频和下载入口。失败时先看 Actions 日志，不删除数据库、重装宝塔或调整服务器端口。

## 发布真实 APK

目前没有 APK，下载状态为未发布；**没有创建假 Release 或占位 APK**。

有真实 APK 后，在可信本机终端进入此官网仓库：

```bash
# 版本号、文件路径、说明文件均换成真实值；这是操作模板，当前没有执行发布 APK。
gh release create 实际版本号 /本机/实际文件.apk \
  --repo WTML1121/WTML1121 \
  --title '实际版本名称' --notes-file /本机/实际更新说明.txt
python3 tools/update_release.py \
  --tag 实际版本号 --apk /本机/实际文件.apk \
  --notes /本机/实际更新说明.txt
python3 tools/build.py
```

`update_release.py` 拒绝草稿、缺附件、文件大小不一致、GitHub SHA256 缺失或不一致；不会上传任何文件或把 APK 混入 Pages 仓库。它只生成真实 `public/data/release.json`。请核对并提交此文件到 main，官网会显示真实版本、MiB 大小、北京时间发布日期、更新内容、“立即下载”以及校验信息。

构建和静态检查同时支持未发布与真实发布状态：未发布时禁止假元数据，已发布时检查完整版本、附件、日期、校验值和更新说明；不需要首次发布时手工改检查代码。

文件校验以实际字节 SHA256 为准，不是文件名。官网提供复制摘要和本地浏览器校验（128 MiB 以内以控制手机内存；文件不上传）。大文件可用系统工具：Linux `sha256sum 文件.apk`，Windows PowerShell `Get-FileHash 文件.apk -Algorithm SHA256`。哈希只能证明与公布附件一致，不替代安卓系统签名、权限和来源检查。

GitHub 官方支持 Release 附件 SHA256 摘要：[附件 API](https://docs.github.com/en/rest/releases/assets)、[发布摘要说明](https://github.blog/changelog/2025-06-03-releases-now-expose-digests-for-release-assets/)。

## 会员与服务器扩展

`public/data/site.json` 预留 integrations，当前 enabled=false，全部 URL 为 null。页面不向手机服务器发请求，不出现失效的 localhost 登录入口。将来只填真实正式 HTTPS URL，并沿用 `tianyi-mmd-server-handoff` 的 API v1；账号、会员与管理员认证仍属于既有后端，本官网不另建一套。

Cloudflare / SMTP / 数据库 / Ed25519 私钥均不得放入静态配置。不要为了官网登录功能将管理员后台暴露到 Pages 或公开复制后端交接包。

## 回滚与备份

官网源码是独立 Git 仓库，原 README 保留。页面有问题可回退本次官网提交后重跑 Pages，或恢复已知正常的静态版本；无需更换会员数据库或密钥。发布目录约 1 MiB，完整媒体包含 0.80 MB 视频，不上传 4.34 MB 原始视频或服务器任何备份。

GitHub Pages 有使用与带宽限制，流量增长后需查看实际额度：[官方限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。本次不配置收费 CDN、云存储或独立付费域名。
