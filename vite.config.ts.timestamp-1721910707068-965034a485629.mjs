// vite.config.ts
import { defineConfig } from "file:///E:/word-hunter/node_modules/vite/dist/node/index.js";
import solidPlugin from "file:///E:/word-hunter/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import { crx } from "file:///E:/word-hunter/node_modules/@crxjs/vite-plugin/dist/index.mjs";

// manifest.json
var manifest_default = {
  name: "Word Hunter",
  description: "Discover new words you don't know on any web page",
  version: "1.1.10",
  manifest_version: 3,
  key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA37Tu6LgsThnqIusXCvgDP+kzjHmJgwehDp01nEvTCH3N19Qpe3+q6o20yjMfyT1681f3mzugV4scpjSsYH7ixO8wZHDNBwJlPPLV8jjpwRd/rBiXLYw7sSSHsX1dN7mQuKdua7WrsN+CUc7s8acq0F9lAXGtsk/BA3tNSidB5kVmog1iLf3m6wbbYK9wKmlgIjw8OkAxOs4YnZ/Z5Dfj4lPZ0aYxUmQkXSZgc3Jj0IUiQBfY3+RsJw0u7M2njPlU6AQ8pPET3BHY86ee0xSksINMrVYYMjAmHv+05RzIF+rANlHGqHYoPaD3z/rxkeki4uXXkVEi4Yv+AhdKxGUwYwIDAQAB",
  icons: {
    "16": "icon.png",
    "32": "icon.png",
    "48": "icon.png",
    "128": "icon.png"
  },
  action: {
    default_popup: "src/popup.html",
    default_icon: "icon.png"
  },
  options_page: "src/options.html",
  side_panel: {
    default_path: "src/options.html"
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/content/index.tsx"],
      all_frames: true,
      match_about_blank: true
    }
  ],
  web_accessible_resources: [
    {
      resources: ["*.svg", "icons/*.png", "elephant.pdf"],
      matches: ["<all_urls>"]
    }
  ],
  oauth2: {
    client_id: "718785835689-d2lqmos8aa7kfgtq6mplp7v2hb83eahh.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/drive.file"]
  },
  host_permissions: ["*://*.youglish.com/"],
  permissions: [
    "tts",
    "storage",
    "activeTab",
    "scripting",
    "tabs",
    "offscreen",
    "identity",
    "contextMenus",
    "sidePanel",
    "alarms",
    "cookies"
  ]
};

