import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
// REMOVIDO: import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'lucide-react', 'recharts', 'html2canvas'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    // REMOVIDO:
    // traeBadgePlugin({
    //   variant: 'dark',
    //   position: 'bottom-right',
    //   prodOnly: true,
    //   clickable: true,
    //   clickUrl: 'https://www.trae.ai/solo?showJoin=1',
    //   autoTheme: true,
    //   autoThemeTarget: '#root'
    // }), 
    tsconfigPaths()
  ],
})