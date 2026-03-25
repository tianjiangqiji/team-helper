// ==UserScript==
// @name GPT 管理员工具 (密钥获取 + 团队管理 + 绑卡生成)
// @namespace http://tampermonkey.net/
// @version 2.0
// @description 集成了密钥获取、团队管理面板与Team绑卡页面生成功能。左键打开团队管理，中键复制密钥，右键生成绑卡页面。
// @author Combined
// @match https://chatgpt.com/*
// @grant GM_setClipboard
// @grant GM_addStyle
// @grant GM_notification
// @run-at document-end
// ==/UserScript==

(function() {
   'use strict';

   // ==========================================
   // 共享状态与样式变量 (以第一个脚本为基准)
   // ==========================================
   const SHARED_STYLES = `
       :root {
           --ur-bg: #09090b;
           --ur-card: #09090b;
           --ur-primary: #ffffff;
           --ur-sec: #27272a;
           --ur-sec-fg: #fafafa;
           --ur-muted: #27272a;
           --ur-muted-fg: #a1a1aa;
           --ur-accent: #27272a;
           --ur-border: #27272a;
           --ur-input: #27272a;
           --ur-ring: #d4d4d8;
           --ur-radius: 0.5rem;
           --ur-success: #10a37f;
           --ur-error: #ef4444;
       }
       
       /* 悬浮按钮样式 - 三按钮布局 */
       #gpt-admin-tool-btn {
           position: fixed;
           bottom: 20px;
           right: 20px;
           z-index: 999999;
           display: flex;
           align-items: stretch;
           padding: 0;
           background: var(--ur-bg);
           color: var(--ur-sec-fg);
           border-radius: 12px;
           border: 1px solid var(--ur-border);
           font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
           font-size: 14px;
           box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
           transition: all 0.2s ease;
           user-select: none;
           overflow: hidden;
       }
       
       #gpt-admin-tool-btn:hover {
           transform: translateY(-2px);
           border-color: var(--ur-ring);
           box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
       }
       
       .gpt-btn-third {
           flex: 1;
           padding: 12px 16px;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
           cursor: pointer;
           transition: background 0.2s;
           min-width: 80px;
       }
       
       .gpt-btn-third:hover {
           background: rgba(255, 255, 255, 0.1);
       }
       
       .gpt-btn-divider {
           width: 1px;
           background: var(--ur-border);
       }
       
       #gpt-tool-indicator {
           width: 8px;
           height: 8px;
           border-radius: 50%;
           background: var(--ur-muted-fg);
           transition: all 0.3s ease;
       }
       
       #gpt-tool-indicator.active {
           background: var(--ur-success);
           box-shadow: 0 0 8px var(--ur-success);
       }
       
       #gpt-tool-indicator.working {
           background: #eab308;
           box-shadow: 0 0 8px #eab308;
       }
       
       /* 团队管理面板样式 */
       #ur-panel {
           position: fixed;
           top: 15%;
           left: 50%;
           transform: translateX(-50%);
           width: 95vw;
           height: 80vh;
           max-width: 480px;
           max-height: 650px;
           background: var(--ur-bg);
           border: 1px solid var(--ur-border);
           border-radius: var(--ur-radius);
           box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5);
           z-index: 99999;
           display: none;
           flex-direction: column;
           font-family: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
           color: var(--ur-sec-fg);
           overflow: hidden;
           touch-action: none;
       }
       
       /* 绑卡配置面板样式 - 适配深色主题 */
       #team-pay-panel {
           position: fixed;
           top: 0;
           left: 0;
           right: 0;
           bottom: 0;
           background: rgba(0,0,0,0.7);
           z-index: 100000;
           display: flex;
           align-items: center;
           justify-content: center;
           font-family: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
       }
       
       #team-pay-content {
           background: var(--ur-bg);
           border: 1px solid var(--ur-border);
           border-radius: var(--ur-radius);
           width: 420px;
           max-width: 90vw;
           max-height: 90vh;
           overflow-y: auto;
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
       }
       
       #team-pay-header {
           background: var(--ur-sec);
           color: var(--ur-sec-fg);
           padding: 20px;
           text-align: center;
           border-bottom: 1px solid var(--ur-border);
       }
       
       #team-pay-header h2 {
           margin: 0;
           font-size: 18px;
           font-weight: 600;
       }
       
       #team-pay-header p {
           margin: 8px 0 0;
           opacity: 0.8;
           font-size: 14px;
           color: var(--ur-muted-fg);
       }
       
       #team-pay-body {
           padding: 24px;
       }
       
       .tp-form-group {
           margin-bottom: 16px;
       }
       
       .tp-form-group label {
           display: block;
           margin-bottom: 6px;
           font-weight: 500;
           color: var(--ur-sec-fg);
           font-size: 14px;
       }
       
       .tp-form-group select,
       .tp-form-group input {
           width: 100%;
           padding: 10px 12px;
           border: 1px solid var(--ur-input);
           border-radius: var(--ur-radius);
           font-size: 14px;
           background: var(--ur-bg);
           color: var(--ur-sec-fg);
           box-sizing: border-box;
           outline: none;
           transition: border-color 0.2s;
       }
       
       .tp-form-group select:focus,
       .tp-form-group input:focus {
           border-color: var(--ur-ring);
       }
       
       .tp-info-box {
           background: rgba(16, 163, 127, 0.1);
           border: 1px solid rgba(16, 163, 127, 0.2);
           border-radius: var(--ur-radius);
           padding: 12px;
           margin-bottom: 20px;
           font-size: 13px;
           color: var(--ur-success);
           line-height: 1.5;
       }
       
       .tp-btn {
           width: 100%;
           padding: 12px;
           background: var(--ur-sec);
           color: var(--ur-sec-fg);
           border: 1px solid var(--ur-border);
           border-radius: var(--ur-radius);
           font-size: 14px;
           font-weight: 500;
           cursor: pointer;
           transition: all 0.2s;
       }
       
       .tp-btn:hover {
           background: #3f3f46;
           border-color: var(--ur-ring);
       }
       
       .tp-btn.primary {
           background: var(--ur-success);
           border-color: var(--ur-success);
           color: white;
       }
       
       .tp-btn.primary:hover {
           opacity: 0.9;
       }
       
       .tp-btn:disabled {
           opacity: 0.5;
           cursor: not-allowed;
       }
       
       #tp-status {
           margin-top: 16px;
           padding: 12px;
           border-radius: var(--ur-radius);
           font-size: 13px;
           display: none;
       }
       
       #tp-status.success {
           background: rgba(16, 163, 127, 0.1);
           color: var(--ur-success);
           border: 1px solid rgba(16, 163, 127, 0.2);
       }
       
       #tp-status.error {
           background: rgba(239, 68, 68, 0.1);
           color: var(--ur-error);
           border: 1px solid rgba(239, 68, 68, 0.2);
       }
       
       .tp-url-input {
           width: 100%;
           padding: 8px;
           border: 1px solid var(--ur-border);
           border-radius: 6px;
           font-size: 12px;
           margin: 8px 0;
           background: var(--ur-card);
           color: var(--ur-sec-fg);
           font-family: monospace;
       }
       
       .tp-actions {
           display: flex;
           gap: 8px;
           margin-top: 12px;
       }
       
       .tp-actions .tp-btn {
           flex: 1;
       }
       
       /* Header 样式 */
       #ur-header {
           padding: 1rem 1.25rem;
           display: flex;
           justify-content: space-between;
           align-items: center;
           cursor: move;
           border-bottom: 1px solid var(--ur-border);
           background: var(--ur-bg);
       }
       
       #ur-title {
           font-weight: 600;
           font-size: 1rem;
           letter-spacing: -0.025em;
           pointer-events: none;
       }
       
       #ur-close, #tp-close {
           cursor: pointer;
           color: var(--ur-muted-fg);
           border-radius: 4px;
           padding: 4px;
           transition: all 0.2s;
           border: none;
           background: transparent;
           line-height: 1;
           font-size: 18px;
       }
       
       #ur-close:hover, #tp-close:hover {
           background: var(--ur-accent);
           color: var(--ur-sec-fg);
       }
       
       /* 控制栏 */
       #ur-controls {
           padding: 1rem;
           display: flex;
           gap: 0.5rem;
           align-items: center;
       }
       
       #ur-search {
           flex: 1;
           height: 2.25rem;
           border-radius: var(--ur-radius);
           border: 1px solid var(--ur-input);
           background: transparent;
           padding: 0 0.75rem;
           font-size: 0.875rem;
           color: #fff;
           transition: border-color 0.2s;
           outline: none;
       }
       
       #ur-search:focus {
           border-color: var(--ur-ring);
       }
       
       /* 按钮样式 */
       .ur-btn {
           height: 2.25rem;
           padding: 0 0.75rem;
           background: var(--ur-sec);
           color: var(--ur-sec-fg);
           border: 1px solid var(--ur-border);
           border-radius: var(--ur-radius);
           font-size: 0.875rem;
           font-weight: 500;
           cursor: pointer;
           display: inline-flex;
           align-items: center;
           justify-content: center;
           transition: background 0.2s;
           white-space: nowrap;
       }
       
       .ur-btn:hover {
           background: #3f3f46;
       }
       
       #ur-team-info {
           padding: 0 1rem 0.5rem;
           font-size: 0.75rem;
           color: var(--ur-muted-fg);
       }
       
       /* 列表区域 */
       #ur-body {
           flex: 1;
           overflow-y: auto;
           position: relative;
       }
       
       #ur-body::-webkit-scrollbar {
           width: 5px;
       }
       
       #ur-body::-webkit-scrollbar-thumb {
           background: var(--ur-muted);
           border-radius: 10px;
       }
       
       .ur-user-row {
           display: flex;
           align-items: center;
           padding: 0.75rem 1rem;
           border-bottom: 1px solid var(--ur-border);
           transition: background 0.2s;
       }
       
       .ur-user-row:hover {
           background: rgba(255,255,255,0.03);
       }
       
       .ur-info {
           flex: 1;
           min-width: 0;
       }
       
       .ur-name {
           font-size: 0.875rem;
           font-weight: 500;
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
       }
       
       .ur-email {
           font-size: 0.75rem;
           color: var(--ur-muted-fg);
           white-space: nowrap;
           overflow: hidden;
           text-overflow: ellipsis;
       }
       
       /* 操作按钮 */
       .ur-action {
           display: flex;
           align-items: center;
           gap: 0.5rem;
       }
       
       .ur-select {
           background: var(--ur-bg);
           color: var(--ur-sec-fg);
           border: 1px solid var(--ur-border);
           border-radius: var(--ur-radius);
           font-size: 0.75rem;
           padding: 0.25rem 0.5rem;
           outline: none;
           cursor: pointer;
       }
       
       .ur-del-btn {
           width: 2rem;
           height: 2rem;
           border-radius: var(--ur-radius);
           border: 1px solid transparent;
           background: transparent;
           color: #ef4444;
           cursor: pointer;
           transition: all 0.2s;
           display: flex;
           align-items: center;
           justify-content: center;
           font-size: 1.1rem;
       }
       
       .ur-del-btn:hover {
           background: #450a0a;
           border-color: #7f1d1d;
       }
       
       #ur-status {
           padding: 0.5rem;
           font-size: 0.7rem;
           color: var(--ur-muted-fg);
           text-align: center;
           border-top: 1px solid var(--ur-border);
       }
       
       /* 加载动画层 */
       .loading-overlay {
           position: absolute;
           inset: 0;
           background: rgba(9,9,11,0.85);
           display: flex;
           justify-content: center;
           align-items: center;
           font-size: 0.875rem;
           color: var(--ur-muted-fg);
           opacity: 0;
           pointer-events: none;
           transition: opacity 0.2s;
           z-index: 10;
       }
       
       .loading-overlay.active {
           opacity: 1;
           pointer-events: all;
       }
   `;
   
   GM_addStyle(SHARED_STYLES);

   // ==========================================
   // 模块 1: 密钥获取逻辑
   // ==========================================
   const KeyGrabber = {
       async fetchSession() {
           try {
               const resp = await fetch('/api/auth/session', { credentials: 'include' });
               if (!resp.ok) {
                   console.warn('[Tool] Session API 返回非 200:', resp.status);
                   return null;
               }
               const data = await resp.json();
               if (data && data.accessToken) {
                   return data;
               }
           } catch (e) {
               console.error('[Tool] 获取 Token 失败:', e);
           }
           return null;
       },
       
       getAccountIdFromCookie() {
           const match = document.cookie.match(/(?:^|;\s*)_account=([^;]+)/);
           if (match) {
               return decodeURIComponent(match[1] || '').trim().replace(/"/g, '');
           }
           const ls = localStorage.getItem('_account');
           if (ls) return ls.replace(/"/g, '');
           return '';
       },
       
       async execute(statusEl) {
           statusEl.innerText = '获取中...';
           document.getElementById('gpt-tool-indicator').className = 'working';
           
           const sessionData = await this.fetchSession();
           const accountId = this.getAccountIdFromCookie();
           
           if (!sessionData || !sessionData.accessToken) {
               alert('获取失败！请确保你已经登录 ChatGPT。');
               statusEl.innerText = '📋 复制密钥';
               document.getElementById('gpt-tool-indicator').className = '';
               return;
           }
           
           const token = sessionData.accessToken;
           const email = sessionData.user?.email || sessionData.user?.name || 'unknown';
           const resultStr = `${email}:${email}:${accountId || 'unknown'}:${token}`;
           
           GM_setClipboard(resultStr);
           statusEl.innerText = '✅ 已复制';
           document.getElementById('gpt-tool-indicator').className = 'active';
           console.log('[Tool] 密钥已复制:', resultStr);
           
           setTimeout(() => {
               statusEl.innerText = '📋 复制密钥';
               document.getElementById('gpt-tool-indicator').className = '';
           }, 2000);
       }
   };

   // ==========================================
   // 模块 2: 团队管理面板逻辑
   // ==========================================
   const TeamPanel = {
       initialized: false,
       
       toggle() {
           if (!this.initialized) {
               this.init();
               this.initialized = true;
           }
           const panel = document.getElementById('ur-panel');
           if (panel) {
               panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
           }
       },
       
       init() {
           if (document.getElementById('ur-panel')) return;
           
           const container = document.createElement('div');
           container.id = 'ur-panel';
           document.body.appendChild(container);
           
           container.innerHTML = `
               <div id="ur-header">
                   <div id="ur-title">团队成员管理</div>
                   <button id="ur-close" title="隐藏面板">✕</button>
               </div>
               <div id="ur-controls">
                   <input type="text" id="ur-search" placeholder="搜索姓名或邮箱...">
                   <button id="ur-rename" class="ur-btn" title="修改团队名称">✎</button>
                   <button id="ur-refresh" class="ur-btn">刷新列表</button>
               </div>
               <div id="ur-team-info">当前组织: <span id="ur-team-name-disp" style="color: #fff">加载中...</span></div>
               <div id="ur-body">
                   <div class="loading-overlay" id="ur-loader">执行中...</div>
                   <div id="ur-list-container"></div>
               </div>
               <div id="ur-status">系统就绪</div>
           `;
           
           // --- 拖动逻辑 ---
           const header = container.querySelector('#ur-header');
           let isDragging = false, startX, startY, initialX, initialY;
           
           const dragStart = (e) => {
               if (e.target.id === 'ur-close' || e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
               isDragging = true;
               const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
               const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
               startX = clientX;
               startY = clientY;
               initialX = container.offsetLeft;
               initialY = container.offsetTop;
               container.style.transform = 'none';
               container.style.left = initialX + 'px';
               container.style.top = initialY + 'px';
           };
           
           const dragMove = (e) => {
               if (!isDragging) return;
               const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
               const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
               container.style.left = `${initialX + (clientX - startX)}px`;
               container.style.top = `${initialY + (clientY - startY)}px`;
           };
           
           const dragEnd = () => isDragging = false;
           
           header.addEventListener('mousedown', dragStart);
           header.addEventListener('touchstart', dragStart, { passive: false });
           document.addEventListener('mousemove', dragMove);
           document.addEventListener('touchmove', dragMove, { passive: false });
           document.addEventListener('mouseup', dragEnd);
           document.addEventListener('touchend', dragEnd);
           
           // --- 业务逻辑 ---
           this.runLogic(container);
       },
       
       async runLogic(container) {
           let session = null, allUsers = [];
           const $ = (s) => container.querySelector(s);
           const statusDiv = $('#ur-status'), loader = $('#ur-loader'), listDiv = $('#ur-list-container');
           
           const setStatus = (msg, isLoading) => {
               statusDiv.textContent = msg;
               loader.classList.toggle('active', isLoading);
               if(isLoading) loader.textContent = msg;
           };
           
           const api = {
               getSession: async () => {
                   const r = await fetch('/api/auth/session');
                   const d = await r.json();
                   if (!d.accessToken) throw new Error('未检测到登录状态');
                   return { token: d.accessToken, teamId: d.account?.id, name: d.account?.name };
               },
               fetchUsers: async () => {
                   let offset = 0, limit = 100, list = [];
                   const h = { 'Authorization': `Bearer ${session.token}`, 'chatgpt-account-id': session.teamId };
                   while(true) {
                       const r = await fetch(`/backend-api/accounts/${session.teamId}/users?offset=${offset}&limit=${limit}`, {headers: h});
                       const d = await r.json();
                       const items = d.items || d.users || [];
                       if (!items.length) break;
                       list = list.concat(items);
                       offset += items.length;
                   }
                   return list;
               },
               changeRole: (userId, newRole) => fetch(`/backend-api/accounts/${session.teamId}/users/${userId}`, {
                   method: 'PATCH',
                   headers: { ...api.headers, 'Content-Type': 'application/json'},
                   body: JSON.stringify({ role: newRole })
               }),
               removeUser: (userId) => fetch(`/backend-api/accounts/${session.teamId}/users/${userId}`, {
                   method: 'DELETE',
                   headers: api.headers
               }),
               renameTeam: (newName) => fetch(`/backend-api/accounts/${session.teamId}`, {
                   method: 'PATCH',
                   headers: { ...api.headers, 'Content-Type': 'application/json'},
                   body: JSON.stringify({ name: newName })
               })
           };
           
           const render = {
               list: (users) => {
                   listDiv.innerHTML = '';
                   if (users.length === 0) {
                       listDiv.innerHTML = '<div style="text-align:center; padding:2rem; color:#666; font-size:0.875rem;">未找到相关成员</div>';
                       return;
                   }
                   users.forEach(u => {
                       const row = document.createElement('div');
                       row.className = 'ur-user-row';
                       let role = u.role === 'owner' ? 'account-owner' : u.role;
                       row.innerHTML = `
                           <div class="ur-info">
                               <div class="ur-name">${u.name||'匿名成员'}</div>
                               <div class="ur-email">${u.email}</div>
                           </div>
                           <div class="ur-action">
                               <select class="ur-select">
                                   <option value="standard-user">普通成员</option>
                                   <option value="account-admin">管理员</option>
                                   <option value="account-owner">所有者</option>
                               </select>
                               <button class="ur-del-btn" title="移出团队">✕</button>
                           </div>`;
                       
                       const sel = row.querySelector('select');
                       sel.value = role;
                       let oldRole = role;
                       sel.onchange = async function(){
                           setStatus('正在更新权限...', true);
                           const res = await api.changeRole(u.id, this.value);
                           if(res.ok) {
                               setStatus('权限更新成功', false);
                               oldRole = this.value;
                           } else {
                               alert('更新失败，请稍后重试');
                               this.value = oldRole;
                               setStatus('就绪', false);
                           }
                       };
                       
                       row.querySelector('.ur-del-btn').onclick = async function(){
                           if(!confirm(`确定要将 [${u.email}] 移出团队吗？`)) return;
                           setStatus('正在移除成员...', true);
                           const res = await api.removeUser(u.id);
                           if(res.ok) {
                               row.remove();
                               setStatus('成员已移除', false);
                           } else {
                               alert('移除失败');
                               setStatus('就绪', false);
                           }
                       };
                       listDiv.appendChild(row);
                   });
               }
           };
           
           $('#ur-close').onclick = () => { container.style.display = 'none'; };
           
           $('#ur-refresh').onclick = async () => {
               setStatus('同步数据中...', true);
               try {
                   allUsers = await api.fetchUsers();
                   render.list(allUsers);
                   setStatus('数据已更新', false);
               } catch(e) {
                   setStatus('刷新失败', false);
               }
           };
           
           $('#ur-rename').onclick = async () => {
               const newName = prompt("请输入新的团队名称:", session.name);
               if (!newName || newName === session.name) return;
               setStatus('正在改名...', true);
               if((await api.renameTeam(newName)).ok) {
                   session.name = newName;
                   $('#ur-team-name-disp').textContent = newName;
                   setStatus('名称已修改', false);
               } else {
                   setStatus('改名失败', false);
                   alert('改名失败，可能权限不足');
               }
           };
           
           $('#ur-search').oninput = (e) => {
               const v = e.target.value.toLowerCase();
               const filtered = allUsers.filter(u=>(u.name?.toLowerCase().includes(v))||(u.email.toLowerCase().includes(v)));
               render.list(filtered);
           };
           
           try {
               setStatus('正在连接会话...', true);
               session = await api.getSession();
               api.headers = { 'Authorization': `Bearer ${session.token}`, 'chatgpt-account-id': session.teamId };
               $('#ur-team-name-disp').textContent = session.name;
               allUsers = await api.fetchUsers();
               render.list(allUsers);
               setStatus('系统就绪', false);
           } catch(e) {
               setStatus('初始化失败: ' + e.message, false);
           }
       }
   };

   // ==========================================
   // 模块 3: Team 绑卡页面生成器 (基于第二个脚本)
   // ==========================================
   const TeamPay = {
       CONFIG: {
           workspace_name: "zhizhishu",
           price_interval: "month",
           seat_quantity: 5,
           country: "US",
           currency: "USD",
           promo_campaign_id: "team-1-month-free",
           page_mode: "new"
       },
       
       API: {
           checkout: "https://chatgpt.com/backend-api/payments/checkout",
           promo_check: "https://chatgpt.com/backend-api/promo_campaign/check_coupon"
       },
       
       async getAccessToken() {
           try {
               const response = await fetch("https://chatgpt.com/api/auth/session");
               const data = await response.json();
               if (data.accessToken) {
                   return data.accessToken;
               }
               throw new Error("未找到 accessToken");
           } catch (error) {
               console.error("[TeamPay] Token 获取失败:", error);
               this.showNotification("错误", "获取 Token 失败，请确保已登录");
               return null;
           }
       },
       
       showNotification(title, text) {
           if (typeof GM_notification !== 'undefined') {
               GM_notification({ title: title, text: text, timeout: 3000 });
           } else {
               alert(`${title}: ${text}`);
           }
       },
       
       copyToClipboard(text) {
           GM_setClipboard(text);
       },
       
       extractEmailPrefix(token) {
           try {
               const parts = token.split('.');
               if (parts.length >= 2) {
                   let payload = parts[1];
                   payload = payload.replace(/-/g, '+').replace(/_/g, '/');
                   while (payload.length % 4) payload += '=';
                   const decoded = JSON.parse(atob(payload));
                   let email = decoded.email || decoded['https://api.openai.com/profile']?.email || decoded['https://api.openai.com/auth']?.email;
                   if (email && email.includes('@')) {
                       return email.split('@')[0];
                   }
               }
           } catch (e) {
               console.error("[TeamPay] 解析 Token 失败:", e);
           }
           return "MyTeam";
       },
       
       async generateCheckout(token, mode) {
           const isNewMode = mode === "new";
           const payload = {
               plan_name: "chatgptteamplan",
               team_plan_data: {
                   workspace_name: this.CONFIG.workspace_name,
                   price_interval: this.CONFIG.price_interval,
                   seat_quantity: this.CONFIG.seat_quantity
               },
               billing_details: {
                   country: this.CONFIG.country,
                   currency: this.CONFIG.currency.toUpperCase()
               },
               cancel_url: "https://chatgpt.com/#pricing",
               promo_campaign: {
                   promo_campaign_id: this.CONFIG.promo_campaign_id,
                   is_coupon_from_query_param: false
               },
               checkout_ui_mode: isNewMode ? "custom" : "redirect"
           };
           
           try {
               const response = await fetch(this.API.checkout, {
                   method: "POST",
                   headers: {
                       "Authorization": `Bearer ${token}`,
                       "Content-Type": "application/json",
                       "Accept": "application/json"
                   },
                   body: JSON.stringify(payload)
               });
               
               const data = await response.json();
               if (response.ok) {
                   if (isNewMode && data.checkout_session_id) {
                       const processor = data.processor_entity || "openai_llc";
                       const newUrl = `https://chatgpt.com/checkout/${processor}/${data.checkout_session_id}`;
                       return { success: true, mode: "new", url: newUrl, checkout_session_id: data.checkout_session_id };
                   } else if (!isNewMode && data.url) {
                       return { success: true, mode: "old", url: data.url };
                   }
               }
               console.error("[TeamPay] API 错误:", data);
               return { success: false, error: data.detail || "API 请求失败" };
           } catch (error) {
               console.error("[TeamPay] 请求异常:", error);
               return { success: false, error: error.message };
           }
       },
       
       showConfigPanel() {
           const existing = document.getElementById('team-pay-panel');
           if (existing) {
               existing.remove();
               return;
           }
           
           const panel = document.createElement('div');
           panel.id = 'team-pay-panel';
           panel.innerHTML = `
               <div id="team-pay-content">
                   <div id="team-pay-header" style="position: relative;">
                       <button id="tp-close" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: var(--ur-muted-fg); font-size: 20px; cursor: pointer; padding: 4px;">✕</button>
                       <h2>ChatGPT Team 绑卡</h2>
                       <p>1个月免费试用</p>
                   </div>
                   <div id="team-pay-body">
                       <div class="tp-form-group">
                           <label>页面样式</label>
                           <select id="tp-mode">
                               <option value="new" ${this.CONFIG.page_mode === 'new' ? 'selected' : ''}>🆕 新页面 (推荐)</option>
                               <option value="old" ${this.CONFIG.page_mode === 'old' ? 'selected' : ''}>📎 老页面</option>
                           </select>
                       </div>
                       
                       <div class="tp-info-box">
                           ✨ <strong>优惠:</strong> ${this.CONFIG.promo_campaign_id} (1个月免费)<br>
                           💰 <strong>今日应付:</strong> $0.00<br>
                           👥 <strong>座位数:</strong> ${this.CONFIG.seat_quantity} 个
                       </div>
                       
                       <button id="tp-generate" class="tp-btn primary">
                           🚀 生成绑卡链接
                       </button>
                       
                       <div id="tp-status"></div>
                   </div>
               </div>
           `;
           
           document.body.appendChild(panel);
           
           // 点击空白处关闭
           panel.addEventListener('click', (e) => {
               if (e.target === panel) panel.remove();
           });
           
           document.getElementById('tp-close').onclick = () => panel.remove();
           
           document.getElementById('tp-generate').onclick = async () => {
               const btn = document.getElementById('tp-generate');
               const statusEl = document.getElementById('tp-status');
               
               this.CONFIG.page_mode = document.getElementById('tp-mode').value;
               
               btn.disabled = true;
               btn.innerText = '⏳ 生成中...';
               statusEl.style.display = 'none';
               statusEl.className = '';
               
               try {
                   const token = await this.getAccessToken();
                   if (!token) throw new Error("获取 Token 失败");
                   
                   this.CONFIG.workspace_name = this.extractEmailPrefix(token);
                   
                   const result = await this.generateCheckout(token, this.CONFIG.page_mode);
                   
                   if (result.success) {
                       statusEl.style.display = 'block';
                       statusEl.className = 'success';
                       statusEl.innerHTML = `
                           ✅ <strong>生成成功!</strong> (${result.mode === 'new' ? '新页面' : '老页面'})<br>
                           <div style="margin-top: 8px; color: var(--ur-muted-fg); font-size: 12px;">工作区: ${this.CONFIG.workspace_name}</div>
                           <input type="text" class="tp-url-input" value="${result.url}" readonly onclick="this.select()">
                           <div class="tp-actions">
                               <button class="tp-btn" id="tp-copy">📋 复制</button>
                               <button class="tp-btn primary" id="tp-open">🔗 打开</button>
                           </div>
                       `;
                       
                       document.getElementById('tp-copy').onclick = () => {
                           this.copyToClipboard(result.url);
                           this.showNotification("成功", "链接已复制!");
                           document.getElementById('tp-copy').innerText = '✅ 已复制';
                       };
                       
                       document.getElementById('tp-open').onclick = () => {
                           window.open(result.url, '_blank');
                       };
                       
                       this.showNotification("成功", "绑卡链接已生成!");
                   } else {
                       throw new Error(result.error);
                   }
               } catch (error) {
                   statusEl.style.display = 'block';
                   statusEl.className = 'error';
                   statusEl.innerHTML = `❌ <strong>失败:</strong> ${error.message}`;
               } finally {
                   btn.disabled = false;
                   btn.innerText = '🚀 生成绑卡链接';
               }
           };
       }
   };

   // ==========================================
   // 模块 4: 悬浮按钮 UI (三按钮布局)
   // ==========================================
   function createMainButton() {
       if (document.getElementById('gpt-admin-tool-btn')) return;
       
       const btn = document.createElement('div');
       btn.id = 'gpt-admin-tool-btn';
       btn.innerHTML = `
           <div class="gpt-btn-third" id="gpt-btn-left" title="显示/隐藏团队管理面板">
               <div id="gpt-tool-indicator"></div>
               <span>管理</span>
           </div>
           <div class="gpt-btn-divider"></div>
           <div class="gpt-btn-third" id="gpt-btn-middle" title="一键复制密钥">
               <span>密钥</span>
           </div>
           <div class="gpt-btn-divider"></div>
           <div class="gpt-btn-third" id="gpt-btn-right" title="生成 Team 绑卡页面">
               <span>绑卡</span>
           </div>
       `;
       
       document.body.appendChild(btn);
       
       // 左键：团队管理面板
       document.getElementById('gpt-btn-left').addEventListener('click', (e) => {
           e.preventDefault();
           e.stopPropagation();
           TeamPanel.toggle();
       });
       
       // 中键：复制密钥
       document.getElementById('gpt-btn-middle').addEventListener('click', async (e) => {
           e.preventDefault();
           e.stopPropagation();
           const textEl = e.currentTarget.querySelector('span');
           const originalText = textEl.innerText;
           await KeyGrabber.execute(textEl);
           setTimeout(() => { textEl.innerText = originalText; }, 2000);
       });
       
       // 右键：绑卡生成器
       document.getElementById('gpt-btn-right').addEventListener('click', (e) => {
           e.preventDefault();
           e.stopPropagation();
           TeamPay.showConfigPanel();
       });
   }

   // ==========================================
   // 初始化
   // ==========================================
   if (document.readyState === 'complete') {
       createMainButton();
   } else {
       window.addEventListener('load', createMainButton);
   }
   
   console.log('[GPT Admin Tool] 已加载: 团队管理 + 密钥获取 + 绑卡生成');
})();
