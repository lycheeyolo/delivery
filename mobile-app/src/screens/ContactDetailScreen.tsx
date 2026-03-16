import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiGetContact, apiDeleteContact } from "../services/api";
import { showAlert, showConfirm } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "ContactDetail">;

interface Household {
  id: string;
  addressText: string;
  lat: number;
  lng: number;
  doorplate?: string | null;
  note?: string | null;
}

interface ContactDetail {
  id: string;
  phone: string;
  displayName: string;
  remark?: string | null;
  households: Household[];
}

export const ContactDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contactId } = route.params;
  const [contact, setContact] = useState<ContactDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContact = async () => {
    try {
      setLoading(true);
      const data = await apiGetContact(contactId);
      setContact(data);
    } catch (e: any) {
      showAlert("错误", e.message || "加载联系人失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContact();
  }, [contactId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (!contact) {
    return (
      <View style={styles.center}>
        <Text style={styles.hint}>未找到联系人</Text>
      </View>
    );
  }

  const openMap = (h: Household) => {
    navigation.navigate("MapView", {
      lat: h.lat,
      lng: h.lng,
      title: h.addressText || `${contact.displayName} 地址`,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>联系人详情</Text>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => {
            showConfirm(
              "确认删除",
              "删除联系人将同时删除其所有地址和相关任务记录，确定要删除吗？",
              async () => {
                try {
                  await apiDeleteContact(contact.id);
                  showAlert("成功", "联系人已删除");
                  navigation.goBack();
                } catch (e: any) {
                  showAlert("删除失败", e.message || "请稍后重试");
                }
              },
              { cancelText: "取消", confirmText: "删除" },
            );
          }}
        >
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本信息</Text>
        <Text style={styles.label}>姓名</Text>
        <Text style={styles.value}>{contact.displayName}</Text>
        <Text style={styles.label}>手机号</Text>
        <Text style={styles.value}>{contact.phone}</Text>
        {contact.remark ? (
          <>
            <Text style={styles.label}>备注</Text>
            <Text style={styles.value}>{contact.remark}</Text>
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>家庭地址</Text>
        {contact.households.length === 0 ? (
          <Text style={styles.empty}>暂无地址</Text>
        ) : (
          contact.households.map((h) => (
            <View key={h.id} style={styles.card}>
              <Text style={styles.address}>{h.addressText}</Text>
              {h.doorplate ? (
                <Text style={styles.meta}>门牌：{h.doorplate}</Text>
              ) : null}
              {h.note ? <Text style={styles.meta}>备注：{h.note}</Text> : null}
              <TouchableOpacity
                style={styles.locationBtn}
                onPress={() => openMap(h)}
              >
                <Text style={styles.locationBtnText}>📍 在地图中查看</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  hint: { color: "#666" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f8d7da",
  },
  deleteText: { color: "#c00", fontSize: 14 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  label: { fontSize: 13, color: "#666", marginTop: 8 },
  value: { fontSize: 16, marginTop: 4 },
  empty: { color: "#888", fontSize: 14 },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  address: { fontSize: 15, fontWeight: "500" },
  meta: { fontSize: 13, color: "#666", marginTop: 4 },
  locationBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#e8f4ff",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  locationBtnText: { color: "#007bff", fontSize: 14 },
});
