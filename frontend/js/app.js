// =====================================================
// 日常生活记录系统 - Vue 3 应用
// =====================================================

const { createApp, ref, reactive, computed, watch, onMounted, nextTick } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

function showToast(message, type) {
    const el = document.createElement("div");
    el.className = "toast toast-" + type;
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}

const LoginView = {
    template: `
        <div class="login-page">
            <div class="login-card">
                <h1>📝 日常生活记录</h1>
                <p class="subtitle">记录每一天的点点滴滴</p>
                <div class="tab-bar">
                    <button :class="{ active: tab === 'login' }" @click="tab='login'">登录</button>
                    <button :class="{ active: tab === 'register' }" @click="tab='register'">注册</button>
                </div>
                <form v-if="tab==='login'" @submit.prevent="doLogin">
                    <div class="form-group"><label>用户名</label><input class="form-control" v-model="loginForm.username" placeholder="请输入用户名" required></div>
                    <div class="form-group"><label>密码</label><input class="form-control" type="password" v-model="loginForm.password" placeholder="请输入密码" required></div>
                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
                </form>
                <form v-else @submit.prevent="doRegister">
                    <div class="form-group"><label>用户名</label><input class="form-control" v-model="regForm.username" placeholder="3-50个字符" required minlength="3"></div>
                    <div class="form-group"><label>昵称</label><input class="form-control" v-model="regForm.nickname" placeholder="请输入昵称" required></div>
                    <div class="form-group"><label>密码</label><input class="form-control" type="password" v-model="regForm.password" placeholder="不少于6位" required minlength="6"></div>
                    <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? '注册中...' : '注册' }}</button>
                </form>
            </div>
        
                <h3>☀️ 主人早上好!</h3>
                <p style="color:rgba(255,255,255,0.85);font-size:14px;margin-bottom:16px;">{{ unfinishedTasks.length > 0 ? '你还有 '+unfinishedTasks.length+' 件事没完成哦' : '今天所有任务都完成啦🎉' }}</p>\n                <ul v-if="unfinishedTasks.length"><li v-for="t in unfinishedTasks" :key="t.id">📌 {{ t.title }}</li></ul>
                <button class="btn" @click="dismissPopup">✅ 好的，去完成!</button>
            </div>
        </div>
    `,
    data() { return { tab: "login", loading: false, loginForm: { username: "", password: "" }, regForm: { username: "", password: "", nickname: "" } }; },
    computed: { renderedContent() { if(!this.form.content)return"<p style=\"color:var(--gray-400);\">暂无内容</p>";var c=this.form.content;c=c.replace(/\n/g,"<br>");c=c.replace(/\s{2}/g,"&nbsp;&nbsp;");return c; } }, methods: {
        async doLogin() { this.loading = true; try { const d = await api.login(this.loginForm); localStorage.setItem("token", d.token); localStorage.setItem("user", JSON.stringify(d.user)); this.$router.push("/home"); } catch(e) { showToast(e.message, "error"); } finally { this.loading = false; } },
        async doRegister() { this.loading = true; try { await api.register(this.regForm); showToast("注册成功，请登录", "success"); this.tab = "login"; this.loginForm.username = this.regForm.username; this.regForm = { username: "", password: "", nickname: "" }; } catch(e) { showToast(e.message, "error"); } finally { this.loading = false; } }
    }
};

