const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_PUBLIC_KEY';
const COMMENTS_TABLE = 'comments';
const COMMENT_STATUS_ON_SUBMIT = 'approved';

const commentsState = {
  pagePath: normalizePagePath(window.location.pathname),
  isConfigured: isSupabaseConfigured(),
};

function normalizePagePath(pathname) {
  const file = pathname.split('/').pop() || 'index.html';
  return file.replace(/\.html$/i, '') || 'index';
}

function isSupabaseConfigured() {
  return SUPABASE_URL.startsWith('https://') &&
    !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
    SUPABASE_ANON_KEY &&
    !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_PUBLIC_KEY');
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCommentTime(value) {
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch (_) {
    return '';
  }
}

function getCommentsEndpoint(query = '') {
  return `${SUPABASE_URL}/rest/v1/${COMMENTS_TABLE}${query}`;
}

function getSupabaseHeaders(extraHeaders = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extraHeaders,
  };
}

function injectCommentStyles() {
  if (document.getElementById('comment-system-styles')) return;

  const style = document.createElement('style');
  style.id = 'comment-system-styles';
  style.textContent = `
    .blog-comments {
      margin-top: 3rem;
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.25);
    }
    .blog-comments__title {
      color: var(--text);
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
    .blog-comments__hint {
      color: var(--muted);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    .blog-comments__form {
      display: grid;
      gap: 0.85rem;
      margin-bottom: 1.5rem;
    }
    .blog-comments__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }
    .blog-comments input,
    .blog-comments textarea {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 10px;
      background: rgba(255,255,255,0.08);
      color: var(--text);
      padding: 0.75rem 0.9rem;
      font: inherit;
      outline: none;
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    }
    .blog-comments textarea {
      min-height: 120px;
      resize: vertical;
    }
    .blog-comments input::placeholder,
    .blog-comments textarea::placeholder {
      color: var(--muted);
    }
    .blog-comments input:focus,
    .blog-comments textarea:focus {
      border-color: var(--accent);
      background: rgba(255,255,255,0.11);
      box-shadow: 0 0 0 3px rgba(224,123,88,0.16);
    }
    .blog-comments__submit {
      justify-self: start;
      min-height: 44px;
      border: 0;
      border-radius: 999px;
      padding: 0.7rem 1.25rem;
      background: linear-gradient(90deg, var(--accent), var(--accent-hover));
      color: #1b1020;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    .blog-comments__submit:hover {
      transform: translateY(-1px);
    }
    .blog-comments__submit:disabled {
      cursor: not-allowed;
      opacity: 0.65;
      transform: none;
    }
    .blog-comments__message {
      min-height: 1.4rem;
      color: var(--muted);
      font-size: 0.9rem;
    }
    .blog-comments__message.is-error {
      color: #fca5a5;
    }
    .blog-comments__message.is-success {
      color: #86efac;
    }
    .blog-comments__list {
      display: grid;
      gap: 1rem;
    }
    .comment-item {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      background: rgba(255,255,255,0.055);
      padding: 1rem;
    }
    .comment-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.55rem;
    }
    .comment-author {
      color: var(--text);
      font-weight: 700;
    }
    .comment-time {
      color: var(--muted);
      font-size: 0.82rem;
      white-space: nowrap;
    }
    .comment-content {
      color: rgba(240,237,232,0.78);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      line-height: 1.7;
    }
    .blog-comments__empty {
      color: var(--muted);
      text-align: center;
      padding: 1rem 0;
    }
    @media (max-width: 640px) {
      .blog-comments { padding: 1.25rem; }
      .blog-comments__row { grid-template-columns: 1fr; }
      .comment-header { flex-direction: column; gap: 0.25rem; }
    }
  `;
  document.head.appendChild(style);
}

function setCommentMessage(message, type = '') {
  const messageEl = document.querySelector('[data-comment-message]');
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.classList.toggle('is-error', type === 'error');
  messageEl.classList.toggle('is-success', type === 'success');
}

