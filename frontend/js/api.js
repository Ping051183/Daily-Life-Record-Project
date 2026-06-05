const API_BASE = "";

const api = {
    request(method, url, data) {
        const headers = { "Content-Type": "application/json" };
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = "Bearer " + token;

        const config = { method, headers };
        if (data && method !== "GET") config.body = JSON.stringify(data);

        return fetch(API_BASE + url, config).then(async res => {
            const json = await res.json();
            if (json.code === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.hash = "#/login";
                throw new Error(json.message);
            }
            if (json.code !== 200) throw new Error(json.message);
            return json.data;
        });
    },

    // ---- User ----
    register(data) { return this.request("POST", "/api/user/register", data); },
    login(data) { return this.request("POST", "/api/user/login", data); },
    getUserInfo() { return this.request("GET", "/api/user/info"); },
    updateUser(data) { return this.request("PUT", "/api/user/update", data); },

    // ---- Category ----
    addCategory(data) { return this.request("POST", "/api/category/add", data); },
    listCategories() { return this.request("GET", "/api/category/list"); },
    updateCategory(data) { return this.request("PUT", "/api/category/update", data); },
    deleteCategory(id) { return this.request("DELETE", "/api/category/delete/" + id); },

    // ---- Document ----
    addDocument(data) { return this.request("POST", "/api/document/add", data); },
    listDocuments(params) {
        const q = new URLSearchParams(params || {});
        return this.request("GET", "/api/document/list?" + q.toString());
    },
    getDocumentDetail(id) { return this.request("GET", "/api/document/detail/" + id); },
    updateDocument(data) { return this.request("PUT", "/api/document/update", data); },
    deleteDocument(id) { return this.request("DELETE", "/api/document/delete/" + id); },
    batchDelete(data) { return this.request("POST", "/api/document/batchDelete", data); },
    searchDocuments(params) {
        const q = new URLSearchParams(params || {});
        return this.request("GET", "/api/document/search?" + q.toString());
    },

    // ---- File Upload ----
    uploadFile(file, documentId) {
        return this.uploadFormData("/api/file/upload", file, documentId);
    },
    uploadMultipleFiles(files, documentId) {
        return this.uploadFormData("/api/file/uploadMultiple", files, documentId);
    },
    getFiles(documentId) { return this.request("GET", "/api/file/list/" + documentId); },
    deleteFile(id) { return this.request("DELETE", "/api/file/delete/" + id); },
    getFileInfo(id) { return this.request("GET", "/api/file/info/" + id); },

    uploadFormData(url, filesOrFile, documentId) {
        const token = localStorage.getItem("token");
        const headers = {};
        if (token) headers["Authorization"] = "Bearer " + token;
        // 不设置 Content-Type，让浏览器自动设置 multipart boundary

        const formData = new FormData();
        if (Array.isArray(filesOrFile)) {
            for (const f of filesOrFile) formData.append("files", f);
        } else {
            formData.append("file", filesOrFile);
        }
        if (documentId) formData.append("documentId", documentId);

        return fetch(API_BASE + url, { method: "POST", headers, body: formData })
            .then(async res => {
                const json = await res.json();
                if (json.code === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.hash = "#/login";
                    throw new Error(json.message);
                }
                if (json.code !== 200) throw new Error(json.message);
                return json.data;
            });
    }
};