import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for React application
export default defineConfig({
  plugins: [react()],
  // Ensure worldwindjs is treated as an external dependency correctly
  optimizeDeps: {
    include: ['worldwindjs']
  }
});