const MainLayout = {
    template: `
        <div class="app-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">📝 日常记录</div>
                <nav class="sidebar-nav">
                    <router-link to="/home" active-class="active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> 文档列表</router-link>
                    <router-link to="/edit" active-class="active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5l-7 7v4h4l7-7"/><path d="M14 3l4 4"/></svg> 写文档</router-link>
                    <router-link to="/categories" active-class="active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v4H4z"/><path d="M4 12h16"/><path d="M4 16h16"/></svg> 分类管理</router-link>
                    <router-link to="/profile" active-class="active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-7 8-7s8 3 8 7"/></svg> 个人中心</router-link>
                </nav>
                <div class="sidebar-footer">日常生活记录系统 v1.0</div>
            </aside>
            <div class="main-content">
                <header class="topbar">
                    <h2 class="topbar-title">{{ pageTitle }}</h2>
                    <div class="topbar-right">
                        <span class="topbar-user">{{ user.nickname || user.username }}</span>
                        <button class="btn btn-outline btn-sm" @click="logout">退出</button>
                    </div>
                </header>
                <main class="content-area"><router-view /></main>
            </div>
        </div>
    
<!-- Daily Popup -->
        <div v-if="showDailyPopup" class="daily-popup-overlay" @click.self="dismissPopup">
            <div class="daily-popup">
                <div class="popup-animal">{{ dailyAnimal }}</div>`,
    data() { return { user: JSON.parse(localStorage.getItem("user") || "{}"), showDailyPopup: false, unfinishedTasks: [], dailyAnimal: "" }; },
    computed: { pageTitle() { const map = { "/home": "文档列表", "/edit": "写文档", "/categories": "分类管理", "/profile": "个人中心" }; return map[this.$route.path] || "日常生活记录"; } },
    methods: { logout() { localStorage.removeItem("token"); localStorage.removeItem("user"); this.$router.push("/login"); }, checkUnfinishedTasks() { var l=localStorage.getItem("dailyCheck");var t=new Date().toDateString();if(!localStorage.getItem("token")||l===t)return;var self=this;api.listDocuments({page:1,size:50,status:0}).then(function(r){var tasks=r.records||[];self.unfinishedTasks=tasks;var animals=["🐱","🐶","🐰","🐼","🦊","🐨","🐯","🦁"];self.dailyAnimal=animals[Math.floor(Math.random()*animals.length)];if(tasks.length>0){self.showDailyPopup=true;}}).catch(function(){}) }, dismissPopup() { this.showDailyPopup=false;localStorage.setItem("dailyCheck",new Date().toDateString()); } },
    mounted() { this.checkUnfinishedTasks(); },
    watch: { "$route": { handler() { this.user = JSON.parse(localStorage.getItem("user") || "{}"); this.checkUnfinishedTasks(); }, immediate: true } }
};

