import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Platform,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NavStackParamList } from "../../App";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<NavStackParamList, "MapPicker">;

const DEFAULT_CENTER = { lat: 39.90923, lng: 116.397428 };

export const MapPickerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { initialLat, initialLng } = route.params || {};
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null,
  );
  const [manualLat, setManualLat] = useState(
    initialLat != null ? String(initialLat) : "",
  );
  const [manualLng, setManualLng] = useState(
    initialLng != null ? String(initialLng) : "",
  );
  const webViewRef = useRef<WebView>(null);

  const amapWebKey =
    (Constants.expoConfig?.extra as any)?.amapWebKey ||
    (Constants.manifest?.extra as any)?.amapWebKey ||
    "";

  const handleConfirm = () => {
    let lat: number;
    let lng: number;
    if (Platform.OS === "web") {
      const latN = parseFloat(manualLat);
      const lngN = parseFloat(manualLng);
      if (Number.isNaN(latN) || Number.isNaN(lngN)) {
        showAlert("提示", "请填写有效的经纬度或在地图上选点");
        return;
      }
      lat = latN;
      lng = lngN;
    } else {
      if (!selected) {
        showAlert("提示", "请先在地图上点击选点");
        return;
      }
      lat = selected.lat;
      lng = selected.lng;
    }
    navigation.navigate("NewContact", { pickedLat: lat, pickedLng: lng });
  };

  const center =
    selected ||
    (initialLat != null && initialLng != null
      ? { lat: initialLat, lng: initialLng }
      : null) ||
    DEFAULT_CENTER;
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
  <div id="tip" style="position:fixed;bottom:80px;left:0;right:0;text-align:center;color:#666;font-size:12px;">点击地图选择位置</div>
  <script>
    var map = new AMap.Map("container", { zoom: 15, center: [${center.lng}, ${center.lat}] });
    var marker = null;
    map.on("click", function(e) {
      var lng = e.lnglat.getLng();
      var lat = e.lnglat.getLat();
      if (marker) marker.setMap(null);
      marker = new AMap.Marker({ position: [lng, lat] });
      marker.setMap(map);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: lat, lng: lng }));
      }
    });
  </script>
</body>
</html>
  `;

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>选择位置（Web 端可手动输入经纬度）</Text>
        <View style={styles.row}>
          <Text style={styles.label}>纬度</Text>
          <TextInput
            style={styles.input}
            placeholder="如 39.90923"
            keyboardType="numeric"
            value={manualLat}
            onChangeText={setManualLat}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>经度</Text>
          <TextInput
            style={styles.input}
            placeholder="如 116.397428"
            keyboardType="numeric"
            value={manualLng}
            onChangeText={setManualLng}
          />
        </View>
        <Button title="确认选点" onPress={handleConfirm} />
      </View>
    );
  }

  if (!amapWebKey) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>请配置 amapWebKey 后使用地图选点</Text>
        <View style={styles.row}>
          <Text style={styles.label}>纬度</Text>
          <TextInput
            style={styles.input}
            placeholder="纬度"
            keyboardType="numeric"
            value={manualLat}
            onChangeText={setManualLat}
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>经度</Text>
          <TextInput
            style={styles.input}
            placeholder="经度"
            keyboardType="numeric"
            value={manualLng}
            onChangeText={setManualLng}
          />
        </View>
        <Button title="确认选点" onPress={handleConfirm} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapWrap}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.map}
          onMessage={(e) => {
            try {
              const { lat, lng } = JSON.parse(e.nativeEvent.data);
              setSelected({ lat, lng });
            } catch {}
          }}
        />
      </View>
      {selected && (
        <Text style={styles.coords}>
          已选：{selected.lat.toFixed(5)}, {selected.lng.toFixed(5)}
        </Text>
      )}
      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>确认选点</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  mapWrap: {
    height: 320,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  map: { flex: 1 },
  coords: { fontSize: 12, color: "#666", marginBottom: 8 },
  confirmBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontWeight: "bold" },
  hint: { fontSize: 12, color: "#c00", marginBottom: 12 },
  row: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10 },
});
