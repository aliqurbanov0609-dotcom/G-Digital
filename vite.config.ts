import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Переключаем TanStack Start в SPA режим (отключаем серверную сборку/SSR)
  tanstackStart: {
    preset: "spa",
    // Дополнительно явно отключаем server entry (если плагин ожидает boolean)
    server: false,
  },

  vite: {
    // Явно указываем папку вывода сборки
    build: {
      outDir: "dist",
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",

        manifest: {
          name: "G-Digital",
          short_name: "GDigital",
          description: "Qurbanovlar Digital Home",
          theme_color: "#0B0F1A",
          background_color: "#0B0F1A",
          display: "standalone",
          orientation: "portrait",
          start_url: "/",

          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/icon-512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  },
});
