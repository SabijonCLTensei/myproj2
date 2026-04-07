import * as api from './api.js';

let currentUser = JSON.parse(localStorage.getItem('user')) || null;
let viewingUser = null; // For admin impersonation
let editingId = null;
let editingUserId = null;
let currentNoteId = null;

window.toggleSidebar = function() {
    const sidebar = document.getElementById("mainSidebar");
    const mainContent = document.querySelector(".main-content");
    sidebar.classList.toggle("collapsed");
    if (sidebar.classList.contains("collapsed")) {
        mainContent.style.marginLeft = "0";
    } else {
        mainContent.style.marginLeft = "260px";
    }
}

// --- Drag Logic ---
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

window.onload = async () => {
    if (currentUser) {
        showApp();
    }
    setupDraggable();
};

function setupDraggable() {
    const dragHandle = document.getElementById("sidebarDragHandle");
    const sidebar = document.getElementById("mainSidebar");

    if (!dragHandle) return;

    dragHandle.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === dragHandle || dragHandle.contains(e.target)) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            setTranslate(currentX, currentY, sidebar);
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragEnd(e) {
        // Snap back to original position if dragged within 50px of origin
        if (Math.abs(xOffset) < 50 && Math.abs(yOffset) < 50) {
            xOffset = 0;
            yOffset = 0;
            currentX = 0;
            currentY = 0;
            sidebar.style.transform = "none";
        }

        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }
}

// --- Auth Functions ---
window.toggleAuthMode = function() {
    const isLogin = document.getElementById("loginFields").style.display !== "none";
    document.getElementById("loginFields").style.display = isLogin ? "none" : "block";
    document.getElementById("signupFields").style.display = isLogin ? "block" : "none";
    document.getElementById("authTitle").textContent = isLogin ? "Create Professional Account" : "Login to Professional Notes";
    document.getElementById("authToggle").textContent = isLogin ? "Already have an account? Login" : "Don't have an account? Sign Up";
}

window.register = async function() {
    const username = document.getElementById("regUsername").value;
    const email = document.getElementById("regEmail").value;
    const full_name = document.getElementById("regFullName").value;
    const password = document.getElementById("regPass").value;

    if (!username || !email || !password) return alert("Please fill required fields");

    const res = await api.register({ username, email, full_name, password });
    if (res.error) {
        alert(res.error);
    } else {
        alert("Account created! You can now login.");
        window.toggleAuthMode();
    }
}

window.login = async function() {
    const loginVal = document.getElementById("loginInput").value;
    const passVal = document.getElementById("passInput").value;
    
    if (!loginVal || !passVal) return alert("Please fill credentials");
    
    const res = await api.login({ login: loginVal, password: passVal });
    if (res.error) {
        alert(res.error);
    } else {
        currentUser = res;
        localStorage.setItem('user', JSON.stringify(res));
        showApp();
    }
}

window.logout = function() {
    localStorage.removeItem('user');
    currentUser = null;
    viewingUser = null;
    document.getElementById("loginScreen").style.display = "block";
    document.getElementById("appContent").style.display = "none";
    document.getElementById("adminViewingBanner").style.display = "none";
}

function showApp() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("appContent").style.display = "flex";
    document.getElementById("userInfo").textContent = `Logged in as: ${currentUser.username}`;
    
    if (currentUser.username === 'yettie') {
        document.getElementById("converterLink").style.display = "block";
        showAdminDashboard();
    } else {
        document.getElementById("converterLink").style.display = "none";
        loadCategories();
        refreshNotes();
    }
}

// --- Admin Functions ---
window.showAdminDashboard = async function() {
    hideAllSections();
    document.getElementById("adminSection").style.display = "block";
    const userList = document.getElementById("userList");
    userList.innerHTML = "Loading users...";
    
    const users = await api.getAllUsers();
    userList.innerHTML = users.map(u => `
        <div class="user-card-compact">
            <h3>${u.username} <small>(ID: ${u.user_id})</small></h3>
            <p><strong>Name:</strong> ${u.full_name || 'N/A'}</p>
            <p><strong>Email:</strong> ${u.email}</p>
            <p style="word-break: break-all;"><strong>Pass:</strong> <code style="background:rgba(214,51,132,0.1); padding:2px 4px; border-radius:4px; font-size:11px; color:#d63384; cursor:pointer;" title="Click to copy" onclick="navigator.clipboard.writeText('${u.password}'); alert('Copied to clipboard');">${u.password}</code></p>
            <p><small><strong>Reg:</strong> ${new Date(u.date_registered).toLocaleDateString()}</small></p>
            <div class="actions">
                <button onclick='impersonateUser(${JSON.stringify(u)})' class="btn-small btn-primary-small">View</button>
                <button onclick='editUser(${JSON.stringify(u)})' class="btn-small btn-warn-small">Edit</button>
                <button onclick='adminDeleteUser(${u.user_id})' class="btn-small btn-danger-small">Del</button>
            </div>
        </div>
    `).join('');
}

