#!/usr/bin/env python3
"""从用户原视频提取真实画面；不绘制/生成软件界面。"""
import argparse,subprocess,json,hashlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source');a=p.parse_args()
source=Path(a.source).resolve();root=Path(__file__).resolve().parent.parent;assets=root/'public/assets';assets.mkdir(exist_ok=True,parents=True)
def ff(args):subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-threads','2',*args],check=True)
shots=[('import',6.5),('ensemble',9.5),('natural',12.7),('cinema',14),('dream',15.1),('ai',18),('desktop',20.5),('invite',24)]
for name,t in shots:
 ff(['-ss',str(t),'-i',str(source),'-frames:v','1','-c:v','libwebp','-quality','88',str(assets/(name+'.webp'))])
ff(['-ss','14','-i',str(source),'-frames:v','1','-c:v','libwebp','-quality','88',str(assets/'poster.webp')])
ff(['-ss','24','-i',str(source),'-frames:v','1','-vf','crop=104:108:188:218,scale=128:128','-c:v','libwebp','-quality','95',str(assets/'logo.webp')])
ff(['-i',str(source),'-map','0:v:0','-map','0:a:0?','-c:v','libx264','-preset','medium','-crf','26','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-b:a','64k','-movflags','+faststart','-map_metadata','-1',str(assets/'introduction.mp4')])
meta={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_bytes':source.stat().st_size,'source_kind':'测试版功能示意，非实机录屏','duration_seconds':27.005011,'source_dimensions':[480,852],'compressed_bytes':(assets/'introduction.mp4').stat().st_size,'video':'assets/introduction.mp4','screenshots':[{'file':'assets/'+n+'.webp','time_seconds':t,'description':'用户介绍视频原帧，未生成或伪造界面'} for n,t in shots]}
(root/'docs/media-provenance.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'original_bytes':meta['source_bytes'],'compressed_bytes':meta['compressed_bytes'],'shots':len(shots)},ensure_ascii=False))
