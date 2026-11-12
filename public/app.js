'use strict';
const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const toastNode = $('#toast'); let toastTimer;
function toast(message) { clearTimeout(toastTimer); toastNode.textContent = message; toastNode.hidden = false; toastTimer = setTimeout(() => { toastNode.hidden = true; }, 4500); }
const menuButton = $('#menu-toggle'); const nav = $('#main-nav');
function closeMenu() { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', '打开导航'); }
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') !== 'true'; menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? '关闭导航' : '打开导航'); nav.classList.toggle('open', open); });
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
document.addEventListener('click', e => { if (!$('#header').contains(e.target)) closeMenu(); });
if ('IntersectionObserver' in window && !reduced) { document.documentElement.classList.add('has-motion'); const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); observer.unobserve(e.target); } }); }, { threshold: 0.06 }); document.querySelectorAll('.reveal').forEach(el => observer.observe(el)); }
const backTop = $('#back-top'); let scrollScheduled = false;
window.addEventListener('scroll', () => { if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(() => { backTop.hidden = scrollY < 650; scrollScheduled = false; }); } }, { passive: true });
backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }));
$('#current-year').textContent = new Date().getFullYear();

const imageDialog = $('#image-dialog'); const imagePreview = $('#preview-image'); const infoDialog = $('#info-dialog');
function closeImage() { imageDialog.close(); }
$('#image-close').addEventListener('click', closeImage);
document.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => { const caption = button.dataset.caption; imagePreview.src = button.dataset.image; imagePreview.alt = caption; $('#preview-caption').textContent = caption; imageDialog.showModal(); }));
imageDialog.addEventListener('close', () => imagePreview.removeAttribute('src'));
for (const dialog of [imageDialog, infoDialog]) { dialog.addEventListener('click', e => { const rect = dialog.getBoundingClientRect(); if (e.target === dialog && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) dialog.close(); }); }
function info(title, body) { $('#info-title').textContent = title; $('#info-body').textContent = body; if (!infoDialog.open) infoDialog.showModal(); }
$('#info-close').addEventListener('click', () => infoDialog.close()); $('#info-ok').addEventListener('click', () => infoDialog.close());
$('#privacy-button').addEventListener('click', () => info('隐私与素材说明', '本站不设置账号系统，不使用分析追踪或广告 Cookie。视频仅在点击播放后加载。\n\n本地 APK 校验只在浏览器内计算，不上传文件。GitHub Pages / Releases 的网络服务可能按其自身政策处理访问日志。\n\n视频与截图来自项目方提供的介绍材料，画面为功能示意，非实机录屏。软件功能已由项目方确认可用，具体设备兼容和版本信息以正式发布说明为准。'));
async function copy(value, fallbackTitle) { try { if (!navigator.clipboard?.writeText) throw new Error(); await navigator.clipboard.writeText(value); toast('已复制'); } catch { info(fallbackTitle, '浏览器未开放自动复制，请长按复制：\n\n' + value); } }
$('#copy-qq').addEventListener('click', () => copy('3256364096', '复制测试 QQ'));

