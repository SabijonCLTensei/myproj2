package com.example.notetakingapp.db;

import androidx.room.Entity;
import androidx.room.PrimaryKey;
import androidx.room.ColumnInfo;

@Entity(tableName = "category")
public class Category {
    @PrimaryKey(autoGenerate = true)
    public int category_id;

    @ColumnInfo(name = "name")
    public String name;
}
