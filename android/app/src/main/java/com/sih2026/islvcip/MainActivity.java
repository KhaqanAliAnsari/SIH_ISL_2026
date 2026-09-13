package com.sih2026.islvcip;

import android.webkit.WebSettings;
import android.webkit.WebView;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // ─── WebView Performance Optimizations ──────────────────────────
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();

        // Enable hardware-accelerated rendering layers
        webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);

        // Enable DOM storage for caching MediaPipe WASM/model blobs
        settings.setDomStorageEnabled(true);

        // Allow file access for local .npy template loading
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);

        // Disable text zoom to prevent layout breaks
        settings.setTextZoom(100);

        // Enable mixed content for CDN model loading over https
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Boost WebView renderer process priority for smooth GPU inference (API 26+)
        if (android.os.Build.VERSION.SDK_INT >= 26) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, true);
        }
    }
}
