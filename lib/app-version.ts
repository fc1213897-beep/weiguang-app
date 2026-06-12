import packageJson from "../package.json";

/** 与 package.json 同步的产品版本号 */
export const APP_VERSION = packageJson.version;

export function formatAppVersion(prefix = "微光 v") {
  return `${prefix}${APP_VERSION}`;
}