const HomeView = {
    template: `
        <div>
            <div class="toolbar">
                <div class="search-box"><input v-model="searchKeyword" placeholder="搜索文档标题..." @keyup.enter="doSearch"><button class="search-btn" @click="doSearch">🔍</button></div>
                <select class="form-control" style="width:auto;" v-model="filterCategory" @change="loadDocuments"><option value="">全部分类</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select>
                <select class="form-control" style="width:auto;" v-model="filterStatus" @change="loadDocuments"><option value="">全部状态</option><option value="0">未完成</option><option value="1">已完成</option></select>
                <router-link to="/edit" class="btn btn-primary">+ 新建文档</router-link>
                <button class="btn btn-danger btn-sm" v-if="selectedIds.length" @click="batchDelete">删除选中 ({{ selectedIds.length }})</button>
            </div>
            <div class="card">
                <div class="table-wrapper" v-if="documents.length">
                    <table><thead><tr><th class="checkbox-cell"><input type="checkbox" @change="toggleAll" :checked="allSelected"></th><th style="width:40%;">标题</th><th>分类</th><th>状态</th><th>更新时间</th><th style="width:120px;">操作</th></tr></thead><tbody>
                        <tr v-for="doc in documents" :key="doc.id"><td><input type="checkbox" :value="doc.id" v-model="selectedIds"></td><td><router-link :to="'/edit/' + doc.id">{{ doc.title }}</router-link></td><td>{{ getCategoryName(doc.categoryId) }}</td><td><span :class="doc.status === 1 ? 'badge badge-success' : 'badge badge-warning'">{{ doc.status === 1 ? '已完成' : '未完成' }}</span></td><td style="font-size:13px;color:var(--gray-500);">{{ formatDate(doc.updateTime || doc.createTime) }}</td><td><router-link :to="'/edit/' + doc.id" class="btn btn-outline btn-xs">编辑</router-link> <button class="btn btn-danger btn-xs" @click="deleteDoc(doc.id)" style="margin-left:4px;">删除</button></td></tr>
                    </tbody></table>
                </div>
                <div v-else class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 2v6h6"/></svg><h3>暂无文档</h3><p>点击上方“新建文档”开始记录</p></div>
            </div>
            <div class="pagination" v-if="totalPages > 1"><button :disabled="currentPage <= 1" @click="goPage(currentPage-1)">上一页</button><button v-for="p in pageNumbers" :key="p" :class="{active: p === currentPage}" @click="goPage(p)">{{ p }}</button><button :disabled="currentPage >= totalPages" @click="goPage(currentPage+1)">下一页</button><span style="margin-left:12px;font-size:13px;color:var(--gray-400);">共 {{ total }} 条</span></div>
        </div>
    `,
    data() { return { documents: [], categories: [], searchKeyword: "", filterCategory: "", filterStatus: "", currentPage: 1, pageSize: 10, total: 0, selectedIds: [] }; },
    computed: { totalPages() { return Math.ceil(this.total / this.pageSize) || 1; }, allSelected() { return this.documents.length > 0 && this.documents.every(d => this.selectedIds.includes(d.id)); }, pageNumbers() { const pages=[];const t=this.totalPages;const c=this.currentPage;let s=Math.max(1,c-2);let e=Math.min(t,c+2);if(e-s<4){if(s===1)e=Math.min(t,s+4);else s=Math.max(1,e-4);}for(let i=s;i<=e;i++)pages.push(i);return pages; } },
    methods: {
        async loadDocuments() { try { const params={page:this.currentPage,size:this.pageSize};if(this.filterCategory)params.categoryId=this.filterCategory;if(this.filterStatus!=="")params.status=this.filterStatus;const r=await api.listDocuments(params);this.documents=r.records||[];this.total=r.total||0;this.selectedIds=[];}catch(e){showToast(e.message,"error");} },
        async loadCategories() { try { this.categories=await api.listCategories();}catch(e){} },
        getCategoryName(id) { const c=this.categories.find(c=>c.id===id);return c?c.name:"未分类"; },
        formatDate(d) { return d?d.substring(0,16).replace("T"," "):""; },
        toggleAll() { this.allSelected?this.selectedIds=[]:this.selectedIds=this.documents.map(d=>d.id); },
        async doSearch() { this.currentPage=1;if(this.searchKeyword.trim()){try{const r=await api.searchDocuments({keyword:this.searchKeyword.trim(),page:this.currentPage,size:this.pageSize});this.documents=r.records||[];this.total=r.total||0;}catch(e){showToast(e.message,"error");}}else{this.loadDocuments();} },
        goPage(p) { this.currentPage=p;this.loadDocuments(); },
        async deleteDoc(id) { if(!confirm("确定删除该文档吗？"))return;await api.deleteDocument(id);showToast("删除成功","success");this.loadDocuments(); },
        async batchDelete() { if(!confirm("确定删除选中的"+this.selectedIds.length+"篇文档吗？"))return;await api.batchDelete({ids:this.selectedIds});showToast("批量删除成功","success");this.loadDocuments(); }
    },
    mounted() { this.loadCategories();this.loadDocuments(); },
    watch: { "$route": "loadDocuments" }
};

