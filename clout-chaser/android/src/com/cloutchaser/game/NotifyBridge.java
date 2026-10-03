package com.cloutchaser.game;

import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.JavascriptInterface;

/** window.AndroidNotify in the game: schedules local reminders that fire while the app is closed. */
public class NotifyBridge {
    static final int MAX_ID = 10;
    static final int FLAG_IMMUTABLE = 0x04000000; // PendingIntent.FLAG_IMMUTABLE (API 23)
    private final Activity act;

    NotifyBridge(Activity act) { this.act = act; }

    static PendingIntent pending(Context c, int id, String title, String body) {
        Intent i = new Intent(c, NotifyReceiver.class);
        i.putExtra("id", id);
        if (title != null) { i.putExtra("title", title); i.putExtra("body", body); }
        return PendingIntent.getBroadcast(c, id, i, PendingIntent.FLAG_UPDATE_CURRENT | FLAG_IMMUTABLE);
    }

    @JavascriptInterface
    public void schedule(int id, String title, String body, double delayMs) {
        if (id < 1 || id > MAX_ID || delayMs < 0) return;
        AlarmManager am = (AlarmManager) act.getSystemService(Context.ALARM_SERVICE);
        long when = System.currentTimeMillis() + (long) delayMs;
        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, when, pending(act, id, title, body)); // inexact: no special alarm permission needed
    }

    @JavascriptInterface
    public void cancelAll() {
        AlarmManager am = (AlarmManager) act.getSystemService(Context.ALARM_SERVICE);
        for (int id = 1; id <= MAX_ID; id++) am.cancel(pending(act, id, null, null));
    }

    @JavascriptInterface
    public boolean enabled() {
        NotificationManager nm = (NotificationManager) act.getSystemService(Context.NOTIFICATION_SERVICE);
        return nm.areNotificationsEnabled();
    }

    /** Android 13+ asks the player once; older versions allow notifications by default. */
    @JavascriptInterface
    public void requestPermission() {
        if (Build.VERSION.SDK_INT >= 33 && act.checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) {
            act.runOnUiThread(new Runnable() {
                @Override public void run() { act.requestPermissions(new String[] { "android.permission.POST_NOTIFICATIONS" }, 42); }
            });
        }
    }
}
