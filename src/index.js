import HTML_CONTENT from '../index.html';
import FAVICON from '../favicon.ico';

export default {
  async fetch(request, env) {
    // 自动初始化数据库
    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, created_at TEXT DEFAULT (datetime('now')))`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, user_id INTEGER, created_at TEXT DEFAULT (datetime('now')))`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, category TEXT DEFAULT '工作', sort_order INTEGER DEFAULT 0, user_id INTEGER, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')))`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER, created_at TEXT DEFAULT (datetime('now')))`).run();
      
      // 插入默认用户
      const userCheck = await env.DB.prepare("SELECT * FROM users LIMIT 1").first();
      if (!userCheck) {
        await env.DB.prepare("INSERT OR IGNORE INTO users (username, password) VALUES ('yybtech', 'violet2008')").run();
        await env.DB.prepare("INSERT OR IGNORE INTO users (username, password) VALUES ('admin', 'admin123')").run();
      }

      // 检查是否需要插入默认分类
      const catCheck = await env.DB.prepare("SELECT * FROM categories LIMIT 1").first();
      if (!catCheck) {
        // 为每个用户插入默认分类
        const { results: users } = await env.DB.prepare("SELECT id FROM users").all();
        for (const user of users) {
          await env.DB.prepare("INSERT OR IGNORE INTO categories (name, user_id) VALUES ('工作', ?), ('生活', ?), ('灵感', ?)").bind(user.id, user.id, user.id).run();
        }
      }
    } catch (e) {
      console.log("DB Init Error: ", e);
    }

    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Serve frontend
      if (pathname === '/' || pathname === '/index.html') {
        return new Response(HTML_CONTENT, {
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        });
      }

      // Serve favicon
      if (pathname === '/favicon.ico') {
        return new Response(FAVICON, {
          headers: { 'Content-Type': 'image/x-icon', 'Cache-Control': 'public, max-age=86400' },
        });
      }

      // Login - no auth required
      if (pathname === '/api/login' && method === 'POST') {
        return await login(request, env.DB, corsHeaders);
      }

      // All other API routes
      if (pathname.startsWith('/api/')) {
        const session = await authenticate(request, env.DB);
        
        // 登录接口和不需要认证的接口
        if (pathname === '/api/logout' && method === 'POST') {
          return await logout(request, env.DB, corsHeaders);
        }

        if (pathname === '/api/me' && method === 'GET') {
          if (session) {
            return jsonResponse({ id: session.user_id, username: session.username }, 200, corsHeaders);
          } else {
            return jsonResponse({ error: '未登录' }, 401, corsHeaders);
          }
        }

        // 分类接口
        if (pathname === '/api/categories') {
          if (method === 'GET') {
            return await getCategories(env.DB, session, corsHeaders);
          }
          if (method === 'POST') {
            return await createCategory(request, env.DB, session, corsHeaders);
          }
        }
        
        if (pathname.startsWith('/api/categories/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          return await deleteCategory(id, env.DB, session, corsHeaders);
        }

        // 笔记接口
        if (pathname === '/api/notes') {
          if (method === 'GET') {
            return await getNotes(env.DB, session, corsHeaders);
          }
          if (method === 'POST') {
            return await saveNote(request, env.DB, session, corsHeaders);
          }
        }

        if (pathname.startsWith('/api/notes/') && method === 'DELETE') {
          const id = pathname.split('/').pop();
          return await deleteNote(id, env.DB, session, corsHeaders);
        }

        if (pathname === '/api/order' && method === 'POST') {
          return await saveOrder(request, env.DB, session, corsHeaders);
        }
      }

      return jsonResponse({ error: 'Not Found' }, 404, corsHeaders);
    } catch (err) {
      return jsonResponse({ error: err.message }, 500, corsHeaders);
    }
  },
};

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

function parseCookies(request) {
  const cookie = request.headers.get('Cookie') || '';
  const pairs = {};
  cookie.split(';').forEach(pair => {
    const [key, ...rest] = pair.trim().split('=');
    if (key) pairs[key] = rest.join('=');
  });
  return pairs;
}

