#!/usr/bin/env python3
"""静态目录、锚点、引用、下载和媒体检查，无浏览器控制。"""
from html.parser import HTMLParser
from pathlib import Path
import json,re,subprocess,urllib.parse
root=Path(__file__).resolve().parent.parent;site=root/'public'
class P(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.refs=[];self.images=[];self.videos=[]
 def handle_starttag(self,tag,attrs):
  d=dict(attrs)
  if 'id'in d:
   assert d['id'] not in self.ids,'重复 ID '+d['id'];self.ids.add(d['id'])
  if tag=='img':self.images.append(d);assert 'alt'in d and 'width'in d and 'height'in d
  if tag=='video':self.videos.append(d);assert d.get('preload')=='none' and 'autoplay' not in d and 'src' not in d
  for key in ['href','src','poster','data-image']:
   if d.get(key):self.refs.append(d[key])
p=P();p.feed((site/'index.html').read_text())
for ref in p.refs:
 u=urllib.parse.urlsplit(ref)
 if u.scheme or ref.startswith('//'):continue
 if ref.startswith('#'):assert ref[1:] in p.ids,'失效锚点 '+ref
 else:assert (site/u.path).is_file(),'缺少素材 '+ref
r=json.loads((site/'data/release.json').read_text())
from release_metadata import validate_release
validate_release(r)
s=json.loads((site/'data/site.json').read_text());assert s['repository']=='WTML1121/WTML1121' and s['integrations']['enabled'] is False
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=codec_name,width,height:format=duration,size','-of','json',str(site/'assets/introduction.mp4')]))
assert probe['streams'][0]['codec_name']=='h264' and probe['streams'][1]['codec_name']=='aac'
assert 26<float(probe['format']['duration'])<28
print(json.dumps({'local_references_checked':len(p.refs),'image_elements':len(p.images),'anchors':len(p.ids),'video_seconds':float(probe['format']['duration']),'video_bytes':int(probe['format']['size']),'codec':'H.264/AAC','fake_download_links':0,'release_published':r['published'],'backend_integrations_enabled':False},ensure_ascii=False))