window.showConverter = function() {
    hideAllSections();
    document.getElementById("converterSection").style.display = "block";
}

window.convertPass = async function() {
    const input = document.getElementById("encryptInput").value.trim();
    if (!input) return alert("Please paste an encrypted password");
    
    const res = await api.revertPassword(input);
    if (res.error) {
        alert(res.error);
    } else {
        document.getElementById("convertResult").style.display = "block";
        document.getElementById("originalPass").textContent = res.original;
    }
}

window.editUser = function(user) {
    editingUserId = user.user_id;
    document.getElementById("editUsername").value = user.username;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editFullName").value = user.full_name;
    document.getElementById("editPassword").value = "";
    openModal('userEditModal');
}

window.saveUserEdit = async function() {
    const userData = {
        username: document.getElementById("editUsername").value,
        email: document.getElementById("editEmail").value,
        full_name: document.getElementById("editFullName").value,
    };
    const password = document.getElementById("editPassword").value;
    if (password) userData.password = password;

    const res = await api.updateUser(editingUserId, userData);
    if (res.error) alert(res.error);
    else {
        alert("User updated!");
        closeModal('userEditModal');
        showAdminDashboard();
    }
}

window.adminDeleteUser = async function(userId) {
    if (confirm("Are you sure you want to delete this user? All their notes and data will be lost.")) {
        const res = await api.deleteUser(userId);
        if (res.error) alert(res.error);
        else {
            alert("User deleted!");
            showAdminDashboard();
        }
    }
}

window.impersonateUser = function(user) {
    viewingUser = user;
    document.getElementById("adminViewingBanner").style.display = "block";
    document.getElementById("viewingUserName").textContent = `${user.username} (${user.email})`;
    goBack(); 
}

window.exitImpersonation = function() {
    viewingUser = null;
    document.getElementById("adminViewingBanner").style.display = "none";
    showAdminDashboard();
}

// --- Note Functions ---
window.toggleMenu = function() {
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "block" ? "none" : "block";
}

window.toggleDarkMode = function() { 
    document.body.classList.toggle("dark");
}

window.goBack = function() {
    hideAllSections();
    if (currentUser.username === 'yettie' && !viewingUser) {
        showAdminDashboard();
    } else {
        document.getElementById("mainScreen").style.display = "block";
        refreshNotes();
    }
}

window.showArchive = function() {
    hideAllSections();
    document.getElementById("archiveSection").style.display = "block";
    refreshNotes();
}

window.showCategories = function() {
    hideAllSections();
    document.getElementById("categorySection").style.display = "block";
    loadCategories();
}

window.showHistory = async function() {
    hideAllSections();
    document.getElementById("historySection").style.display = "block";
    const list = document.getElementById("historyList");
    list.innerHTML = "Loading history...";
    const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
    const logs = await api.getHistory(targetId);
    list.innerHTML = logs.map(l => `
        <div class="history-item">
            <strong>${l.action}</strong> - ${l.details} <br>
            <small>${new Date(l.created_at).toLocaleString()}</small>
        </div>
    `).join('') || "No history found.";
}

window.showHelp = async function() {
    hideAllSections();
    document.getElementById("helpSection").style.display = "block";
    const res = await api.getHelp();
    document.getElementById("helpTitle").textContent = res.title;
    document.getElementById("helpContent").innerHTML = res.sections.map(s => `
        <div class="help-box">
            <h3>${s.topic}</h3>
            <p>${s.content}</p>
        </div>
    `).join('');
}

window.syncWithGmail = async function() {
    if (!currentUser.email || currentUser.email === 'admin@dev.local') {
        return alert("Please update your profile with gammaalpha171@gmail.com to sync.");
    }
    
    alert("Gmail Sync Started... This may take a few seconds.");
    const res = await api.syncGmail(currentUser.user_id, currentUser.email);
    if (res.error) alert(res.error);
    else {
        alert(res.message);
        refreshNotes();
    }
}

