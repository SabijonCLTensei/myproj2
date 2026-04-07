package com.example.notetakingapp.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;
import java.util.List;

@Dao
public interface AppDao {
    @Query("SELECT * FROM user WHERE username = :username AND password = :password")
    User login(String username, String password);

    @Insert
    long register(User user);

    @Query("SELECT * FROM note WHERE user_id = :userId")
    List<Note> getNotes(int userId);

    @Insert
    long insertNote(Note note);

    @Update
    void updateNote(Note note);

    @Query("DELETE FROM note WHERE note_id = :noteId AND user_id = :userId")
    void deleteNote(int noteId, int userId);

    @Query("SELECT * FROM category")
    List<Category> getCategories();

    @Insert
    long insertCategory(Category category);
}
