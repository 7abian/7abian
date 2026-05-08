# 博客部署指南

## 1. 部署到 GitHub Pages

### 步骤 1：创建 GitHub 仓库

```bash
# 初始化 Git 仓库
git init
git add .
git commit -m "Initial commit"

# 创建 GitHub 仓库后推送
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### 步骤 2：启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 `GitHub Actions`
3. 等待自动部署完成
4. 访问 `https://YOUR_USERNAME.github.io/YOUR_REPO`

## 2. 集成 Giscus 评论系统

### 配置步骤

1. 访问 https://giscus.app/zh-CN
2. 在仓库启用 Discussions（Settings → Features → Discussions）
3. 安装 Giscus app：https://github.com/apps/giscus
4. 在 giscus.app 填写仓库信息，获取配置代码
5. 将生成的代码添加到每个 post 页面的 `</nav>` 和 `</div>` 之间

示例代码位置（post-1.html 等）：

```html
  </nav>

  <!-- 评论区 -->
  <div style="margin-top: 3rem;">
    <script src="https://giscus.app/client.js"
            data-repo="YOUR_USERNAME/YOUR_REPO"
            data-repo-id="YOUR_REPO_ID"
            data-category="Announcements"
            data-category-id="YOUR_CATEGORY_ID"
            data-mapping="pathname"
            data-strict="0"
            data-reactions-enabled="1"
            data-emit-metadata="0"
            data-input-position="top"
            data-theme="dark"
            data-lang="zh-CN"
            crossorigin="anonymous"
            async>
    </script>
  </div>
</div>
```

## 3. 集成 Google Analytics

### 配置步骤

1. 访问 https://analytics.google.com/
2. 创建账号和媒体资源
3. 获取衡量 ID（格式：G-XXXXXXXXXX）
4. 在所有 HTML 文件的 `<head>` 中添加：

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 4. 更新联系信息

修改 index.html 中的联系链接：

```html
<a href="mailto:your-email@example.com">📧 联系我</a>
<a href="https://github.com/YOUR_USERNAME" target="_blank">GitHub</a>
```

## 完成！

部署完成后，你的博客将具备：
- ✅ 自动部署（推送代码即更新）
- ✅ 评论系统（基于 GitHub Discussions）
- ✅ 访问统计（Google Analytics）
- ✅ 搜索和标签过滤
- ✅ 阅读进度条和代码复制