const EditView = {
    template: `
        <div class="card" style="max-width:800px;">
            <div class="card-header"><h3>{{ isEdit ? '编辑文档' : '新建文档' }}</h3></div>
            <div class="card-body">
                <form @submit.prevent="save">
                    <div class="form-group"><label>标题</label><input class="form-control" v-model="form.title" placeholder="请输入文档标题" required></div>
                    <div class="form-group"><label>分类</label><select class="form-control" v-model="form.categoryId"><option value="">请选择分类</option><option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option></select></div>
                    <div class="form-group"><label>状态</label><select class="form-control" v-model.number="form.status"><option :value="0">未完成</option><option :value="1">已完成</option></select></div>
                    <div class="form-group"><label>内容</label><div style="display:flex;gap:4px;margin-bottom:4px;">
                        <button type="button" class="btn btn-outline btn-xs" @click="$refs.imgInput.click()">🖼 插入图片</button>
                        <span style="font-size:12px;color:var(--gray-400);line-height:28px;">（先保存文档再插入图片）</span>
                    </div>
                    <input type="file" ref="imgInput" accept="image/*" style="display:none" @change="insertImage">
                    <textarea ref="contentArea" class="form-control" v-model="form.content" rows="12" placeholder="在这里写内容..." v-show="!previewMode"></textarea><div v-show="previewMode" class="card" style="padding:16px;min-height:200px;background:#fff;border:1px solid var(--gray-200);border-radius:8px;line-height:1.8;" v-html="renderedContent"></div></div>
                    <div style="display:flex;gap:8px;"><button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? '保存中...' : '保存' }}</button><button type="button" class="btn btn-outline" @click="previewMode=!previewMode">{{ previewMode ? '✏️ 编辑' : '👁️ 预览' }}</button><router-link to="/home" class="btn btn-outline">取消</router-link></div>
                </form>
                <div v-if="docId" style="margin-top:28px;border-top:1px solid var(--gray-200);padding-top:24px;">
                    <h4 style="font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:6px;">📎 附件 ({{ attachments.length }})</h4>
                    <div class="upload-zone" @dragover.prevent @drop.prevent="onDrop">
                        <input type="file" ref="fileInput" multiple style="display:none" @change="onFileSelected">
                        <input type="file" ref="folderInput" multiple webkitdirectory style="display:none" @change="onFolderSelected">
                        <div style="text-align:center;padding:20px;">
                            <div style="font-size:32px;margin-bottom:8px;">📁</div>
                            <p style="font-size:14px;color:var(--gray-500);margin-bottom:12px;">拖拽文件到此处，或点击下方按钮上传</p>
                            <div style="display:flex;gap:8px;justify-content:center;">
                                <button type="button" class="btn btn-outline btn-sm" @click="$refs.fileInput.click()">选择文件</button>
                                <button type="button" class="btn btn-outline btn-sm" @click="$refs.folderInput.click()">选择文件夹</button>
                            </div>
                        </div>
                    </div>
                    <div v-if="uploading" style="text-align:center;padding:12px;color:var(--gray-400);font-size:13px;">正在上传...</div>
                    <div v-if="attachments.length" class="attachment-grid">
                        <div v-for="att in attachments" :key="att.id" class="attachment-item">
                            <div v-if="att.isImage" class="attachment-thumb"><img :src="'api/file/preview/'+att.id" :alt="att.originalName" @click="previewImage(att)" style="cursor:pointer;"></div>
                            <div v-else class="attachment-icon">📄</div>
                            <div class="file-info"><div class="file-name" :title="att.originalName">{{ att.originalName }}</div><div class="file-meta">{{ formatFileSize(att.fileSize) }}</div></div>
                            <button class="btn btn-danger btn-xs" @click="deleteAttachment(att.id)" style="flex-shrink:0;" title="删除">🗑️</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="previewUrl" class="modal-overlay" @click.self="previewUrl=null"><div style="max-width:90vw;max-height:90vh;"><img :src="previewUrl" style="max-width:90vw;max-height:85vh;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.3);"><div style="text-align:center;margin-top:8px;"><button class="btn btn-outline btn-sm" @click="previewUrl=null">关闭</button></div></div></div>
    `,
    data() { return { form: { title: "", content: "", categoryId: "", status: 0 }, categories: [], isEdit: false, saving: false, docId: null, attachments: [], uploading: false, previewUrl: null, previewMode: false }; },
    methods: {
        async loadCategories() { try{this.categories=await api.listCategories();}catch(e){showToast(e.message,"error");} },
        async loadDocument() { if(!this.docId)return;try{const doc=await api.getDocumentDetail(this.docId);if(doc){this.form={title:doc.title,content:doc.content||"",categoryId:doc.categoryId||"",status:doc.status};}await this.loadAttachments();}catch(e){showToast(e.message,"error");this.$router.push("/home");} },
        async loadAttachments() { try{this.attachments=await api.getFiles(this.docId);}catch(e){} },
        async save() { if(!this.form.title.trim()){showToast("请输入文档标题","error");return;}this.saving=true;try{const data={title:this.form.title,content:this.form.content,categoryId:this.form.categoryId||(this.categories.length>0?this.categories[0].id:null),status:this.form.status};if(this.isEdit){data.id=this.docId;await api.updateDocument(data);showToast("更新成功","success");}else{const d=await api.addDocument(data);this.isEdit=true;this.docId=d.id;showToast("创建成功，可以上传附件了","success");}}catch(e){showToast(e.message,"error");}finally{this.saving=false;} },
        async uploadFiles(files) { if(!files||files.length===0)return;this.uploading=true;try{await api.uploadMultipleFiles(Array.from(files),this.docId);showToast("上传成功 "+files.length+" 个文件","success");await this.loadAttachments();}catch(e){showToast(e.message,"error");}finally{this.uploading=false;} },
        onFileSelected(e) { if(e.target.files.length){this.uploadFiles(e.target.files);e.target.value="";} },
        onFolderSelected(e) { if(e.target.files.length){this.uploadFiles(e.target.files);e.target.value="";} },
        onDrop(e) { const items=e.dataTransfer.items||[];const files=[];for(const item of items){if(item.webkitGetAsEntry){this.traverseFileTree(item.webkitGetAsEntry(),files);}else if(item.getAsFile){const f=item.getAsFile();if(f)files.push(f);}}if(files.length)this.uploadFiles(files); },
        traverseFileTree(entry,files) { if(entry.isFile){entry.file(f=>files.push(f));}else if(entry.isDirectory){const reader=entry.createReader();reader.readEntries(entries=>{for(const e of entries)this.traverseFileTree(e,files);});} },
        async deleteAttachment(id) { if(!confirm("确定删除此附件吗？"))return;await api.deleteFile(id);showToast("删除成功","success");await this.loadAttachments(); },
        previewImage(att) { this.previewUrl="api/file/preview/"+att.id; },
        formatFileSize(bytes) { if(!bytes)return"";const units=["B","KB","MB","GB"];let i=0;let s=bytes;while(s>=1024&&i<units.length-1){s/=1024;i++;}return s.toFixed(1)+" "+units[i]; }
    },
    mounted() { this.loadCategories();if(this.$route.params.id){this.isEdit=true;this.docId=parseInt(this.$route.params.id);this.loadDocument();} }
};

