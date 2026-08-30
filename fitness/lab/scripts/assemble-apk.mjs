import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const lab = join(dirname(fileURLToPath(import.meta.url)), "..");
const jbr21 = join(process.env.USERPROFILE || "", ".jdks", "jbr-21.0.11");
const studioJbr = "C:\\Program Files\\Android\\Android Studio\\jbr";
const sdkDefault = join(process.env.LOCALAPPDATA || "", "Android", "Sdk");

if (existsSync(join(jbr21, "bin", "java.exe"))) {
  process.env.JAVA_HOME = jbr21;
} else if (!process.env.JAVA_HOME && existsSync(join(studioJbr, "bin", "java.exe"))) {
  process.env.JAVA_HOME = studioJbr;
}

if (!process.env.ANDROID_HOME && existsSync(sdkDefault)) {
  process.env.ANDROID_HOME = sdkDefault;
  process.env.ANDROID_SDK_ROOT = sdkDefault;
}

if (!process.env.JAVA_HOME) {
  console.error(
    "JAVA_HOME missing. Time-Manager uses C:\\Users\\ashut\\.jdks\\jbr-21.0.11",
  );
  process.exit(1);
}

process.env.PATH = `${join(process.env.JAVA_HOME, "bin")};${process.env.PATH || ""}`;

const result = spawnSync("gradlew.bat", ["assembleDebug"], {
  cwd: join(lab, "android"),
  env: process.env,
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) process.exit(result.status ?? 1);

const apk = join(
  lab,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);
if (!existsSync(apk)) {
  console.error("APK not found at", apk);
  process.exit(1);
}
const dest = join(lab, "PersonalLab-debug.apk");
copyFileSync(apk, dest);
console.log("\nAPK ready:\n" + dest);
