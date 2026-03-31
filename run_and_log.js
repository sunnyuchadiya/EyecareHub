const { spawn } = require('child_process');
const fs = require('fs');

const logStream = fs.createWriteStream('my_boot_log.txt');
const mvn = spawn('C:\\Users\\sunny\\maven\\apache-maven-3.9.6\\bin\\mvn.cmd', ['spring-boot:run'], {
  env: Object.assign({}, process.env, {
    JAVA_HOME: 'C:\\Program Files\\Java\\jdk-25'
  })
});

console.log('Started Maven spawn...');

mvn.stdout.pipe(logStream);
mvn.stderr.pipe(logStream);

setTimeout(() => {
  console.log("Terminating maven after 15 seconds...");
  mvn.kill();
}, 15000);
