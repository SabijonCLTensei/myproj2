package com.example.notetakingapp.db;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.ColumnInfo;

@Entity(tableName = "user")
public class User {
    @PrimaryKey(autoGenerate = true)
    public int user_id;

    @ColumnInfo(name = "username")
    public String username;

    @ColumnInfo(name = "password")
    public String password;

    @ColumnInfo(name = "email")
    public String email;

    @ColumnInfo(name = "full_name")
    public String full_name;

    @ColumnInfo(name = "date_registered")
    public String date_registered; // SQLite doesn't have DATETIME, using String for ISO8601
}
