import { execSync } from 'child_process';
try {
  console.log(execSync('bash ./gradlew assembleDebug --stacktrace', { cwd: './android', encoding: 'utf8' }));
} catch (e) {
  console.log("WAIT ERROR OCCURRED!");
  console.log(e.stdout);
  console.log(e.stderr);
}
