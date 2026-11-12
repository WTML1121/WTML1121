from urllib.parse import urlsplit
from datetime import datetime
import re
REPOSITORY='WTML1121/WTML1121'
def validate_release(r):
    if not isinstance(r,dict) or type(r.get('published')) is not bool:raise ValueError('缺少真实发布状态')
    if r['published'] is False:
        if any(r.get(k) is not None for k in ['version','sizeBytes','publishedAt','apkUrl','releaseUrl','sha256']) or r.get('notes')!=[]:raise ValueError('未发布元数据必须为空，禁止假版本')
        return
    if not isinstance(r.get('version'),str) or not r['version'].strip():raise ValueError('缺少版本号')
    if type(r.get('sizeBytes')) is not int or r['sizeBytes']<=0:raise ValueError('缺少真实 APK 大小')
    if not re.fullmatch('[a-f0-9]{64}',r.get('sha256') or ''):raise ValueError('SHA256 无效')
    datetime.fromisoformat(r['publishedAt'].replace('Z','+00:00'))
    for key,path in [('apkUrl','/releases/download/'),('releaseUrl','/releases/tag/')]:
        u=urlsplit(r.get(key) or '')
        if u.scheme!='https' or u.hostname!='github.com' or u.username or u.password or not u.path.startswith('/'+REPOSITORY+path):raise ValueError('必须是本项目真实 GitHub Release 地址')
    if not urlsplit(r['apkUrl']).path.lower().endswith('.apk'):raise ValueError('附件不是 APK')
    if not isinstance(r.get('notes'),list) or not r['notes'] or not all(isinstance(n,str) and n.strip() for n in r['notes']):raise ValueError('缺少更新说明')
