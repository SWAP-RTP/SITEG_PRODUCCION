import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/app-sugo/',
  plugins: [react()]
})

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()], 
//   server: {
//     host: true,
//     port: 3000
//   },
//   // resolve: {
//   //   alias: {
//   //     '@components': path.resolve(__dirname, './src/components'),
//   //   },
//   // }
// })
