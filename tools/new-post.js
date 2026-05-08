#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const title = process.argv[2];
const tag = process.argv[3] || '技术';

if (!title) {
  console.log('用法: node new-post.js "文章标题" "标签"');
  process.exit(1);
}

const files = fs.readdirSync('.').filter(f => f.match(/^post-\d+\.html$/));
const nextNum = files.length + 1;
const filename = `post-${nextNum}.html`;
const date = new Date().toISOString().split('T')[0];

const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} · MRNOKK's Blog</title>
<style>
  :root {
    --accent: #e07b58;
    --accent-hover: #f5a623;
    --glass-bg: rgba(255,255,255,0.07);
    --glass-bg-hover: rgba(255,255,255,0.11);
    --glass-border: rgba(255,255,255,0.13);
    --glass-blur: blur(16px);
    --text: #f0ede8;
    --muted: rgba(240,237,232,0.55);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
    color: var(--text); line-height: 1.7; min-height: 100vh; overflow-x: hidden;
  }
  .bg-wrap { position: fixed; inset: 0; z-index: -1; background: linear-gradient(135deg,#0f0c29 0%,#1e1b4b 40%,#2d1b69 70%,#1a0533 100%); }
  .bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.3; }
  .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle,#e07b58,transparent); top: -150px; left: -120px; animation: drift 12s ease-in-out infinite; }
  .orb-2 { width: 400px; height: 400px; background: radial-gradient(circle,#6c63ff,transparent); bottom: -100px; right: -100px; animation: drift 10s ease-in-out infinite reverse; }
  .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle,#11998e,transparent); top: 45%; left: 55%; animation: drift 14s ease-in-out infinite; animation-delay: -5s; }
  @keyframes drift { 0%,100% { transform:translate(0,0); } 33% { transform:translate(25px,-20px); } 66% { transform:translate(-18px,18px); } }
  @media (prefers-reduced-motion:reduce) { .bg-orb { animation:none; } }

  header { position: sticky; top: 0; z-index: 100; background: rgba(15,12,41,0.55); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); padding: 1rem 2rem; }
  .nav-container { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
  .logo { font-size: 1.2rem; font-weight: 700; background: linear-gradient(90deg,var(--accent),var(--accent-hover)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-decoration: none; }
  .back-btn { color: var(--muted); text-decoration: none; font-size: 0.9rem; display: flex; align-items: center; gap: 0.4rem; transition: color 0.2s; }
  .back-btn:hover { color: var(--text); }

  .post-wrap { max-width: 820px; margin: 0 auto; padding: 3rem 2rem 2rem; }
  .post-hero { text-align: center; margin-bottom: 2rem; }
  .post-tag { background: rgba(224,123,88,0.16); color: var(--accent); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; font-weight: 500; border: 1px solid rgba(224,123,88,0.28); display: inline-block; margin-bottom: 1rem; }
  .post-hero h1 { font-size: 2.4rem; font-weight: 800; letter-spacing: -1px; line-height: 1.25; margin-bottom: 1rem; background: linear-gradient(135deg,#ffffff 0%,rgba(240,237,232,0.7) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .post-info { display: flex; justify-content: center; gap: 1.5rem; color: var(--muted); font-size: 0.85rem; }

  .post-content { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 16px; padding: 2.5rem 3rem; box-shadow: 0 4px 24px rgba(0,0,0,0.25); }
  .post-content h2 { font-size: 1.45rem; font-weight: 700; margin: 2.2rem 0 1rem; color: var(--text); padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .post-content h2:first-child { margin-top: 0; }
  .post-content p { color: rgba(240,237,232,0.78); line-height: 1.85; margin-bottom: 1.2rem; font-size: 1rem; }
  .post-content strong { color: var(--text); font-weight: 600; }

  .post-nav { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 2rem; }
  .post-nav a { background: var(--glass-bg); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 12px; padding: 1rem 1.4rem; text-decoration: none; cursor: pointer; transition: background 0.2s,border-color 0.2s; display: flex; flex-direction: column; }
  .post-nav a:hover { background: var(--glass-bg-hover); border-color: rgba(255,255,255,0.2); }
  .post-nav .nav-label { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.35rem; }
  .post-nav .nav-title { font-size: 0.9rem; font-weight: 500; color: var(--text); }
  .post-nav .next-link { text-align: right; }

  .progress-bar { position: fixed; top: 0; left: 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--accent-hover)); width: 0%; z-index: 200; transition: width 0.1s linear; }
  .pre-wrap { position: relative; }
  .copy-btn { position: absolute; top: 0.6rem; right: 0.6rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); color: var(--muted); font-size: 0.75rem; padding: 0.25rem 0.6rem; border-radius: 6px; cursor: pointer; transition: background 0.2s, color 0.2s; font-family: inherit; }
  .copy-btn:hover { background: rgba(255,255,255,0.18); color: var(--text); }
  .copy-btn.copied { color: #6ee7b7; border-color: #6ee7b7; }

  footer { text-align: center; padding: 2rem; color: var(--muted); font-size: 0.88rem; border-top: 1px solid rgba(255,255,255,0.07); margin-top: 1rem; }

  @media (max-width: 768px) {
    .post-hero h1 { font-size: 1.8rem; }
    .post-content { padding: 1.5rem; }
    .post-wrap { padding: 2rem 1.2rem; }
    .post-nav { grid-template-columns: 1fr; }
    .orb-3 { display: none; }
  }
</style>
</head>
<body>

<div class="progress-bar" id="progress" aria-hidden="true"></div>

<div class="bg-wrap" aria-hidden="true">
  <div class="bg-orb orb-1"></div>
  <div class="bg-orb orb-2"></div>
  <div class="bg-orb orb-3"></div>
</div>

<header>
  <div class="nav-container">
    <a href="index.html" class="back-btn">← 返回首页</a>
    <a href="index.html" class="logo">MRNOKK's Blog</a>
  </div>
</header>

<div class="post-wrap">
  <div class="post-hero">
    <div class="post-tag">${tag}</div>
    <h1>${title}</h1>
    <div class="post-info">
      <span>${date}</span>
      <span>阅读约 5 分钟</span>
    </div>
  </div>

  <div class="post-content">
    <p>在这里编写文章内容...</p>

    <h2>章节标题</h2>
    <p>段落内容。</p>
  </div>

  <nav class="post-nav" aria-label="文章导航">
    <a href="post-${nextNum - 1}.html">
      <span class="nav-label">← 上一篇</span>
      <span class="nav-title">上一篇文章</span>
    </a>
    <div></div>
  </nav>
</div>

<footer>
  <p>© 2026 MRNOKK's Blog · 用 ❤ 与 HTML 编织</p>
</footer>

<script>
  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    document.getElementById('progress').style.width = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight) * 100) + '%';
  }, { passive: true });

  document.querySelectorAll('pre').forEach(pre => {
    const wrap = document.createElement('div');
    wrap.className = 'pre-wrap';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '复制';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(pre.querySelector('code')?.innerText || pre.innerText).then(() => {
        btn.textContent = '已复制'; btn.classList.add('copied');
        setTimeout(() => { btn.textContent = '复制'; btn.classList.remove('copied'); }, 2000);
      });
    });
    wrap.appendChild(btn);
  });
</script>
</body>
</html>`;

fs.writeFileSync(filename, template);
console.log(`✅ 创建成功: ${filename}`);
console.log(`📝 请编辑文件内容，然后更新 index.html 添加文章链接`);
