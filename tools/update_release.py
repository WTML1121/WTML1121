#!/usr/bin/env python3
"""从本仓库真实 GitHub Release + 本地 APK 生成公开元数据；不上传 APK。"""
import argparse,json,subprocess,hashlib,urllib.parse
from pathlib import Path
p=argparse.ArgumentParser(description='核对实际 Release APK 后更新官网版本元数据');p.add_argument('--tag',required=True);p.add_argument('--apk',required=True);p.add_argument('--notes',required=True,help='真实更新说明 UTF-8 文本文件，每行一条');p.add_argument('--min-android');a=p.parse_args()
apk=Path(a.apk).resolve()
if apk.suffix.lower()!='.apk' or not apk.is_file():raise SystemExit('需要真实 APK 文件')
notes=[line.strip().lstrip('- ').strip() for line in Path(a.notes).read_text().splitlines() if line.strip()]
if not notes:raise SystemExit('必须提供真实更新内容')
repo='WTML1121/WTML1121';endpoint='repos/'+repo+'/releases/tags/'+urllib.parse.quote(a.tag,safe='')
r=subprocess.run(['gh','api',endpoint],capture_output=True,text=True)
if r.returncode:raise SystemExit('未能读取该 Release，请先完成 gh 登录并确认版本已发布')
d=json.loads(r.stdout)
if d['draft'] or not d.get('published_at'):raise SystemExit('草稿 Release 不得当成正式下载')
size=apk.stat().st_size;h=hashlib.sha256()
with apk.open('rb') as f:
 while b:=f.read(1024*1024):h.update(b)
sha=h.hexdigest();asset=next((x for x in d['assets'] if x['name']==apk.name),None)
if not asset or asset['size']!=size:raise SystemExit('Release 附件不存在或大小不一致，请先上传此 APK')
# 只接受平台公布的摘要，避免拿同名不同文件生成错误校验。
if asset.get('digest')!='sha256:'+sha:raise SystemExit('GitHub 附件 SHA256 缺失或与本地不一致，拒绝生成下载链接')
obj={'published':True,'version':d['tag_name'],'sizeBytes':size,'publishedAt':d['published_at'],'apkUrl':asset['browser_download_url'],'releaseUrl':d['html_url'],'sha256':sha,'notes':notes,'minAndroid':a.min_android}
root=Path(__file__).resolve().parent.parent;(root/'public/data/release.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');print('已由真实 Release 和本地 APK 校验生成官网元数据；请检查后提交。')
