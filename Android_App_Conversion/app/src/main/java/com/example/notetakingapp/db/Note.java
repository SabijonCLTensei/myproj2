package com.example.notetakingapp.db;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.ColumnInfo;
import androidx.room.ForeignKey;
import androidx.room.Index;

@Entity(tableName = "note",
        foreignKeys = {
            @ForeignKey(entity = User.class,
                        parentColumns = "user_id",
                        childColumns = "user_id",
                        onDelete = ForeignKey.CASCADE),
            @ForeignKey(entity = Category.class,
                        parentColumns = "category_id",
                        childColumns = "category_id",
                        onDelete = ForeignKey.SET_NULL)
        },
        indices = {@Index("user_id"), @Index("category_id")})
public class Note {
    @PrimaryKey(autoGenerate = true)
    public int note_id;

    @ColumnInfo(name = "user_id")
    public int user_id;

    @ColumnInfo(name = "category_id")
    public Integer category_id;

    @ColumnInfo(name = "title")
    public String title;

    @ColumnInfo(name = "content")
    public String content;

    @ColumnInfo(name = "pinned")
    public boolean pinned = false;

    @ColumnInfo(name = "archived")
    public boolean archived = false;

    @ColumnInfo(name = "created_at")
    public String created_at;

    @ColumnInfo(name = "updated_at")
    public String updated_at;
}
