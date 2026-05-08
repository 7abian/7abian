# 文章发布流程

## 本地创建文章

### 使用脚本（推荐）
```bash
node tools/new-post.js "我的新文章" "技术"
```

### 手动创建
1. 复制 `post-1.html` 为 `post-5.html`
2. 修改文件内容（标题、日期、标签、正文）
3. 更新 `index.html` 添加文章卡片

## 发布到 GitHub Pages

```bash
# 1. 配置 Git（首次）
git config user.name "MRNOKK"
git config user.email "your-email@example.com"

# 2. 提交更改
git add .
git commit -m "Add new post: 文章标题"

# 3. 推送到 GitHub
git push origin main
```

推送后，GitHub Actions 会自动部署，约 1-2 分钟后生效。

## 更新现有文章

1. 直接编辑对应的 `post-N.html` 文件
2. 保存后执行上述发布流程

## 快速发布命令

```bash
git add . && git commit -m "Update blog" && git push
```
