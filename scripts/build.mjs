const exit = process.exit.bind(process);
if (process.platform === 'win32') {
  process.exit = (code) => {
    setTimeout(() => exit(code), 1000);
  };
}
process.argv = [process.argv[0], 'vinext', 'build'];
await import('vinext/dist/cli.js').catch(async (error) => {
  if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') throw error;
  await import(new URL('../node_modules/vinext/dist/cli.js', import.meta.url));
});