function renderCommentSystem(container) {
  container.classList.add('blog-comments');
  container.innerHTML = `
    <h3 class="blog-comments__title">评论</h3>
    <p class="blog-comments__hint">无需登录，填写昵称即可留言。邮箱不会公开，可不填。</p>
    <form class="blog-comments__form" data-comment-form>
      <div class="blog-comments__row">
        <label>
          <span class="sr-only">昵称</span>
          <input type="text" name="nickname" maxlength="40" placeholder="昵称" autocomplete="name" required>
        </label>
        <label>
          <span class="sr-only">邮箱，可选</span>
          <input type="email" name="email" maxlength="120" placeholder="邮箱（可选，不公开）" autocomplete="email">
        </label>
      </div>
      <label>
        <span class="sr-only">评论内容</span>
        <textarea name="content" maxlength="1000" placeholder="说点什么吧..." required></textarea>
      </label>
      <button class="blog-comments__submit" type="submit">发表评论</button>
      <div class="blog-comments__message" data-comment-message role="status" aria-live="polite"></div>
    </form>
    <div class="blog-comments__list" data-comments-list></div>
  `;
}

async function loadComments(pageId = commentsState.pagePath) {
  const list = document.querySelector('[data-comments-list]');
  if (!list) return;

  if (!commentsState.isConfigured) {
    list.innerHTML = '<p class="blog-comments__empty">评论系统还没有配置 Supabase。请先填写 comments.js 里的项目地址和 anon key。</p>';
    return;
  }

  list.innerHTML = '<p class="blog-comments__empty">正在加载评论...</p>';

  const query = `?select=id,nickname,content,created_at&page_path=eq.${encodeURIComponent(pageId)}&status=eq.approved&order=created_at.desc`;

  try {
    const response = await fetch(getCommentsEndpoint(query), {
      headers: getSupabaseHeaders(),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const comments = await response.json();
    displayComments(comments);
  } catch (error) {
    console.error('加载评论失败:', error);
    list.innerHTML = '<p class="blog-comments__empty">评论加载失败，请稍后再试。</p>';
  }
}

function displayComments(comments) {
  const list = document.querySelector('[data-comments-list]');
  if (!list) return;

  if (!Array.isArray(comments) || comments.length === 0) {
    list.innerHTML = '<p class="blog-comments__empty">暂无评论，快来抢沙发吧。</p>';
    return;
  }

  list.innerHTML = comments.map((comment) => `
    <article class="comment-item">
      <div class="comment-header">
        <span class="comment-author">${escapeHTML(comment.nickname || '匿名访客')}</span>
        <time class="comment-time" datetime="${escapeHTML(comment.created_at)}">${formatCommentTime(comment.created_at)}</time>
      </div>
      <div class="comment-content">${escapeHTML(comment.content)}</div>
    </article>
  `).join('');
}

async function submitComment(pageId = commentsState.pagePath, form) {
  const commentForm = form || document.querySelector('[data-comment-form]');
  if (!commentForm) return;

  if (!commentsState.isConfigured) {
    setCommentMessage('请先配置 Supabase 项目地址和 anon key。', 'error');
    return;
  }

  const submitButton = commentForm.querySelector('button[type="submit"]');
  const formData = new FormData(commentForm);
  const nickname = String(formData.get('nickname') || '').trim() || '匿名访客';
  const email = String(formData.get('email') || '').trim();
  const content = String(formData.get('content') || '').trim();

  if (!content) {
    setCommentMessage('请输入评论内容。', 'error');
    return;
  }

  if (content.length > 1000) {
    setCommentMessage('评论内容不能超过 1000 个字符。', 'error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = '提交中...';
  setCommentMessage('');

  try {
    const response = await fetch(getCommentsEndpoint(), {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      }),
      body: JSON.stringify({
        page_path: pageId,
        nickname,
        email: email || null,
        content,
        user_agent: navigator.userAgent,
        status: COMMENT_STATUS_ON_SUBMIT,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    commentForm.reset();
    setCommentMessage(COMMENT_STATUS_ON_SUBMIT === 'pending' ? '评论已提交，等待审核后显示。' : '评论发布成功。', 'success');
    await loadComments(pageId);
  } catch (error) {
    console.error('提交评论失败:', error);
    setCommentMessage('提交失败，请检查 Supabase 配置或稍后再试。', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = '发表评论';
  }
}

function initComments() {
  injectCommentStyles();

  const container = document.querySelector('[data-blog-comments]') || document.getElementById('comment-section');
  if (!container) return;

  renderCommentSystem(container);
  const pageId = container.dataset.pagePath || commentsState.pagePath;
  commentsState.pagePath = pageId;

  const form = container.querySelector('[data-comment-form]');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitComment(pageId, form);
  });

  loadComments(pageId);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initComments);
} else {
  initComments();
}
