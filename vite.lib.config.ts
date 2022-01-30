export default {
  build: {
    lib: {
      entry: 'src/createProvider.ts',
      name: 'CreateProvider',
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'lib',
  },
}