const video = $('#intro-video'); const cover = $('#video-cover'); const loading = $('#video-loading'); const videoError = $('#video-error'); let desiredTime = 0; let videoStarted = false;
function seekDesired() { if (video.readyState >= 1 && Number.isFinite(video.duration)) video.currentTime = Math.min(desiredTime, Math.max(0, video.duration - 0.1)); }
function playAt(seconds, scroll = true) { desiredTime = Number(seconds) || 0; videoError.hidden = true; cover.hidden = true; loading.hidden = false; video.controls = true; if (!videoStarted) { video.src = 'assets/introduction.mp4'; videoStarted = true; video.load(); } else seekDesired(); const promise = video.play(); if (promise) promise.catch(e => { loading.hidden = true; if (e.name === 'NotAllowedError') { cover.hidden = false; toast('轻触视频播放按钮继续'); } else if (e.name !== 'AbortError') { videoError.hidden = false; } }); if (scroll) $('#demo').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); }
video.addEventListener('loadedmetadata', seekDesired);
video.addEventListener('playing', () => { loading.hidden = true; cover.hidden = true; videoError.hidden = true; });
video.addEventListener('waiting', () => { if (!video.paused) loading.hidden = false; });
video.addEventListener('canplay', () => { loading.hidden = true; });
video.addEventListener('pause', () => { loading.hidden = true; });
video.addEventListener('error', () => { loading.hidden = true; cover.hidden = true; videoError.hidden = false; });
video.addEventListener('ended', () => { loading.hidden = true; cover.hidden = false; cover.querySelector('strong').textContent = '再看一遍'; });
video.addEventListener('timeupdate', () => { const buttons = [...document.querySelectorAll('[data-chapter]')]; const active = buttons.filter(b => Number(b.dataset.chapter) <= video.currentTime).at(-1); buttons.forEach(b => { b.classList.toggle('active', b === active); if (b === active) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); });
cover.addEventListener('click', () => playAt(0, false)); $('#video-retry').addEventListener('click', () => { videoStarted = false; playAt(desiredTime, false); });
document.querySelectorAll('[data-play]').forEach(b => b.addEventListener('click', () => playAt(b.dataset.play)));
document.querySelectorAll('[data-chapter]').forEach(b => b.addEventListener('click', () => playAt(b.dataset.chapter, false)));

let release = null;
function safeRelease(data) { if (!data || data.published !== true || typeof data.version !== 'string' || !data.version.trim() || !Number.isSafeInteger(data.sizeBytes) || data.sizeBytes <= 0 || typeof data.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(data.sha256) || !Number.isFinite(Date.parse(data.publishedAt))) return false; try { const apk = new URL(data.apkUrl); const page = new URL(data.releaseUrl); return apk.protocol === 'https:' && apk.hostname === 'github.com' && !apk.username && !apk.password && apk.pathname.startsWith('/WTML1121/WTML1121/releases/download/') && apk.pathname.toLowerCase().endsWith('.apk') && page.protocol === 'https:' && page.hostname === 'github.com' && !page.username && !page.password && page.pathname.startsWith('/WTML1121/WTML1121/releases/tag/') && Array.isArray(data.notes) && data.notes.length > 0 && data.notes.every(n => typeof n === 'string' && n.trim()); } catch { return false; } }
function displaySize(bytes) { return (bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 2 : 1) + ' MiB'; }
function renderRelease(data) { if (!safeRelease(data)) return; release = data; $('#release-version').textContent = data.version; $('#release-size').textContent = displaySize(data.sizeBytes); $('#release-date').textContent = new Date(data.publishedAt).toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }); $('#release-sha-label').textContent = 'SHA-256 · 已提供'; $('#release-status').textContent = '安卓版本 · GitHub Releases'; $('#release-badge').textContent = '已发布'; $('#download-button span').textContent = '立即下载 ' + data.version; $('#release-description').textContent = '下载来自项目的 GitHub Releases。安装前可核对下方版本信息与 SHA-256 校验值。'; $('#download-note').textContent = 'GitHub 下载速度随网络环境而异，请保留浏览器的安全检查。'; $('#checksum-panel').hidden = false; $('#release-sha').textContent = data.sha256; const notes = $('#release-notes'); notes.hidden = false; const heading = document.createElement('h3'); heading.textContent = data.version + ' 更新内容'; const list = document.createElement('ul'); data.notes.forEach(note => { const li = document.createElement('li'); li.textContent = note; list.append(li); }); notes.replaceChildren(heading, list); }
fetch('data/release.json', { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(); return r.json(); }).then(renderRelease).catch(() => { $('#download-note').textContent = '版本信息暂时未能读取，尚未开放下载。请稍后刷新查看。'; });
$('#download-button').addEventListener('click', () => { if (!release) { info('下载即将开放', '目前尚未提供可公开下载的 APK，版本号、大小和发布日期均未公布。\n\n你可以通过测试 QQ 3256364096 联系项目方，申请备注“天依MMD测试”。正式发布后，这里会提供 GitHub Releases 下载和 SHA-256 校验。'); return; } const a = document.createElement('a'); a.href = release.apkUrl; a.rel = 'noopener'; a.target = '_blank'; document.body.append(a); a.click(); a.remove(); });
$('#copy-sha').addEventListener('click', () => { if (release) copy(release.sha256, '复制 SHA-256 校验值'); });
$('#apk-check').addEventListener('change', async e => { const file = e.target.files?.[0]; if (!file || !release) return; const result = $('#verify-result'); if (file.size > 128 * 1024 * 1024) { result.textContent = '为避免手机内存不足，浏览器校验仅支持 128 MiB 以内文件。请在电脑使用系统 SHA-256 工具核对。'; return; } if (!crypto.subtle) { result.textContent = '当前浏览器环境不支持安全文件校验，请使用 HTTPS 或电脑系统工具。'; return; } e.target.disabled = true; result.textContent = '正在本地计算 SHA-256，请稍候…'; try { const hash = await crypto.subtle.digest('SHA-256', await file.arrayBuffer()); const hex = [...new Uint8Array(hash)].map(x => x.toString(16).padStart(2, '0')).join(''); result.textContent = hex === release.sha256 && file.size === release.sizeBytes ? '校验一致：文件大小和 SHA-256 都与公布值相符。' : '校验不一致，请勿安装这个文件；确认下载来源后重新下载。'; } catch { result.textContent = '校验未完成，请稍后重试或使用电脑系统工具。'; } finally { e.target.disabled = false; } });
