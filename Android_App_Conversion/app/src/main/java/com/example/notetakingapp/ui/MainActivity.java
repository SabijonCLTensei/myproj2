package com.example.notetakingapp.ui;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.example.notetakingapp.R;

public class MainActivity extends AppCompatActivity {

    private WebView myWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);

        // Add the interface to the WebView
        myWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        // Force links and redirects to open in the WebView instead of a browser
        myWebView.setWebViewClient(new WebViewClient());

        // Load the local HTML file
        myWebView.loadUrl("file:///android_asset/index.html");
    }
}
