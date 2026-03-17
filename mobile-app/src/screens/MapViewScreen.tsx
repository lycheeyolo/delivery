import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NavStackParamList } from "../../App";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";

type Props = NativeStackScreenProps<NavStackParamList, "MapView">;

export const MapViewScreen: React.FC<Props> = ({ route }) => {
  const { lat, lng, title } = route.params || {};
  const amapWebKey =
    (Constants.expoConfig?.extra as any)?.amapWebKey ||
    (Constants.manifest?.extra as any)?.amapWebKey ||
    "";

  if (lat == null || lng == null) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>缺少经纬度</Text>
      </View>
    );
  }

  const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no" />
  <style> html, body, #container { margin:0; padding:0; width:100%; height:100%; } </style>
  <script src="https://webapi.amap.com/maps?v=2.0&key=${amapWebKey}"></script>
</head>
<body>
  <div id="container"></div>
  <script>
    var map = new AMap.Map("container", { zoom: 16, center: [${lng}, ${lat}] });
    new AMap.Marker({ position: [${lng}, ${lat}], title: ${JSON.stringify(title || "位置")} }).setMap(map);
  </script>
</body>
</html>
  `;

  if (Platform.OS === "web" || !amapWebKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title || "位置"}</Text>
        <Text style={styles.coords}>
          纬度：{lat}，经度：{lng}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.mapWrap}>
        <WebView source={{ html: mapHtml }} style={styles.map} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  mapWrap: { flex: 1, borderRadius: 8, overflow: "hidden" },
  map: { flex: 1 },
  hint: { color: "#666" },
  coords: { color: "#666", fontSize: 14 },
});
