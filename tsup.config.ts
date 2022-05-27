import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client/index.ts',
  ],
  dts: true,
  clean: false,
  format: ['cjs', 'esm'],
  splitting: false,
})
