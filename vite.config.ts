import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    // Explicitly define NODE_ENV so @vitejs/plugin-react correctly strips
    // Fast Refresh ($RefreshReg$/$RefreshSig$) in production builds.
    // Replacing all of process.env with {} can prevent the plugin from
    // detecting production mode, leaking dev-only code into the bundle.
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV === 'production' ? 'production' : 'development'
    ),
  },
});