function hideAllSections() {
    const sections = ["mainScreen", "archiveSection", "categorySection", "historySection", "categoryNotes", "helpSection", "adminSection", "converterSection"];
    sections.forEach(s => {
        const el = document.getElementById(s);
        if (el) el.style.display = "none";
    });
}

window.searchNotes = async function() {
    const term = document.getElementById("searchInput").value;
    const by = document.getElementById("searchBy").value;
    refreshNotes(term, by);
}

window.openEditor = async function(id = null) {
    editingId = id;
    document.getElementById("editorScreen").classList.add("active");
    if (id) {
        const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
        const all = await api.getNotes(targetId);
        const note = all.find(n => n.note_id === id);
        document.getElementById("noteTitle").value = note.title;
        document.getElementById("noteInput").value = note.content;
        document.getElementById("noteCategory").value = note.category_id || "";
        document.getElementById("notePinned").checked = !!note.pinned;
        document.getElementById("editorTitle").textContent = "Edit Note";
    } else {
        document.getElementById("noteTitle").value = ""; 
        document.getElementById("noteInput").value = ""; 
        document.getElementById("noteCategory").value = "";
        document.getElementById("notePinned").checked = false;
        document.getElementById("editorTitle").textContent = "Add Note";
    }
}

window.closeEditor = function() { 
    document.getElementById("editorScreen").classList.remove("active"); 
}

window.saveNote = async function() {
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteInput").value;
    const category_id = document.getElementById("noteCategory").value;
    if (!content) return alert("Note content cannot be empty");

    const note = {
        user_id: viewingUser ? viewingUser.user_id : currentUser.user_id,
        title: title || "Untitled",
        content: content,
        category_id: category_id ? parseInt(category_id) : null,
        pinned: document.getElementById("notePinned").checked ? 1 : 0,
        archived: 0
    };
    
    if (editingId) note.note_id = editingId;

    await api.saveNote(note);
    window.closeEditor();
    refreshNotes();
}

async function refreshNotes(search = '', searchBy = 'all') {
    const notesDiv = document.getElementById("notes");
    const pinnedDiv = document.getElementById("pinnedNotes");
    const archiveDiv = document.getElementById("archiveNotes");
    
    if (notesDiv) notesDiv.innerHTML = ""; 
    if (pinnedDiv) pinnedDiv.innerHTML = ""; 
    if (archiveDiv) archiveDiv.innerHTML = "";

    const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
    const data = await api.getNotes(targetId, search, searchBy);
    data.forEach(n => {
        const container = n.archived ? archiveDiv : (n.pinned ? pinnedDiv : notesDiv);
        if (container) renderNote(n, container);
    });
}

function renderNote(note, container) {
    const div = document.createElement("div");
    div.className = "note";
    
    const tagHtml = note.tags ? note.tags.split(',').map(t => `<span class="tag">#${t}</span>`).join(' ') : '';
    const reminderHtml = note.reminder_time ? `<div class="reminder"><i class="fa fa-bell"></i> ${new Date(note.reminder_time).toLocaleString()}</div>` : '';

    div.innerHTML = `
        <div class="note-header">
            <div>
                <span class="note-title">${note.title}</span> <br>
                <small style="opacity:0.6">${note.category_name || 'No Category'} | ${new Date(note.created_at).toLocaleString()}</small>
                <div class="note-tags">${tagHtml}</div>
                ${reminderHtml}
            </div>
            <div class="note-actions">
                <button onclick="openEditor(${note.note_id})"><i class="fa fa-edit"></i></button>
                <button onclick="archiveNote(${note.note_id})"><i class="fa ${note.archived ? 'fa-upload' : 'fa-archive'}"></i></button>
                <button onclick="deleteNote(${note.note_id})" style="background:red"><i class="fa fa-trash"></i></button>
            </div>
        </div>
        <p style="white-space: pre-wrap;">${note.content}</p>
        <div class="note-footer">
            <button onclick="openModal('commentModal', ${note.note_id})"><i class="fa fa-comment"></i> ${note.comment_count || 0}</button>
            <button onclick="openModal('tagModal', ${note.note_id})"><i class="fa fa-tag"></i> Tag</button>
            <button onclick="openModal('reminderModal', ${note.note_id})"><i class="fa fa-bell"></i></button>
            <button onclick="openModal('shareModal', ${note.note_id})"><i class="fa fa-share-alt"></i></button>
        </div>`;
    container.appendChild(div);
}

