package com.cloutchaser.game;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Clout Chaser: the web game running full-screen in a WebView, saves kept in localStorage. */
public class MainActivity extends Activity {
    private static final int PICK_PHOTO = 7;
    private WebView web;
    private ValueCallback<Uri[]> pendingPick;

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window w = getWindow();
        w.setStatusBarColor(Color.BLACK);
        w.setNavigationBarColor(Color.BLACK);
        w.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);

        web = new WebView(this);
        web.setBackgroundColor(Color.BLACK);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // the game saves to localStorage
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);                     // ignore system font scaling so the layout holds
        web.addJavascriptInterface(new NotifyBridge(this), "AndroidNotify");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, String url) {
                if (url.startsWith("file:")) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { /* no browser */ }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            // "Add your photo" in the composer
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (pendingPick != null) pendingPick.onReceiveValue(null);
                pendingPick = cb;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("image/*");
                try { startActivityForResult(Intent.createChooser(i, "Choose a photo"), PICK_PHOTO); }
                catch (Exception e) { pendingPick = null; return false; }
                return true;
            }
        });
        // Android 15 draws apps edge to edge: keep the game clear of the status and navigation bars
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        root.addView(web, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        root.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
            @Override
            public WindowInsets onApplyWindowInsets(View v, WindowInsets in) {
                v.setPadding(in.getSystemWindowInsetLeft(), in.getSystemWindowInsetTop(), in.getSystemWindowInsetRight(), in.getSystemWindowInsetBottom());
                return in;
            }
        });
        setContentView(root);
        if (saved != null) web.restoreState(saved);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == PICK_PHOTO && pendingPick != null) {
            Uri[] out = null;
            if (res == RESULT_OK && data != null && data.getData() != null) out = new Uri[] { data.getData() };
            pendingPick.onReceiveValue(out);
            pendingPick = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    /* Back closes the open sheet/modal first (Escape in the game), then goes back, then leaves. */
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(
            "(function(){var m=document.querySelector('#modal');if(m&&!m.hidden)return 'handled';var o=['#composeWrap','#drawer'].some(function(s){var e=document.querySelector(s);return e&&!e.hidden;});"
            + "if(o){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}));return 'handled';}"
            + "if(typeof ui!=='undefined'&&ui.view){ACT_RUN('back');return 'handled';}return 'exit';})()",
            new ValueCallback<String>() {
                @Override public void onReceiveValue(String r) { if (r == null || !r.contains("handled")) finish(); }
            });
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
}
