'use strict';
const fs = require('node:fs'); const vm = require('node:vm'); const assert = require('node:assert/strict');
const path = require('node:path'); const source = fs.readFileSync(path.join(__dirname, '../public/app.js'), 'utf8');
const code = source.slice(source.indexOf('function safeRelease('), source.indexOf('function displaySize('));
const context = vm.createContext({ URL, Number, Date, Array }); vm.runInContext(code, context);
const valid = {published:true,version:'unit-test-only',sizeBytes:1024,sha256:'a'.repeat(64),publishedAt:'2026-11-13T00:00:00Z',apkUrl:'https://github.com/WTML1121/WTML1121/releases/download/unit-test-only/test.apk',releaseUrl:'https://github.com/WTML1121/WTML1121/releases/tag/unit-test-only',notes:['仅单元测试对象，从不写入官网元数据']};
assert.equal(context.safeRelease(valid),true);let n=1;
for(const changes of [{published:false},{published:'true'},{sizeBytes:0},{sha256:'bad'},{notes:[]},{apkUrl:'javascript:alert(1)'},{apkUrl:'https://example.com/test.apk'},{apkUrl:'https://github.com/other/repo/releases/download/v1/test.apk'},{apkUrl:'https://secret@github.com/WTML1121/WTML1121/releases/download/v1/test.apk'},{releaseUrl:'https://example.com/release'},{publishedAt:'invalid'}]){assert.equal(context.safeRelease({...valid,...changes}),false);n++;}
console.log(`${n} 项版本发布门控检查通过；没有发布或下载测试 APK。`);
