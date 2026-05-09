const API_URL = 'https://7abian.vercel.app/api/comments';

async function loadComments(pageId) {
  try {
    const res = await fetch(`${API_URL}?pageId=${pageId}`);
    const comments = await res.json();
    displayComments(comments);
  } catch (error) {
    console.error('加载评论失败:', error);
  }
}

function displayComments(comments) {
  const container = document.getElementById('comments-list');
  if (!comments.length) {
    container.innerHTML = '<p style="color: var(--muted); text-align: center;">暂无评论，快来抢沙发吧~</p>';
    return;
  }
  container.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <span class="comment-author">${c.name}</span>
        <span class="comment-time">${new Date(c.time).toLocaleString('zh-CN')}</span>
      </div>
      <div class="comment-content">${c.content}</div>
    </div>
  `).join('');
}

async function submitComment(pageId) {
  const nameInput = document.getElementById('comment-name');
  const contentInput = document.getElementById('comment-content');
  const name = nameInput.value.trim();
  const content = contentInput.value.trim();

  if (!content) {
    alert('请输入评论内容');
    return;
  }

  try {
    const res = await fetch(`${API_URL}?pageId=${pageId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content })
    });

    if (res.ok) {
      nameInput.value = '';
      contentInput.value = '';
      loadComments(pageId);
    }
  } catch (error) {
    alert('提交失败，请重试');
  }
}
