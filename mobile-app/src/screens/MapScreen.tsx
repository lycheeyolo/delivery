import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NavStackParamList } from "../../App";
import {
  apiGetPendingOrders,
  apiOptimizeRoute,
  apiUpdateOrderStatus,
} from "../services/api";
import { Linking } from "react-native";
import { showAlert } from "../utils/alert";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<NavStackParamList, "Map">;

interface PendingOrder {
  id: string;
  household: {
    id: string;
    addressText: string;
    lat: number;
    lng: number;
    contact: {
      phone: string;
      displayName: string;
    };
  };
}

export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [routeSeq, setRouteSeq] = useState<string[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiGetPendingOrders();
      setOrders(data);
    } catch (e: any) {
      showAlert("错误", e.message || "加载待配送列表失败");
    }
  }, []);

  useEffect(() => {
    // 获取当前位置，用于在高德地图上展示
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        });
      } catch {
        // 忽略定位失败，地图会使用默认中心点
      }
    })();
  }, [navigation]);

  // 每次回到主界面时刷新待配送列表（包含从待配送列表 / 新建任务返回）
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  const handleOptimize = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert("提示", "需要定位权限才能规划路线");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const current = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      };
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length === 0) {
        showAlert("提示", "当前没有待配送订单");
        return;
      }
      const data = await apiOptimizeRoute(current, orderIds);
      setRouteSeq(data.sequence);
      showAlert("提示", "已根据当前位置规划推荐路线");
    } catch (e: any) {
      showAlert("错误", e.message || "路线规划失败");
    }
  };

  const handleNavigate = (order: PendingOrder) => {
    const lat = order.household.lat;
    const lng = order.household.lng;
    const url = `androidamap://route?sourceApplication=GasDelivery&dlat=${lat}&dlon=${lng}&dev=0&t=2`;
    Linking.openURL(url).catch(() => {
      showAlert("错误", "无法打开高德地图，请确认手机已安装");
    });
  };

  const handleMarkDone = async (order: PendingOrder) => {
    try {
      await apiUpdateOrderStatus(order.id, "done");
      await loadOrders();
    } catch (e: any) {
      showAlert("错误", e.message || "更新状态失败");
    }
  };

  const orderedList =
    routeSeq.length > 0
      ? [...orders].sort(
          (a, b) => routeSeq.indexOf(a.id) - routeSeq.indexOf(b.id),
        )
      : orders;

  const amapWebKey =
    (Constants.expoConfig?.extra as any)?.amapWebKey ||
    (Constants.manifest?.extra as any)?.amapWebKey ||
    "";

  const mapHtml = React.useMemo(() => {
    const points = orders.map((o) => ({
      id: o.id,
      lat: o.household.lat,
      lng: o.household.lng,
      name: o.household.contact.displayName,
      address: o.household.addressText,
    }));

    const data = {
      current: currentLocation,
      points,
      selectedId: selectedOrderId,
    };

    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=1,minimum-scale=1,user-scalable=no"
    />
    <style>
      html, body, #container {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
    </style>
    <script src="https://webapi.amap.com/maps?v=2.0&key=${amapWebKey}"></script>
  </head>
  <body>
    <div id="container"></div>
    <script>
      (function() {
        var data = ${JSON.stringify(data)};
        var center = [116.397428, 39.90923]; // 默认北京天安门
        if (data.current && typeof data.current.lat === "number" && typeof data.current.lng === "number") {
          center = [data.current.lng, data.current.lat];
        } else if (data.points && data.points.length > 0) {
          center = [data.points[0].lng, data.points[0].lat];
        }

        var map = new AMap.Map("container", {
          zoom: 13,
          center: center,
        });

        if (data.points && data.points.length > 0) {
          data.points.forEach(function(p) {
            var isSelected = data.selectedId && p.id === data.selectedId;
            var marker = new AMap.Marker({
              position: [p.lng, p.lat],
              title: p.name || "",
              icon: isSelected
                ? "https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png"
                : "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            });
            marker.setMap(map);
          });
        }

        if (data.current) {
          new AMap.Marker({
            position: [center[0], center[1]],
            icon: "https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
            title: "当前位置",
            offset: new AMap.Pixel(-13, -30)
          }).setMap(map);
        }
      })();
    </script>
  </body>
</html>
    `;
  }, [orders, currentLocation, amapWebKey]);

  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.mapWrapper}>
          <Text style={styles.mapHint}>
            Web 预览暂不显示高德地图，仅在手机 App
            中展示地图。下面列表数据与真实接口一致。
          </Text>
        </View>
      ) : amapWebKey ? (
        <View style={styles.mapWrapper}>
          <WebView source={{ html: mapHtml }} style={styles.map} />
        </View>
      ) : (
        <Text style={styles.mapHint}>
          请在 app.json 的 extra.amapWebKey 中配置高德 Web JS API 的
          key，才能在此处显示地图。
        </Text>
      )}
      <View style={styles.toolbar}>
        <Button
          title="待配送"
          onPress={() => navigation.navigate("DeliveryList")}
        />
        <Button title="智能路径规划" onPress={handleOptimize} />
      </View>
      <Text style={styles.hint}>
        当前示例以列表方式展示待配送家庭；后续你可以按文档接入高德地图组件，在地图上显示这些坐标。
      </Text>
      <FlatList
        data={orderedList}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => {
          const isSelected = item.id === selectedOrderId;
          return (
            <TouchableOpacity
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedOrderId(item.id)}
            >
              <Text style={styles.orderTitle}>
                序号 {index + 1} · {item.household.contact.displayName}
              </Text>
              <Text>手机号：{item.household.contact.phone}</Text>
              <Text>地址：{item.household.addressText}</Text>
              <View style={styles.cardButtons}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => handleNavigate(item)}
                >
                  <Text style={styles.buttonText}>导航</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.doneButton]}
                  onPress={() => handleMarkDone(item)}
                >
                  <Text style={styles.buttonText}>已配送</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  mapWrapper: {
    height: 220,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    flex: 1,
  },
  webMap: {
    width: "100%",
    height: "100%",
  },
  mapHint: {
    fontSize: 12,
    color: "#c00",
    marginBottom: 8,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cardSelected: {
    borderColor: "#007bff",
    borderWidth: 2,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardButtons: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#007bff",
    marginLeft: 8,
  },
  doneButton: {
    backgroundColor: "#28a745",
  },
  buttonText: {
    color: "#fff",
  },
});
