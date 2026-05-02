const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#4f46e5">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <title>云笔记 Pro</title>
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%234f46e5' d='M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z'/><path fill='%23fff' d='M8 13H16M8 17H13'/></svg>">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet">
    <script src="https://cdn.quilljs.com/1.3.6/quill.min.js"></script>
    <style>
        * { -webkit-tap-highlight-color: transparent; }
        body { background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .ql-container { font-size: 16px; border: none !important; height: 350px; }
        .ql-toolbar { border: none !important; border-bottom: 1px solid #f1f5f9 !important; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .note-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .note-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
        .modal-backdrop { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .search-highlight { background: linear-gradient(120deg, #fef3c7 0%, #fde68a 100%); padding: 0 2px; border-radius: 2px; }
        .category-chip { transition: all 0.2s ease; }
        .category-chip:hover { transform: scale(1.05); }
        .category-chip.active { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; }
        .btn-primary { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); transition: all 0.2s ease; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); }
        .pinned-card { border: 2px solid #fbbf24; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
        .favorite-card { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
    </style>
</head>
<body>
    <div id="app" class="max-w-6xl mx-auto p-4 md:p-8">
        <!-- 登录页面 -->
        <div id="login-section" class="fade-in flex items-center justify-center min-h-screen">
            <div class="bg-white p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md text-center">
                <div class="mb-8">
                    <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" class="w-12 h-12" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="white" opacity="0.3"/>
                            <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                            <path d="M8 13H16M8 17H13" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">云笔记 Pro</h1>
                    <p class="text-gray-400 mt-2 text-sm">记录每一个灵感瞬间</p>
                </div>
                <div id="login-error" class="text-red-500 mb-4 text-sm hidden"></div>
                <input type="text" id="username" class="w-full p-4 mb-4 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-center" placeholder="请输入账号" value="yybtech">
                <input type="password" id="password" class="w-full p-4 mb-6 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all text-center" placeholder="请输入密码" value="violet2008">
                <button onclick="handleLogin()" class="w-full btn-primary text-white p-4 rounded-2xl font-bold shadow-lg text-lg">
                    登 录
                </button>
                <div class="mt-8 text-xs text-gray-400 space-y-1">
                    <p>默认账号：yybtech / violet2008</p>
                    <p>或：admin / admin123</p>
                </div>
            </div>
        </div>

        <!-- 主应用 -->
        <div id="main-section" class="hidden">
            <!-- 顶部导航 -->
            <header class="mb-8">
                <div class="bg-white p-6 rounded-3xl shadow-sm mb-4">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <svg viewBox="0 0 24 24" fill="none" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" fill="white" opacity="0.3"/>
                                    <path d="M8 13H16M8 17H13" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-800">我的笔记</h1>
                                <p class="text-xs text-gray-400" id="note-count">共 0 篇笔记</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="handleLogout()" class="p-2 text-gray-400 hover:text-red-500 transition-colors md:hidden">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            </button>
                            <button onclick="handleLogout()" class="hidden md:block px-4 py-2 text-sm text-gray-500 hover:text-red-500 transition-colors">退出</button>
                        </div>
                    </div>
                    
                    <!-- 搜索栏 -->
                    <div class="relative mb-5">
                        <input type="text" id="search-input" oninput="handleSearch()" placeholder="搜索笔记标题或内容..." class="w-full p-3 pl-12 bg-gray-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all">
                        <svg class="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    
                    <!-- 分类标签 -->
                    <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar" id="category-tabs"></div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="flex gap-3">
                    <button onclick="showEditor()" class="flex-1 btn-primary text-white py-4 rounded-2xl font-bold shadow-lg text-lg flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        新建笔记
                    </button>
                    <button onclick="manageCategories()" class="px-6 py-4 bg-white text-gray-600 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                        <span class="hidden md:inline">标签</span>
                    </button>
                </div>
            </header>
            
            <!-- 笔记列表 -->
            <div id="notes-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"></div>
            
            <!-- 空状态 -->
            <div id="empty-state" class="hidden text-center py-16">
                <div class="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="none" class="w-12 h-12 text-gray-300" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M14 2V6C14 7.10457 14.8954 8 16 8H20" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                        <path d="M8 13H16M8 17H13" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    </svg>
                </div>
                <p class="text-gray-400 text-lg mb-2">暂无笔记</p>
                <p class="text-gray-300 text-sm">点击上方按钮创建第一篇笔记</p>
            </div>
        </div>

        <!-- 分类管理弹窗 -->
        <div id="category-modal" class="fixed inset-0 bg-gray-900/50 hidden z-[60] flex items-end md:items-center justify-center modal-backdrop">
            <div class="bg-white w-full md:w-full md:max-w-md p-6 md:rounded-3xl shadow-2xl slide-up md:mb-0">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-bold text-gray-800">管理标签</h3>
                    <button onclick="closeCategoryModal()" class="p-2 text-gray-400 hover:text-gray-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div id="category-edit-list" class="space-y-2 mb-6 max-h-64 overflow-y-auto"></div>
                <div class="flex gap-2">
                    <input type="text" id="new-cat-name" placeholder="新增标签名称" class="flex-1 p-3 bg-gray-50 rounded-xl outline-none border-2 border-transparent focus:border-indigo-500 transition-all">
                    <button onclick="addCategory()" class="btn-primary text-white px-6 py-3 rounded-xl font-medium">添加</button>
                </div>
            </div>
        </div>

        <!-- 编辑器弹窗 -->
        <div id="editor-modal" class="fixed inset-0 bg-gray-900/50 hidden z-50 flex items-end md:items-center justify-center modal-backdrop">
            <div class="bg-white w-full md:max-w-4xl md:rounded-3xl shadow-2xl slide-up max-h-[95vh] overflow-hidden flex flex-col">
                <div class="p-6 border-b border-gray-100">
                    <div class="flex items-center gap-4 mb-4">
                        <select id="note-category" class="bg-indigo-50 text-indigo-600 font-bold px-4 py-2 rounded-xl border-none outline-none"></select>
                        <input type="text" id="note-title" placeholder="输入标题..." class="flex-1 text-xl md:text-2xl font-bold outline-none border-none text-gray-800">
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-400">
                        <span id="editor-status" class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <span id="last-save-time">未保存</span>
                        </span>
                    </div>
                </div>
                <div id="editor-container" class="flex-1 overflow-y-auto"></div>
                <div class="p-4 md:p-6 border-t border-gray-100 flex justify-between items-center">
                    <div class="flex gap-2">
                        <button id="pin-btn" onclick="togglePin()" class="p-3 rounded-xl transition-all bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600" title="置顶">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><path d="M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"/></svg>
                        </button>
                        <button id="favorite-btn" onclick="toggleFavorite()" class="p-3 rounded-xl transition-all bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500" title="收藏">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                        </button>
                        <button id="delete-btn" onclick="handleDelete()" class="p-3 rounded-xl bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all" title="删除">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="hideEditor()" class="px-6 py-3 text-gray-400 hover:text-gray-600 transition-colors">取消</button>
                        <button onclick="saveNote()" class="btn-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg">保存</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentNoteId = null;
        let quill;
        let activeCategory = '全部';
        let dbCategories = [];
        let allNotes = [];
        let note = { is_pinned: false, is_favorite: false };
        let autoSaveTimer = null;

        window.onload = () => {
            checkAuth();
        };

        async function checkAuth() {
            const savedUser = localStorage.getItem('note_user');
            const savedPass = localStorage.getItem('note_pass');
            if (savedUser && savedPass) {
                document.getElementById('username').value = savedUser;
                document.getElementById('password').value = savedPass;
                await handleLogin(true);
            } else {
                document.getElementById('login-section').classList.remove('hidden');
            }
        }

        async function handleLogin(silent = false) {
            const user = document.getElementById('username').value;
            const pass = document.getElementById('password').value;
            const errorEl = document.getElementById('login-error');
            
            localStorage.setItem('note_user', user);
            localStorage.setItem('note_pass', pass);
            
            const res = await fetch('/api/login', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({username: user, password: pass}) 
            });
            
            if (res.ok) {
                document.getElementById('login-section').classList.add('hidden');
                document.getElementById('main-section').classList.remove('hidden');
                initEditor();
                await refreshCategories();
                loadNotes();
            } else if (!silent) {
                errorEl.textContent = '账号或密码错误！';
                errorEl.classList.remove('hidden');
                setTimeout(() => errorEl.classList.add('hidden'), 3000);
            }
        }

        function initEditor() {
            if (quill) return;
            quill = new Quill('#editor-container', {
                theme: 'snow',
                modules: { 
                    toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['blockquote', 'code-block'],
                        ['link', 'image'],
                        ['clean']
                    ] 
                }
            });
            
            quill.on('text-change', () => {
                clearTimeout(autoSaveTimer);
                autoSaveTimer = setTimeout(autoSave, 2000);
            });
        }

        async function autoSave() {
            if (!currentNoteId) return;
            document.getElementById('last-save-time').textContent = '自动保存中...';
            await saveNote(true);
            document.getElementById('last-save-time').textContent = '已自动保存';
        }

        function handleLogout() {
            localStorage.removeItem('note_user');
            localStorage.removeItem('note_pass');
            location.reload();
        }

        async function refreshCategories() {
            const res = await fetch('/api/categories');
            dbCategories = await res.json();
            renderCategories();
        }

        function renderCategories() {
            let tabsHtml = '<button onclick="switchCategory('全部')" class="category-chip px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ' + (activeCategory === '全部' ? 'active' : 'bg-gray-100 text-gray-600') + '">📋 全部</button>';
            tabsHtml += '<button onclick="switchCategory('收藏')" class="category-chip px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ' + (activeCategory === '收藏' ? 'active' : 'bg-gray-100 text-gray-600') + '">⭐ 收藏</button>';
            tabsHtml += '<button onclick="switchCategory('置顶')" class="category-chip px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ' + (activeCategory === '置顶' ? 'active' : 'bg-gray-100 text-gray-600') + '">📌 置顶</button>';
            for (let i = 0; i < dbCategories.length; i++) {
                const c = dbCategories[i];
                tabsHtml += '<button onclick="switchCategory(' + c.name + ')" class="category-chip px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ' + (activeCategory === c.name ? 'active' : 'bg-gray-100 text-gray-600') + '">' + c.name + '</button>';
            }
            document.getElementById('category-tabs').innerHTML = tabsHtml;
            
            let optionsHtml = '';
            for (let i = 0; i < dbCategories.length; i++) {
                const c = dbCategories[i];
                optionsHtml += '<option value="' + c.name + '">' + c.name + '</option>';
            }
            document.getElementById('note-category').innerHTML = optionsHtml;
        }

        function switchCategory(cat) { 
            activeCategory = cat; 
            renderCategories(); 
            loadNotes(); 
        }

        function handleSearch() {
            loadNotes();
        }

        async function loadNotes() {
            const res = await fetch('/api/notes');
            allNotes = await res.json();
            
            let notes = allNotes.slice();
            
            // 筛选
            if (activeCategory === '收藏') {
                notes = notes.filter(n => n.is_favorite);
            } else if (activeCategory === '置顶') {
                notes = notes.filter(n => n.is_pinned);
            } else if (activeCategory !== '全部') {
                notes = notes.filter(n => n.category === activeCategory);
            }
            
            // 搜索
            const searchText = document.getElementById('search-input').value.toLowerCase().trim();
            if (searchText) {
                notes = notes.filter(n => 
                    n.title.toLowerCase().includes(searchText) || 
                    stripHtml(n.content).toLowerCase().includes(searchText)
                );
            }
            
            // 置顶优先，然后按排序
            notes.sort((a, b) => {
                if (a.is_pinned !== b.is_pinned) {
                    return b.is_pinned ? 1 : -1;
                }
                return (a.sort_order || 0) - (b.sort_order || 0);
            });
            
            document.getElementById('note-count').textContent = '共 ' + notes.length + ' 篇笔记';
            
            const list = document.getElementById('notes-list');
            const emptyState = document.getElementById('empty-state');
            
            if (notes.length === 0) {
                list.innerHTML = '';
                emptyState.classList.remove('hidden');
                return;
            }
            
            emptyState.classList.add('hidden');
            
            const searchTextLower = searchText.toLowerCase();
            let listHtml = '';
            for (let i = 0; i < notes.length; i++) {
                const n = notes[i];
                let title = escapeHtml(n.title || '无标题');
                let content = truncateText(stripHtml(n.content), 100);
                if (searchText) {
                    title = highlightText(title, searchTextLower);
                    content = highlightText(content, searchTextLower);
                }
                let pinnedClass = n.is_pinned ? 'pinned-card' : '';
                let favClass = n.is_favorite && !n.is_pinned ? 'favorite-card' : '';
                
                listHtml += '<div class="note-card ' + pinnedClass + ' ' + favClass + ' bg-white p-5 rounded-2xl shadow-sm cursor-pointer border border-gray-100" data-id="' + n.id + '" onclick="editNote(' + n.id + ', \'' + escapeAttr(n.title) + '\', \'' + escapeAttr(n.content) + '\', \'' + escapeAttr(n.category) + '\', ' + n.is_pinned + ', ' + n.is_favorite + ')">';
                listHtml += '<div class="flex items-start justify-between mb-3">';
                listHtml += '<span class="text-xs font-bold text-indigo-400 uppercase bg-indigo-50 px-2 py-1 rounded-md">' + escapeHtml(n.category) + '</span>';
                listHtml += '<div class="flex items-center gap-1">';
                listHtml += n.is_pinned ? '<span class="text-yellow-500">📌</span>' : '';
                listHtml += n.is_favorite ? '<span class="text-red-400">⭐</span>' : '';
                listHtml += '</div></div>';
                listHtml += '<h3 class="font-bold text-base md:text-lg text-gray-800 mb-2 line-clamp-1">' + title + '</h3>';
                listHtml += '<div class="text-gray-400 text-sm line-clamp-2 mb-3">' + content + '</div>';
                listHtml += '<div class="text-xs text-gray-300">' + formatTime(n.updated_at || n.created_at) + '</div></div>';
            }
            list.innerHTML = listHtml;
            
            new Sortable(list, { animation: 150, onEnd: saveOrder });
        }

        function highlightText(text, search) {
            if (!search) return text;
            const regex = new RegExp('(' + search + ')', 'gi');
            return text.replace(regex, '<span class="search-highlight">$1</span>');
        }

        function truncateText(text, length) {
            return text.length > length ? text.substring(0, length) + '...' : text;
        }

        async function saveNote(isAuto = false) {
            const title = document.getElementById('note-title').value;
            const category = document.getElementById('note-category').value || '工作';
            const content = quill.root.innerHTML;
            
            await fetch('/api/notes', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: currentNoteId, 
                    title: title, 
                    content: content, 
                    category: category,
                    is_pinned: note.is_pinned,
                    is_favorite: note.is_favorite
                }) 
            });
            
            if (!isAuto) {
                hideEditor(); 
                loadNotes();
            }
        }

        // 分类管理
        function manageCategories() { 
            document.getElementById('category-modal').classList.remove('hidden'); 
            renderCategoryEditList(); 
        }
        
        function renderCategoryEditList() {
            let listHtml = '';
            for (let i = 0; i < dbCategories.length; i++) {
                const c = dbCategories[i];
                listHtml += '<div class="flex justify-between items-center bg-gray-50 p-3 rounded-xl">';
                listHtml += '<span class="font-medium text-gray-700">' + escapeHtml(c.name) + '</span>';
                listHtml += '<button onclick="deleteCategory(' + c.id + ')" class="text-red-400 text-sm hover:text-red-600 font-bold">删除</button>';
                listHtml += '</div>';
            }
            document.getElementById('category-edit-list').innerHTML = listHtml;
        }

        async function addCategory() {
            const name = document.getElementById('new-cat-name').value.trim();
            if (!name) return;
            await fetch('/api/categories', { method: 'POST', body: JSON.stringify({ name: name }) });
            document.getElementById('new-cat-name').value = '';
            await refreshCategories();
        }

        async function deleteCategory(id) {
            if (dbCategories.length <= 1) {
                return alert('至少保留一个标签！');
            }
            if (confirm('删除标签不会删除该标签下的笔记，确定要删除吗？')) {
                await fetch('/api/categories/' + id, { method: 'DELETE' });
                await refreshCategories();
                loadNotes();
            }
        }
        
        function closeCategoryModal() { 
            document.getElementById('category-modal').classList.add('hidden'); 
        }

        // 编辑器
        function showEditor() { 
            currentNoteId = null; 
            note = { is_pinned: false, is_favorite: false };
            document.getElementById('note-title').value = ''; 
            quill.root.innerHTML = ''; 
            document.getElementById('delete-btn').classList.add('hidden');
            document.getElementById('last-save-time').textContent = '未保存';
            updatePinFavoriteUI();
            document.getElementById('editor-modal').classList.remove('hidden'); 
        }
        
        function hideEditor() { 
            document.getElementById('editor-modal').classList.add('hidden'); 
        }
        
        function editNote(id, title, content, category, isPinned, isFavorite) {
            currentNoteId = id; 
            note = { is_pinned: isPinned, is_favorite: isFavorite };
            document.getElementById('note-title').value = title; 
            document.getElementById('note-category').value = category || '工作';
            quill.root.innerHTML = content; 
            document.getElementById('delete-btn').classList.remove('hidden');
            document.getElementById('last-save-time').textContent = '已保存';
            updatePinFavoriteUI();
            document.getElementById('editor-modal').classList.remove('hidden');
        }

        function updatePinFavoriteUI() {
            const pinBtn = document.getElementById('pin-btn');
            const favBtn = document.getElementById('favorite-btn');
            
            if (note.is_pinned) {
                pinBtn.className = 'p-3 rounded-xl transition-all bg-yellow-100 text-yellow-600';
            } else {
                pinBtn.className = 'p-3 rounded-xl transition-all bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-600';
            }
            
            if (note.is_favorite) {
                favBtn.className = 'p-3 rounded-xl transition-all bg-red-100 text-red-500';
                favBtn.querySelector('svg').setAttribute('fill', 'currentColor');
            } else {
                favBtn.className = 'p-3 rounded-xl transition-all bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500';
                favBtn.querySelector('svg').setAttribute('fill', 'none');
            }
        }

        function togglePin() {
            note.is_pinned = !note.is_pinned;
            updatePinFavoriteUI();
        }

        function toggleFavorite() {
            note.is_favorite = !note.is_favorite;
            updatePinFavoriteUI();
        }
        
        async function handleDelete() { 
            if (confirm('彻底删除这条笔记？')) { 
                await fetch('/api/notes/' + currentNoteId, {method:'DELETE'}); 
                hideEditor(); 
                loadNotes(); 
            } 
        }
        
        async function saveOrder() {
            const order = Array.from(document.querySelectorAll('.note-card')).map(el => el.dataset.id);
            await fetch('/api/order', { method: 'POST', body: JSON.stringify({ order: order }) });
        }

        // 工具函数
        function escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str || '';
            return div.innerHTML;
        }

        function escapeAttr(str) {
            return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
        }

        function stripHtml(str) {
            const div = document.createElement('div');
            div.innerHTML = str || '';
            return div.textContent || div.innerText || '';
        }

        function formatTime(t) {
            if (!t) return '';
            const date = new Date(t.replace(' ', 'T'));
            return date.toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    </script>
</body>
</html>`;

export default {
    async fetch(request, env) {
        try {
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)").run();
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE)").run();
            await env.DB.prepare("CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, content TEXT, category TEXT DEFAULT '工作', sort_order INTEGER DEFAULT 0, is_pinned INTEGER DEFAULT 0, is_favorite INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP)").run();
            
            const userCheck = await env.DB.prepare("SELECT * FROM users LIMIT 1").first();
            if (!userCheck) {
                await env.DB.prepare("INSERT INTO users (username, password) VALUES ('yybtech', 'violet2008')").run();
                await env.DB.prepare("INSERT INTO users (username, password) VALUES ('admin', 'admin123')").run();
            }

            const catCheck = await env.DB.prepare("SELECT * FROM categories LIMIT 1").first();
            if (!catCheck) {
                await env.DB.prepare("INSERT INTO categories (name) VALUES ('工作'), ('生活'), ('灵感'), ('学习'), ('项目')").run();
            }
        } catch (e) {
            console.log("DB Init Error: ", e);
        }

        const url = new URL(request.url);

        // PWA Manifest
        if (url.pathname === "/manifest.json") {
            return new Response(JSON.stringify({
                name: "云笔记 Pro",
                short_name: "云笔记",
                start_url: "/",
                display: "standalone",
                background_color: "#f8fafc",
                theme_color: "#4f46e5",
                icons: [{
                    src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%234f46e5' d='M4 4C4 2.89543 4.89543 2 6 2H14L20 8V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z'/></svg>",
                    sizes: "192x192",
                    type: "image/svg+xml"
                }]
            }), { headers: { "content-type": "application/json" } });
        }

        // Service Worker
        if (url.pathname === "/sw.js") {
            const sw = `
                const CACHE_NAME = 'note-pro-v1';
                self.addEventListener('install', e => self.skipWaiting());
                self.addEventListener('activate', e => e.waitUntil(clients.claim()));
                self.addEventListener('fetch', e => {
                    e.respondWith(
                        caches.match(e.request).then(r => r || fetch(e.request).then(res => {
                            if (e.request.url.startsWith('http')) {
                                const clone = res.clone();
                                caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
                            }
                            return res;
                        }).catch(() => caches.match('/'))
                    );
                });
            `;
            return new Response(sw, { headers: { "content-type": "application/javascript" } });
        }

        // 静态页面
        if (url.pathname === "/" || url.pathname === "/index.html") {
            const html = HTML_CONTENT.replace('</head>', '<script>if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");</script></head>');
            return new Response(html, { headers: { "content-type": "text/html;charset=UTF-8" } });
        }

        // 登录
        if (url.pathname === "/api/login" && request.method === "POST") {
            const { username, password } = await request.json();
            const user = await env.DB.prepare("SELECT * FROM users WHERE username = ? AND password = ?").bind(username, password).first();
            return user ? new Response(JSON.stringify({success:true})) : new Response(JSON.stringify({error:1}), {status:401}));
        }

        // 分类
        if (url.pathname === "/api/categories") {
            if (request.method === "GET") {
                const { results } = await env.DB.prepare("SELECT * FROM categories").all();
                return new Response(JSON.stringify(results));
            }
            if (request.method === "POST") {
                const { name } = await request.json();
                try {
                    await env.DB.prepare("INSERT INTO categories (name) VALUES (?)").bind(name).run();
                } catch(e) {}
                return new Response(JSON.stringify({success:true}));
            }
        }
        if (url.pathname.startsWith("/api/categories/") && request.method === "DELETE") {
            const id = url.pathname.split("/").pop();
            await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
            return new Response(JSON.stringify({success:true}));
        }

        // 笔记
        if (url.pathname === "/api/notes") {
            if (request.method === "GET") {
                const { results } = await env.DB.prepare("SELECT * FROM notes ORDER BY is_pinned DESC, sort_order ASC, created_at DESC").all();
                return new Response(JSON.stringify(results));
            }
            if (request.method === "POST") {
                const { id, title, content, category, is_pinned, is_favorite } = await request.json();
                if (id) {
                    await env.DB.prepare("UPDATE notes SET title = ?, content = ?, category = ?, is_pinned = ?, is_favorite = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(title, content, category, is_pinned ? 1 : 0, is_favorite ? 1 : 0, id).run();
                } else {
                    await env.DB.prepare("INSERT INTO notes (title, content, category, sort_order, is_pinned, is_favorite) VALUES (?, ?, ?, 0, ?, ?)").bind(title, content, category, is_pinned ? 1 : 0, is_favorite ? 1 : 0).run();
                }
                return new Response(JSON.stringify({success:true}));
            }
        }
        if (url.pathname.startsWith("/api/notes/") && request.method === "DELETE") {
            const id = url.pathname.split("/").pop();
            await env.DB.prepare("DELETE FROM notes WHERE id = ?").bind(id).run();
            return new Response(JSON.stringify({success:true}));
        }

        if (url.pathname === "/api/order") {
            const { order } = await request.json();
            for (let i = 0; i < order.length; i++) {
                await env.DB.prepare("UPDATE notes SET sort_order = ? WHERE id = ?").bind(i, order[i]).run();
            }
            return new Response(JSON.stringify({success:true}));
        }

        return new Response("Not Found", { status: 404 });
    }
};