const CategoriesView = {
    template: `
        <div>
            <div class="card" style="margin-bottom:20px;"><div class="card-header"><h3>添加分类</h3></div><div class="card-body"><form @submit.prevent="addCategory" style="display:flex;gap:8px;"><input class="form-control" v-model="newName" placeholder="输入分类名称" required style="max-width:300px;"><button type="submit" class="btn btn-primary" :disabled="adding">{{ adding ? '添加中...' : '添加' }}</button></form></div></div>
            <div class="card"><div class="card-header"><h3>分类列表</h3></div><div class="card-body">
                <div v-if="categories.length" class="category-list">
                    <div v-for="c in categories" :key="c.id" class="category-tag" style="padding:8px 16px;border-radius:8px;background:var(--gray-50);border:1px solid var(--gray-200);width:100%;display:flex;align-items:center;justify-content:space-between;">
                        <div style="display:flex;align-items:center;gap:8px;flex:1;"><span v-if="editingId===c.id" style="flex:1;"><input class="form-control" v-model="editName" @keyup.enter="updateCategory(c)" style="width:200px;display:inline-block;padding:4px 8px;font-size:13px;"></span><span v-else>{{ c.name }}</span><span style="font-size:12px;color:var(--gray-400);">ID: {{ c.id }}</span></div>
                        <div style="display:flex;gap:4px;flex-shrink:0;">
                            <template v-if="editingId===c.id"><button class="btn btn-success btn-xs" @click="updateCategory(c)">保存</button><button class="btn btn-outline btn-xs" @click="editingId=null">取消</button></template>
                            <template v-else><button class="btn btn-outline btn-xs" @click="startEdit(c)">✏️</button><button class="btn btn-danger btn-xs" @click="deleteCategory(c.id)">🗑️</button></template>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-state" style="padding:30px;"><h3>暂无分类</h3><p>添加你的第一个分类吧</p></div>
            </div></div>
        </div>
    `,
    data() { return { categories:[],newName:"",editingId:null,editName:"",adding:false }; },
    methods: {
        async loadCategories(){try{this.categories=await api.listCategories();}catch(e){showToast(e.message,"error");}},
        async addCategory(){this.adding=true;try{await api.addCategory({name:this.newName.trim()});showToast("添加成功","success");this.newName="";this.loadCategories();}catch(e){showToast(e.message,"error");}finally{this.adding=false;}},
        startEdit(c){this.editingId=c.id;this.editName=c.name;},
        async updateCategory(c){if(!this.editName.trim()){showToast("名称不能为空","error");return;}try{await api.updateCategory({id:c.id,name:this.editName.trim()});showToast("更新成功","success");this.editingId=null;this.loadCategories();}catch(e){showToast(e.message,"error");}},
        async deleteCategory(id){if(!confirm("确定删除该分类吗？"))return;try{await api.deleteCategory(id);showToast("删除成功","success");this.loadCategories();}catch(e){showToast(e.message,"error");}}
    },
    mounted(){this.loadCategories();}
};

