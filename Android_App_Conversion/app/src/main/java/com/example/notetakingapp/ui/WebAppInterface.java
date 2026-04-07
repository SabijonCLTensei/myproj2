package com.example.notetakingapp.ui;

import android.content.Context;
import android.webkit.JavascriptInterface;
import com.example.notetakingapp.db.AppDatabase;
import com.example.notetakingapp.db.User;
import com.example.notetakingapp.db.Note;
import com.example.notetakingapp.db.Category;
import com.google.gson.Gson;
import java.util.List;

public class WebAppInterface {
    Context mContext;
    AppDatabase db;
    Gson gson = new Gson();

    WebAppInterface(Context c) {
        mContext = c;
        db = AppDatabase.getDatabase(c);
    }

    @JavascriptInterface
    public String login(String loginDataJson) {
        User loginData = gson.fromJson(loginDataJson, User.class);
        User user = db.appDao().login(loginData.username, loginData.password);
        if (user != null) {
            return gson.toJson(user);
        } else {
            return gson.toJson(new ErrorResponse("Invalid username or password"));
        }
    }

    @JavascriptInterface
    public String register(String userDataJson) {
        User userData = gson.fromJson(userDataJson, User.class);
        long id = db.appDao().register(userData);
        userData.user_id = (int) id;
        return gson.toJson(userData);
    }

    @JavascriptInterface
    public String getNotes(int userId, String search, String searchBy) {
        List<Note> notes = db.appDao().getNotes(userId);
        return gson.toJson(notes);
    }

    @JavascriptInterface
    public String saveNote(String noteJson) {
        Note note = gson.fromJson(noteJson, Note.class);
        if (note.note_id > 0) {
            db.appDao().updateNote(note);
        } else {
            long id = db.appDao().insertNote(note);
            note.note_id = (int) id;
        }
        return gson.toJson(note);
    }

    @JavascriptInterface
    public String deleteNote(int id, int userId) {
        db.appDao().deleteNote(id, userId);
        return gson.toJson(new SuccessResponse(true));
    }

    @JavascriptInterface
    public String getCategories() {
        List<Category> categories = db.appDao().getCategories();
        return gson.toJson(categories);
    }

    @JavascriptInterface
    public String saveCategory(String name, int userId) {
        Category cat = new Category();
        cat.name = name;
        long id = db.appDao().insertCategory(cat);
        cat.category_id = (int) id;
        return gson.toJson(cat);
    }

    private class ErrorResponse {
        String error;
        ErrorResponse(String e) { error = e; }
    }

    private class SuccessResponse {
        boolean success;
        SuccessResponse(boolean s) { success = s; }
    }
}
