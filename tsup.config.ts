import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/client/index.ts',
  ],
  dts: false,
  clean: false,
  format: ['cjs', 'esm'],
  splitting: false,
})
