export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { pageId } = req.query;

  if (req.method === 'GET') {
    try {
      const response = await fetch(`https://raw.githubusercontent.com/7abian/7abian.github.io/main/comments/${pageId}.json`);
      const comments = response.ok ? await response.json() : [];
      return res.status(200).json(comments);
    } catch (error) {
      return res.status(200).json([]);
    }
  }

  if (req.method === 'POST') {
    const { name, content } = req.body;
    const comment = {
      id: Date.now(),
      name: name || '匿名',
      content,
      time: new Date().toISOString()
    };

    const token = process.env.GITHUB_TOKEN;
    const repo = '7abian/7abian.github.io';
    const path = `comments/${pageId}.json`;

    try {
      const fileUrl = `https://api.github.com/repos/${repo}/contents/${path}`;
      const getRes = await fetch(fileUrl, {
        headers: { 'Authorization': `token ${token}` }
      });

      let comments = [];
      let sha = null;

      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
        comments = JSON.parse(Buffer.from(data.content, 'base64').toString());
      }

      comments.push(comment);

      await fetch(fileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add comment to ${pageId}`,
          content: Buffer.from(JSON.stringify(comments, null, 2)).toString('base64'),
          sha,
          branch: 'main'
        })
      });

      return res.status(200).json(comment);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
