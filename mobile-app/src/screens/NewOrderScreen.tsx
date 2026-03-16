import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { apiGetContacts, apiCreateOrder } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "NewOrder">;

interface Household {
  id: string;
  addressText: string;
  doorplate?: string | null;
  note?: string | null;
}

interface ContactItem {
  id: string;
  displayName: string;
  phone: string;
  remark?: string | null;
  households: Household[];
}

export const NewOrderScreen: React.FC<Props> = ({ navigation }) => {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [step, setStep] = useState<"contact" | "household">("contact");
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(
    null,
  );
  const [taskNote, setTaskNote] = useState("");

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGetContacts();
      setContacts(data);
    } catch (e: any) {
      showAlert("错误", e.message || "加载通讯录失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // 从新建联系人返回时也自动刷新联系人列表
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts]),
  );

  const handleSelectContact = (c: ContactItem) => {
    if (!c.households || c.households.length === 0) {
      showAlert("提示", "该联系人暂无地址，请先在联系人详情中添加地址");
      navigation.navigate("ContactDetail", { contactId: c.id });
      return;
    }
    setSelectedContact(c);
    setStep("household");
    setTaskNote("");
  };

  const handleCreateOrder = async (householdId: string) => {
    try {
      setSubmitLoading(true);
      await apiCreateOrder({
        householdId,
        taskNote: taskNote.trim() || undefined,
      });
      showAlert("成功", "任务已添加");
      navigation.navigate("DeliveryList");
    } catch (e: any) {
      showAlert("添加失败", e.message || "请稍后重试");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (step === "household" && selectedContact) {
    const list = selectedContact.households;
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            setStep("contact");
            setSelectedContact(null);
          }}
        >
          <Text style={styles.backText}>← 重新选择联系人</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          选择地址（{selectedContact.displayName}）
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="本次任务备注（选填）"
          value={taskNote}
          onChangeText={setTaskNote}
          multiline
        />
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleCreateOrder(item.id)}
              disabled={submitLoading}
            >
              <Text style={styles.address}>{item.addressText}</Text>
              {item.doorplate ? (
                <Text style={styles.meta}>门牌：{item.doorplate}</Text>
              ) : null}
              {item.note ? (
                <Text style={styles.meta}>备注：{item.note}</Text>
              ) : null}
              <Text style={styles.addBtn}>
                {submitLoading ? "提交中..." : "添加为配送任务"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>选择联系人</Text>
        <Button
          title="新建联系人"
          onPress={() => navigation.navigate("NewContact")}
        />
      </View>
      <FlatList
        data={contacts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectContact(item)}
          >
            <Text style={styles.name}>{item.displayName}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            {item.remark ? (
              <Text style={styles.remark} numberOfLines={2}>
                {item.remark}
              </Text>
            ) : null}
            <Text style={styles.hint}>
              {item.households?.length
                ? `共 ${item.households.length} 个地址`
                : "暂无地址"}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>暂无联系人，请先在通讯录中添加</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  backRow: { marginBottom: 12 },
  backText: { color: "#007bff", fontSize: 14 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { minHeight: 60 },
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
  hint: { fontSize: 12, color: "#999", marginTop: 4 },
  address: { fontSize: 15 },
  meta: { fontSize: 13, color: "#666", marginTop: 4 },
  addBtn: { color: "#007bff", marginTop: 8, fontWeight: "500" },
  empty: { color: "#888", padding: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
});
