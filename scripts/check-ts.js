const { exec } = require('child_process');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    console.log(`Stdout: ${stdout}`);
    console.error(`Stderr: ${stderr}`);
    return;
  }
  console.log(`Stdout: ${stdout}`);
  console.error(`Stderr: ${stderr}`);
  console.log('TypeScript check passed.');
});
