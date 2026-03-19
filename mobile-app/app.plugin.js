const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * 显式允许 HTTP 明文流量，解决 Android 9+ 默认拦截 HTTP 请求的问题。
 * 同时写入 network_security_config.xml 并将其注册到 AndroidManifest。
 */
const withCleartextHttp = (config) => {
  config = withDangerousMod(config, [
    "android",
    async (props) => {
      const xmlDir = path.join(
        props.modRequest.platformProjectRoot,
        "app", "src", "main", "res", "xml"
      );
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "network_security_config.xml"),
        [
          '<?xml version="1.0" encoding="utf-8"?>',
          "<network-security-config>",
          '  <base-config cleartextTrafficPermitted="true">',
          "    <trust-anchors>",
          '      <certificates src="system" />',
          "    </trust-anchors>",
          "  </base-config>",
          "</network-security-config>",
        ].join("\n")
      );
      return props;
    },
  ]);

  config = withAndroidManifest(config, (props) => {
    const application = props.modResults.manifest.application?.[0];
    if (application?.$) {
      application.$["android:usesCleartextTraffic"] = "true";
      application.$["android:networkSecurityConfig"] = "@xml/network_security_config";
    }
    return props;
  });

  return config;
};

module.exports = withCleartextHttp;
