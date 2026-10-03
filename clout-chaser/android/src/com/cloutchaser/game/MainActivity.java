package com.cloutchaser.game;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.widget.FrameLayout;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
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
        prefs = getSharedPreferences("ui", MODE_PRIVATE);
        if (Build.VERSION.SDK_INT >= 28) { // use the space around the camera notch too
            WindowManager.LayoutParams lp = w.getAttributes();
            lp.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            w.setAttributes(lp);
        }

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
        web.addJavascriptInterface(new UiBridge(), "AndroidUi");
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
                int top = in.getSystemWindowInsetTop(), left = in.getSystemWindowInsetLeft(), right = in.getSystemWindowInsetRight();
                if (Build.VERSION.SDK_INT >= 28 && in.getDisplayCutout() != null) { // keep the game clear of the notch
                    top = Math.max(top, in.getDisplayCutout().getSafeInsetTop());
                    left = Math.max(left, in.getDisplayCutout().getSafeInsetLeft());
                    right = Math.max(right, in.getDisplayCutout().getSafeInsetRight());
                }
                v.setPadding(left, top, right, in.getSystemWindowInsetBottom()); // bottom includes the keyboard
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
    @Override protected void onResume() { super.onResume(); web.onResume(); applyFullscreen(); }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus); if (focus) applyFullscreen(); }

    /* Full screen: status and navigation bars hidden; a swipe from the edge shows them for a moment */
    private SharedPreferences prefs;
    private boolean fullscreen() { return prefs.getBoolean("fullscreen", true); }
    @SuppressWarnings("deprecation")
    private void applyFullscreen() {
        View d = getWindow().getDecorView();
        d.setSystemUiVisibility(fullscreen()
            ? View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            : 0);
    }
    /** window.AndroidUi in the game */
    class UiBridge {
        @JavascriptInterface public boolean isFullscreen() { return fullscreen(); }
        @JavascriptInterface public void setFullscreen(final boolean on) {
            prefs.edit().putBoolean("fullscreen", on).apply();
            runOnUiThread(new Runnable() { @Override public void run() { applyFullscreen(); } });
        }
    }
}