// vite.config.ts
var vite_config_default = defineConfig({
  build: {
    outDir: "build",
    target: "esnext",
    rollupOptions: {
      input: {
        logs: "src/logs.html"
      }
    },
    sourcemap: false
  },
  plugins: [solidPlugin(), crx({ manifest: manifest_default })]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibWFuaWZlc3QuanNvbiJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXHdvcmQtaHVudGVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJFOlxcXFx3b3JkLWh1bnRlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovd29yZC1odW50ZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xyXG5pbXBvcnQgc29saWRQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tc29saWQnXHJcbmltcG9ydCB7IGNyeCwgTWFuaWZlc3RWM0V4cG9ydCB9IGZyb20gJ0Bjcnhqcy92aXRlLXBsdWdpbidcclxuaW1wb3J0IG1hbmlmZXN0IGZyb20gJy4vbWFuaWZlc3QuanNvbidcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2J1aWxkJyxcclxuICAgIHRhcmdldDogJ2VzbmV4dCcsXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIGlucHV0OiB7XHJcbiAgICAgICAgbG9nczogJ3NyYy9sb2dzLmh0bWwnXHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbc29saWRQbHVnaW4oKSwgY3J4KHsgbWFuaWZlc3Q6IG1hbmlmZXN0IGFzIE1hbmlmZXN0VjNFeHBvcnQgfSldXHJcbn0pXHJcbiIsICJ7XHJcbiAgXCJuYW1lXCI6IFwiV29yZCBIdW50ZXJcIixcclxuICBcImRlc2NyaXB0aW9uXCI6IFwiRGlzY292ZXIgbmV3IHdvcmRzIHlvdSBkb24ndCBrbm93IG9uIGFueSB3ZWIgcGFnZVwiLFxyXG4gIFwidmVyc2lvblwiOiBcIjEuMS4xMFwiLFxyXG4gIFwibWFuaWZlc3RfdmVyc2lvblwiOiAzLFxyXG4gIFwia2V5XCI6IFwiTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUEzN1R1Nkxnc1RobnFJdXNYQ3ZnRFAra3pqSG1KZ3dlaERwMDFuRXZUQ0gzTjE5UXBlMytxNm8yMHlqTWZ5VDE2ODFmM216dWdWNHNjcGpTc1lIN2l4Tzh3WkhETkJ3SmxQUExWOGpqcHdSZC9yQmlYTFl3N3NTU0hzWDFkTjdtUXVLZHVhN1dyc04rQ1VjN3M4YWNxMEY5bEFYR3Rzay9CQTN0TlNpZEI1a1Ztb2cxaUxmM202d2JiWUs5d0ttbGdJanc4T2tBeE9zNFluWi9aNURmajRsUFowYVl4VW1Ra1hTWmdjM0pqMElVaVFCZlkzK1JzSncwdTdNMm5qUGxVNkFROHBQRVQzQkhZODZlZTB4U2tzSU5NclZZWU1qQW1IdiswNVJ6SUYrckFObEhHcUhZb1BhRDN6L3J4a2VraTR1WFhrVkVpNFl2K0FoZEt4R1V3WXdJREFRQUJcIixcclxuICBcImljb25zXCI6IHtcclxuICAgIFwiMTZcIjogXCJpY29uLnBuZ1wiLFxyXG4gICAgXCIzMlwiOiBcImljb24ucG5nXCIsXHJcbiAgICBcIjQ4XCI6IFwiaWNvbi5wbmdcIixcclxuICAgIFwiMTI4XCI6IFwiaWNvbi5wbmdcIlxyXG4gIH0sXHJcbiAgXCJhY3Rpb25cIjoge1xyXG4gICAgXCJkZWZhdWx0X3BvcHVwXCI6IFwic3JjL3BvcHVwLmh0bWxcIixcclxuICAgIFwiZGVmYXVsdF9pY29uXCI6IFwiaWNvbi5wbmdcIlxyXG4gIH0sXHJcbiAgXCJvcHRpb25zX3BhZ2VcIjogXCJzcmMvb3B0aW9ucy5odG1sXCIsXHJcbiAgXCJzaWRlX3BhbmVsXCI6IHtcclxuICAgIFwiZGVmYXVsdF9wYXRoXCI6IFwic3JjL29wdGlvbnMuaHRtbFwiXHJcbiAgfSxcclxuICBcImJhY2tncm91bmRcIjoge1xyXG4gICAgXCJzZXJ2aWNlX3dvcmtlclwiOiBcInNyYy9iYWNrZ3JvdW5kL2luZGV4LnRzXCIsXHJcbiAgICBcInR5cGVcIjogXCJtb2R1bGVcIlxyXG4gIH0sXHJcbiAgXCJjb250ZW50X3NjcmlwdHNcIjogW1xyXG4gICAge1xyXG4gICAgICBcIm1hdGNoZXNcIjogW1wiaHR0cDovLyovKlwiLCBcImh0dHBzOi8vKi8qXCIsIFwiPGFsbF91cmxzPlwiXSxcclxuICAgICAgXCJqc1wiOiBbXCJzcmMvY29udGVudC9pbmRleC50c3hcIl0sXHJcbiAgICAgIFwiYWxsX2ZyYW1lc1wiOiB0cnVlLFxyXG4gICAgICBcIm1hdGNoX2Fib3V0X2JsYW5rXCI6IHRydWVcclxuICAgIH1cclxuICBdLFxyXG4gIFwid2ViX2FjY2Vzc2libGVfcmVzb3VyY2VzXCI6IFtcclxuICAgIHtcclxuICAgICAgXCJyZXNvdXJjZXNcIjogW1wiKi5zdmdcIiwgXCJpY29ucy8qLnBuZ1wiLCBcImVsZXBoYW50LnBkZlwiXSxcclxuICAgICAgXCJtYXRjaGVzXCI6IFtcIjxhbGxfdXJscz5cIl1cclxuICAgIH1cclxuICBdLFxyXG4gIFwib2F1dGgyXCI6IHtcclxuICAgIFwiY2xpZW50X2lkXCI6IFwiNzE4Nzg1ODM1Njg5LWQybHFtb3M4YWE3a2ZndHE2bXBscDd2MmhiODNlYWhoLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tXCIsXHJcbiAgICBcInNjb3Blc1wiOiBbXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL2RyaXZlLmZpbGVcIl1cclxuICB9LFxyXG4gIFwiaG9zdF9wZXJtaXNzaW9uc1wiOiBbXCIqOi8vKi55b3VnbGlzaC5jb20vXCJdLFxyXG4gIFwicGVybWlzc2lvbnNcIjogW1xyXG4gICAgXCJ0dHNcIixcclxuICAgIFwic3RvcmFnZVwiLFxyXG4gICAgXCJhY3RpdmVUYWJcIixcclxuICAgIFwic2NyaXB0aW5nXCIsXHJcbiAgICBcInRhYnNcIixcclxuICAgIFwib2Zmc2NyZWVuXCIsXHJcbiAgICBcImlkZW50aXR5XCIsXHJcbiAgICBcImNvbnRleHRNZW51c1wiLFxyXG4gICAgXCJzaWRlUGFuZWxcIixcclxuICAgIFwiYWxhcm1zXCIsXHJcbiAgICBcImNvb2tpZXNcIlxyXG4gIF1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdPLFNBQVMsb0JBQW9CO0FBQzdQLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsV0FBNkI7OztBQ0Z0QztBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsYUFBZTtBQUFBLEVBQ2YsU0FBVztBQUFBLEVBQ1gsa0JBQW9CO0FBQUEsRUFDcEIsS0FBTztBQUFBLEVBQ1AsT0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sT0FBTztBQUFBLEVBQ1Q7QUFBQSxFQUNBLFFBQVU7QUFBQSxJQUNSLGVBQWlCO0FBQUEsSUFDakIsY0FBZ0I7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsY0FBZ0I7QUFBQSxFQUNoQixZQUFjO0FBQUEsSUFDWixjQUFnQjtBQUFBLEVBQ2xCO0FBQUEsRUFDQSxZQUFjO0FBQUEsSUFDWixnQkFBa0I7QUFBQSxJQUNsQixNQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsaUJBQW1CO0FBQUEsSUFDakI7QUFBQSxNQUNFLFNBQVcsQ0FBQyxjQUFjLGVBQWUsWUFBWTtBQUFBLE1BQ3JELElBQU0sQ0FBQyx1QkFBdUI7QUFBQSxNQUM5QixZQUFjO0FBQUEsTUFDZCxtQkFBcUI7QUFBQSxJQUN2QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLDBCQUE0QjtBQUFBLElBQzFCO0FBQUEsTUFDRSxXQUFhLENBQUMsU0FBUyxlQUFlLGNBQWM7QUFBQSxNQUNwRCxTQUFXLENBQUMsWUFBWTtBQUFBLElBQzFCO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBVTtBQUFBLElBQ1IsV0FBYTtBQUFBLElBQ2IsUUFBVSxDQUFDLDRDQUE0QztBQUFBLEVBQ3pEO0FBQUEsRUFDQSxrQkFBb0IsQ0FBQyxxQkFBcUI7QUFBQSxFQUMxQyxhQUFlO0FBQUEsSUFDYjtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQ0Y7OztBRG5EQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixPQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFdBQVc7QUFBQSxFQUNiO0FBQUEsRUFDQSxTQUFTLENBQUMsWUFBWSxHQUFHLElBQUksRUFBRSxVQUFVLGlCQUE2QixDQUFDLENBQUM7QUFDMUUsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