async function authenticate(request, db) {
  const cookies = parseCookies(request);
  const token = cookies['session_token'];
  if (!token) return null;
  const row = await db
    .prepare('SELECT sessions.user_id, users.username FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.token = ?')
    .bind(token)
    .first();
  return row || null;
}

async function login(request, db, corsHeaders) {
  const { username, password } = await request.json();
  if (!username || !password) {
    return jsonResponse({ error: '请输入用户名和密码' }, 400, corsHeaders);
  }
  const user = await db
    .prepare('SELECT id, username FROM users WHERE username = ? AND password = ?')
    .bind(username, password)
    .first();
  if (!user) {
    return jsonResponse({ error: '用户名或密码错误' }, 401, corsHeaders);
  }
  
  // 为新登录的用户创建默认分类（如果没有的话）
  const userCats = await db.prepare("SELECT * FROM categories WHERE user_id = ? LIMIT 1").bind(user.id).first();
  if (!userCats) {
    await db.prepare("INSERT OR IGNORE INTO categories (name, user_id) VALUES ('工作', ?), ('生活', ?), ('灵感', ?)").bind(user.id, user.id, user.id).run();
  }
  
  const token = generateToken();
  await db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').bind(token, user.id).run();
  return new Response(JSON.stringify({ id: user.id, username: user.username }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `session_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`,
      ...corsHeaders,
    },
  });
}

async function logout(request, db, corsHeaders) {
  const cookies = parseCookies(request);
  const token = cookies['session_token'];
  if (token) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
      ...corsHeaders,
    },
  });
}

async function getCategories(db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  const { results } = await db.prepare('SELECT * FROM categories WHERE user_id = ?').bind(session.user_id).all();
  return jsonResponse(results, 200, corsHeaders);
}

async function createCategory(request, db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  const { name } = await request.json();
  if (!name) return jsonResponse({ error: '分类名称不能为空' }, 400, corsHeaders);
  try {
    const result = await db.prepare('INSERT INTO categories (name, user_id) VALUES (?, ?)').bind(name, session.user_id).run();
    return jsonResponse({ success: true, id: result.meta.last_row_id }, 201, corsHeaders);
  } catch (e) {
    return jsonResponse({ success: true }, 200, corsHeaders); // 忽略重复插入
  }
}

async function deleteCategory(id, db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  await db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?').bind(id, session.user_id).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

async function getNotes(db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  const { results } = await db
    .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY sort_order ASC, created_at DESC')
    .bind(session.user_id)
    .all();
  return jsonResponse(results, 200, corsHeaders);
}

async function saveNote(request, db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  const { id, title, content, category } = await request.json();
  if (id) {
    await db
      .prepare("UPDATE notes SET title = ?, content = ?, category = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?")
      .bind(title, content || '', category || '工作', id, session.user_id)
      .run();
    return jsonResponse({ success: true, id, title, content, category }, 200, corsHeaders);
  } else {
    const result = await db
      .prepare('INSERT INTO notes (title, content, category, user_id) VALUES (?, ?, ?, ?)')
      .bind(title, content || '', category || '工作', session.user_id)
      .run();
    return jsonResponse({ success: true, id: result.meta.last_row_id, title, content, category }, 201, corsHeaders);
  }
}

async function deleteNote(id, db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  await db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').bind(id, session.user_id).run();
  return jsonResponse({ success: true }, 200, corsHeaders);
}

async function saveOrder(request, db, session, corsHeaders) {
  if (!session) return jsonResponse({ error: '未登录' }, 401, corsHeaders);
  const { order } = await request.json();
  for (let i = 0; i < order.length; i++) {
    await db.prepare('UPDATE notes SET sort_order = ? WHERE id = ? AND user_id = ?').bind(i, order[i], session.user_id).run();
  }
  return jsonResponse({ success: true }, 200, corsHeaders);
}
