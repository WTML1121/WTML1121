#!/usr/bin/env python3
"""只将公开静态文件复制到 dist；拒绝符号链接/私钥/服务器配置混入。"""
from pathlib import Path
import shutil,json,re,hashlib
ROOT=Path(__file__).resolve().parent.parent
source=ROOT/'public';dist=ROOT/'dist'
allowed={'.html','.css','.js','.json','.webp','.png','.jpg','.svg','.ico','.mp4','.vtt','.txt','.xml',''}
for p in source.rglob('*'):
 if p.is_symlink():raise SystemExit('公开目录不得包含符号链接：'+str(p.relative_to(ROOT)))
 if p.is_file():
  if p.suffix.lower() not in allowed or p.stat().st_size>50*1024*1024:raise SystemExit('不允许的公开文件：'+str(p.relative_to(ROOT)))
  if any(s in p.name.lower() for s in ('credential','identity','private','server_public_keys','openapi','handoff')):raise SystemExit('服务器资料不得发布至官网：'+p.name)
  if p.suffix in ('.html','.js','.json','.css','.txt','.xml','.vtt'):
   text=p.read_text()
   if re.search(r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|AGE-SECRET-KEY-|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}',text):raise SystemExit('疑似凭据，禁止发布：'+p.name)
# 未发布时不存在伪下载目标。
r=json.loads((source/'data/release.json').read_text())
from release_metadata import validate_release
validate_release(r)
if dist.exists():shutil.rmtree(dist)
shutil.copytree(source,dist)
files=[p for p in dist.rglob('*') if p.is_file()]
print(json.dumps({'files':len(files),'total_bytes':sum(p.stat().st_size for p in files),'directory':'dist'},ensure_ascii=False))