// --- Extra Features Logic ---

window.openModal = async function(modalId, noteId) {
    currentNoteId = noteId;
    document.getElementById(modalId).classList.add("active");
    if (modalId === 'commentModal') loadComments(noteId);
}

window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

async function loadComments(noteId) {
    const list = document.getElementById("commentList");
    list.innerHTML = "Loading...";
    const comments = await api.getComments(noteId);
    list.innerHTML = comments.map(c => `
        <div style="border-bottom:1px solid #eee; margin-bottom:5px; padding-bottom:5px;">
            <strong>${c.username}</strong> <small>${new Date(c.created_at).toLocaleString()}</small><br>
            ${c.content}
        </div>
    `).join('') || "No comments yet.";
}

window.addComment = async function() {
    const input = document.getElementById("commentInput");
    if (!input.value.trim()) return;
    const userId = currentUser.user_id;
    await api.saveComment(currentNoteId, userId, input.value.trim());
    input.value = "";
    loadComments(currentNoteId);
    refreshNotes();
}

window.submitTag = async function() {
    const input = document.getElementById("tagInput");
    if (!input.value.trim()) return;
    const userId = currentUser.user_id;
    await api.addTag(currentNoteId, userId, input.value.trim());
    input.value = "";
    closeModal('tagModal');
    refreshNotes();
}

window.submitReminder = async function() {
    const time = document.getElementById("reminderTime").value;
    if (!time) return;
    await api.saveReminder(currentNoteId, time);
    closeModal('reminderModal');
    refreshNotes();
}

window.submitShare = async function() {
    const username = document.getElementById("shareUsername").value;
    const permission = document.getElementById("sharePermission").value;
    if (!username) return;
    const res = await api.shareNote(currentNoteId, username, permission);
    if (res.error) alert(res.error);
    else {
        alert("Shared successfully!");
        closeModal('shareModal');
    }
}

window.shareViaEmail = async function() {
    const email = document.getElementById("shareEmail").value;
    if (!email) return alert("Enter email");
    const res = await api.emailNote(currentNoteId, email);
    alert(res.message);
    closeModal('shareModal');
}

window.deleteNote = async function(id) {
    if(confirm("Delete this note?")) {
        const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
        await api.deleteNote(id, targetId);
        refreshNotes();
    }
}

window.archiveNote = async function(id) {
    const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
    const all = await api.getNotes(targetId);
    const note = all.find(n => n.note_id === id);
    note.archived = !note.archived ? 1 : 0;
    const noteToSave = {
        user_id: targetId,
        note_id: note.note_id,
        title: note.title,
        content: note.content,
        category_id: note.category_id,
        pinned: note.pinned,
        archived: note.archived
    };
    await api.saveNote(noteToSave);
    refreshNotes();
}

async function loadCategories() {
    const list = document.getElementById("categoryList");
    const dropdown = document.getElementById("noteCategory");
    if (list) list.innerHTML = ""; 
    if (dropdown) dropdown.innerHTML = '<option value="">Select Category</option>';
    
    const cats = await api.getCategories();
    cats.forEach(c => {
        if (list) {
            const li = document.createElement("li");
            li.textContent = c.name;
            li.onclick = () => showCategoryNotes(c.category_id, c.name);
            list.appendChild(li);
        }
        if (dropdown) {
            const opt = document.createElement("option");
            opt.value = c.category_id; opt.textContent = c.name;
            dropdown.appendChild(opt);
        }
    });
}

window.addCategory = async function() {
    const input = document.getElementById("newCategory");
    if (!input.value.trim()) return;
    const userId = currentUser.user_id;
    await api.saveCategory(input.value.trim(), userId);
    input.value = "";
    loadCategories();
}

async function showCategoryNotes(category_id, category_name) {
    document.getElementById("categoryNotes").style.display = "block";
    document.getElementById("categoryNotesTitle").textContent = "Category: " + category_name;
    document.getElementById("mainScreen").style.display = "none";
    document.getElementById("categorySection").style.display = "none";
    const container = document.getElementById("categoryNotesList");
    container.innerHTML = "";
    const targetId = viewingUser ? viewingUser.user_id : currentUser.user_id;
    const data = await api.getNotes(targetId);
    data.filter(n => n.category_id === category_id && !n.archived).forEach(n => renderNote(n, container));
}
