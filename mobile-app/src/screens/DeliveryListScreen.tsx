import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Button,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiGetDeliveryList } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "DeliveryList">;

interface DeliveryNote {
  id: string;
  content: string;
}

interface OrderItem {
  id: string;
  status: string;
  household: {
    id: string;
    addressText: string;
    lat: number;
    lng: number;
    contact: {
      id: string;
      displayName: string;
      phone: string;
      remark?: string | null;
    };
  };
  notes: DeliveryNote[];
}

export const DeliveryListScreen: React.FC<Props> = ({ navigation }) => {
  const [list, setList] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadList = useCallback(async () => {
    try {
      const data = await apiGetDeliveryList();
      setList(data);
    } catch (e: any) {
      showAlert("错误", e.message || "加载列表失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 每次进入本页（含从新建任务返回）都刷新列表
  useFocusEffect(
    useCallback(() => {
      loadList();
    }, [loadList]),
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="新增任务"
          onPress={() => navigation.navigate("NewOrder")}
        />
      ),
    });
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const taskNoteText = (notes: DeliveryNote[]) =>
    notes.length > 0 ? notes.map((n) => n.content).join("；") : "—";

  return (
    <FlatList
      data={list}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadList();
          }}
        />
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.household.contact.displayName}</Text>
          <Text style={styles.phone}>{item.household.contact.phone}</Text>
          {item.household.contact.remark ? (
            <Text style={styles.remark} numberOfLines={2}>
              备注：{item.household.contact.remark}
            </Text>
          ) : null}
          <Text style={styles.address}>{item.household.addressText}</Text>
          <Text style={styles.taskNote}>
            任务备注：{taskNoteText(item.notes)}
          </Text>
          <View style={styles.statusRow}>
            <Text style={styles.status}>
              {item.status === "pending" ? "待配送" : "配送中"}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() =>
                  navigation.navigate("MapView", {
                    lat: item.household.lat,
                    lng: item.household.lng,
                    title: item.household.addressText,
                  })
                }
              >
                <Text style={styles.iconText}>📍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  navigation.navigate("ContactDetail", {
                    contactId: item.household.contact.id,
                  })
                }
              >
                <Text style={styles.detailText}>详情</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            暂无待配送任务，点击右上角「新增任务」添加
          </Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  listContent: { padding: 12, paddingBottom: 32 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: "bold" },
  phone: { fontSize: 14, color: "#666", marginTop: 4 },
  remark: { fontSize: 13, color: "#888", marginTop: 4 },
  address: { fontSize: 13, color: "#333", marginTop: 6 },
  taskNote: { fontSize: 13, color: "#555", marginTop: 6, fontStyle: "italic" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  status: { fontSize: 12, color: "#007bff" },
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  iconText: { fontSize: 18 },
  detailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
  detailText: { color: "#fff", fontSize: 13 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#888", fontSize: 14 },
});