const ProfileView = {
    template: `
        <div class="card" style="max-width:500px;">
            <div class="card-header"><h3>个人中心</h3></div>
            <div class="card-body" style="text-align:center;">
                <div class="profile-avatar" style="margin:0 auto 16px;">{{ (user.nickname||user.username||'?')[0] }}</div>
                <h3 style="margin-bottom:4px;">{{ user.nickname||user.username }}</h3>
                <p style="font-size:13px;color:var(--gray-400);margin-bottom:24px;">@{{ user.username }}</p>
                <form @submit.prevent="saveProfile" style="text-align:left;max-width:360px;margin:0 auto;">
                    <div class="form-group"><label>昵称</label><input class="form-control" v-model="form.nickname" placeholder="请输入昵称"></div>
                    <div class="form-group"><label>原密码（不修改请留空）</label><input class="form-control" type="password" v-model="form.oldPassword" placeholder="输入原密码"></div>
                    <div class="form-group"><label>新密码</label><input class="form-control" type="password" v-model="form.newPassword" placeholder="输入新密码（不少于6位）"></div>
                    <button type="submit" class="btn btn-primary" style="width:100%;" :disabled="saving">{{ saving ? '保存中...' : '保存修改' }}</button>
                </form>
            </div>
        </div>
    `,
    data(){return{user:JSON.parse(localStorage.getItem("user")||"{}"),form:{nickname:"",oldPassword:"",newPassword:""},saving:false};},
    methods:{
        async saveProfile(){this.saving=true;try{const data={};if(this.form.nickname.trim())data.nickname=this.form.nickname.trim();if(this.form.oldPassword&&this.form.newPassword){if(this.form.newPassword.length<6){showToast("新密码不少于6位","error");this.saving=false;return;}data.oldPassword=this.form.oldPassword;data.newPassword=this.form.newPassword;}const u=await api.updateUser(data);localStorage.setItem("user",JSON.stringify(u));this.user=u;showToast("修改成功","success");this.form={nickname:"",oldPassword:"",newPassword:""};}catch(e){showToast(e.message,"error");}finally{this.saving=false;}}
    }
};

const routes=[
    {path:"/",redirect:"/login"},
    {path:"/login",component:LoginView},
    {path:"",component:MainLayout,children:[
        {path:"/home",component:HomeView},
        {path:"/edit",component:EditView},
        {path:"/edit/:id",component:EditView},
        {path:"/categories",component:CategoriesView},
        {path:"/profile",component:ProfileView}
    ]}
];
const router=createRouter({history:createWebHashHistory(),routes});
router.beforeEach((to,from,next)=>{const t=localStorage.getItem("token");if(t&&to.path==="/login")next("/home");else if(!t&&to.path!=="/login")next("/login");else next();});
const app=createApp({setup(){const loading=ref(true);onMounted(()=>{loading.value=false;});return{loading};}});
app.use(router);
app.mount("#app");
