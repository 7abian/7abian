const fs = require('fs');

console.log('🔄 重新应用所有管理员功能...\n');

// 1. 更新所有文章页面
const postFiles = fs.readdirSync('.').filter(f => f.startsWith('post-') && f.endsWith('.html'));

console.log(`📝 找到 ${postFiles.length} 个文章文件`);

postFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // 添加管理员操作区域 CSS
  if (!content.includes('admin-actions')) {
    const adminActionsCSS = `
  /* 管理员操作区域 */
  .admin-actions {
    display: none;
    background: linear-gradient(135deg, rgba(224,123,88,0.15), rgba(245,166,35,0.15));
    border: 2px solid var(--accent);
    border-radius: 12px;
    padding: 1.5rem;
    margin: 2rem 0;
    gap: 1rem;
    align-items: center;
    justify-content: center;
  }
  .admin-actions.visible {
    display: flex;
  }
  .admin-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .admin-btn:hover {
    background: var(--accent-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(224,123,88,0.4);
  }
  .admin-btn.delete {
    background: #ef4444;
  }
  .admin-btn.delete:hover {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239,68,68,0.4);
  }
  @media (max-width: 768px) {
    .admin-actions {
      flex-direction: column;
    }
    .admin-btn {
      width: 100%;
      justify-content: center;
    }
  }`;
    
    content = content.replace(/(footer\{[^}]+\})/, `$1${adminActionsCSS}`);
    modified = true;
  }
  
  // 添加管理员操作区域 HTML
  if (!content.includes('id="adminActions"')) {
    const adminActionsHTML = `
  <!-- 管理员操作区域 -->
  <div class="admin-actions" id="adminActions">
    <span style="color: var(--accent); font-weight: 600; font-size: 1.1rem;">🔐 管理员操作</span>
    <a href="admin.html?edit=${file}" class="admin-btn">
      ✏️ 编辑文章
    </a>
    <button onclick="deletePost('${file}')" class="admin-btn delete">
      🗑️ 删除文章
    </button>
  </div>`;
    
    content = content.replace(/(<\/div>\s*<div style="margin-top:3rem">)/, `</div>${adminActionsHTML}\n  <div style="margin-top:3rem">`);
    modified = true;
  }
  
  // 更新 JavaScript
  if (content.includes("document.querySelectorAll('.admin-only')") && !content.includes('adminActions.classList.add')) {
    content = content.replace(
      /(document\.querySelectorAll\('\.admin-only'\)\.forEach\(el=>\{[\s\S]*?\}\);)/,
      `document.querySelectorAll('.admin-only').forEach(el=>{
            el.style.display='flex';
            console.log('按钮已显示:', el);
          });
          const adminActions = document.getElementById('adminActions');
          if(adminActions){
            adminActions.classList.add('visible');
            console.log('✅ 文章管理操作区域已显示');
          }`
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`  ✅ ${file}`);
  }
});

// 2. 更新 index.html
console.log('\n📄 更新 index.html...');
let indexContent = fs.readFileSync('index.html', 'utf8');

// 添加 CSS
if (!indexContent.includes('article-admin-btns')) {
  const adminButtonsCSS = `
  /* 文章卡片管理员按钮 */
  .article-admin-btns {
    display: none;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .article-admin-btns.visible {
    display: flex;
  }
  .article-admin-btn {
    background: var(--accent);
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .article-admin-btn:hover {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }
  .article-admin-btn.delete {
    background: #ef4444;
  }
  .article-admin-btn.delete:hover {
    background: #dc2626;
  }
  article {
    position: relative;
  }`;
  
  indexContent = indexContent.replace(/(@media \(max-width: 768px\))/, `${adminButtonsCSS}\n\n  $1`);
  console.log('  ✅ 已添加 CSS');
}

// 为文章卡片添加按钮
const articlePattern = /<article onclick="location\.href='([^']+)'">[\s\S]*?<a href="\1" class="read-more">阅读更多 →<\/a>\s*<\/article>/g;
let articleCount = 0;

indexContent = indexContent.replace(articlePattern, (match, fileName) => {
  if (match.includes('article-admin-btns')) return match;
  
  articleCount++;
  const adminButtons = `
      <div class="article-admin-btns">
        <a href="admin.html?edit=${fileName}" class="article-admin-btn" onclick="event.stopPropagation()">
          ✏️ 编辑
        </a>
        <button class="article-admin-btn delete" onclick="event.stopPropagation(); deletePostFromIndex('${fileName}')">
          🗑️ 删除
        </button>
      </div>
    </article>`;
  
  return match.replace('</article>', adminButtons);
});

console.log(`  ✅ 已为 ${articleCount} 个文章卡片添加按钮`);

// 添加 JavaScript
if (!indexContent.includes('deletePostFromIndex')) {
  const adminScript = `
  // 管理员身份验证
  (async()=>{
    try{
      const token = localStorage.getItem('github_token');
      if(!token) return;
      const resp = await fetch('https://api.github.com/user', {
        headers: {'Authorization': 'token ' + token}
      });
      if(resp.ok){
        const user = await resp.json();
        if(user.login === '7abian'){
          document.querySelectorAll('.article-admin-btns').forEach(el => {
            el.classList.add('visible');
          });
          console.log('✅ 首页管理员按钮已显示');
        }
      }
    }catch(e){
      console.error('身份验证失败:', e);
    }
  })();

  async function deletePostFromIndex(fileName){
    if(!confirm('确定要删除这篇文章吗？此操作不可恢复！')) return;
    try{
      const token = localStorage.getItem('github_token');
      if(!token) throw new Error('未找到 GitHub Token');
      const fileUrl = 'https://api.github.com/repos/7abian/7abian.github.io/contents/' + fileName;
      const resp = await fetch(fileUrl, {
        headers: {'Authorization': 'token ' + token}
      });
      if(!resp.ok) throw new Error('获取文件信息失败');
      const data = await resp.json();
      await fetch(fileUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': 'token ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Delete post: ' + fileName,
          sha: data.sha,
          branch: 'main'
        })
      });
      const indexUrl = 'https://api.github.com/repos/7abian/7abian.github.io/contents/index.html';
      const indexResp = await fetch(indexUrl, {
        headers: {'Authorization': 'token ' + token}
      });
      if(indexResp.ok){
        const indexData = await indexResp.json();
        let indexHTML = decodeURIComponent(escape(atob(indexData.content)));
        const regex = new RegExp('<article onclick="location\\\\.href=\\''+fileName+'\\'[^>]*>[\\\\s\\\\S]*?</article>\\\\s*', 'g');
        indexHTML = indexHTML.replace(regex, '');
        await fetch(indexUrl, {
          method: 'PUT',
          headers: {
            'Authorization': 'token ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Remove deleted post from index',
            content: btoa(unescape(encodeURIComponent(indexHTML))),
            sha: indexData.sha,
            branch: 'main'
          })
        });
      }
      alert('文章已删除，页面即将刷新');
      window.location.reload();
    }catch(e){
      alert('删除失败: ' + e.message);
    }
  }`;
  
  indexContent = indexContent.replace('</script>', adminScript + '\n</script>');
  console.log('  ✅ 已添加 JavaScript');
}

fs.writeFileSync('index.html', indexContent, 'utf8');

console.log('\n✨ 所有更改已重新应用！');
console.log('\n📋 下一步：');
console.log('  1. git add .');
console.log('  2. git commit -m "Add admin buttons to all pages"');
console.log('  3. git push origin main');
