$env:JAVA_HOME="C:\Program Files\Java\jdk-25"
$env:MAVEN_HOME="C:\Users\sunny\maven\apache-maven-3.9.6"
$env:PATH="$env:MAVEN_HOME\bin;$env:JAVA_HOME\bin;$env:PATH"
mvn spring-boot:run *>&1 | Tee-Object -FilePath "spring_boot_log.txt"
