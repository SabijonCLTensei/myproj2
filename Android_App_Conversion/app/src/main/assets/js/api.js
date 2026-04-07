// api.js modified for Android WebAppInterface
// This file communicates with the Android Java layer instead of a remote server.

export async function login(loginData) {
    // Android.login returns a JSON string
    const result = Android.login(JSON.stringify(loginData));
    return JSON.parse(result);
}

export async function register(userData) {
    const result = Android.register(JSON.stringify(userData));
    return JSON.parse(result);
}

export async function getHistory(user_id) {
    const result = Android.getHistory(user_id);
    return JSON.parse(result);
}

export async function getNotes(user_id, search = '', searchBy = 'all') {
    const result = Android.getNotes(user_id, search, searchBy);
    return JSON.parse(result);
}

export async function saveNote(note) {
    const result = Android.saveNote(JSON.stringify(note));
    return JSON.parse(result);
}

export async function deleteNote(id, user_id) {
    const result = Android.deleteNote(id, user_id);
    return JSON.parse(result);
}

export async function getCategories() {
    const result = Android.getCategories();
    return JSON.parse(result);
}

export async function saveCategory(name, user_id) {
    const result = Android.saveCategory(name, user_id);
    return JSON.parse(result);
}

// These functions are simplified for the demo conversion
export async function addTag(note_id, user_id, tag_name) {
    return { success: true }; 
}

export async function getComments(note_id) {
    return [];
}

export async function saveComment(note_id, user_id, content) {
    return { success: true };
}

export async function saveReminder(note_id, reminder_time) {
    return { success: true };
}

export async function shareNote(note_id, target_username, permission) {
    return { success: true };
}

export async function emailNote(note_id, email) {
    return { success: true };
}

export async function syncGmail(user_id, email) {
    return { success: true };
}
