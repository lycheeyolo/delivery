import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import Constants from "expo-constants";
import { getToken } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "Contacts">;

interface Contact {
  id: string;
  phone: string;
  displayName: string;
  remark?: string | null;
}

const apiBaseUrl =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  (Constants.manifest as any)?.extra?.apiBaseUrl;

export const ContactListScreen: React.FC<Props> = ({ navigation }) => {
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState<Contact[]>([]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="新建"
          onPress={() => navigation.navigate("NewContact")}
        />
      ),
    });
  }, [navigation]);

  const loadContacts = useCallback(async () => {
    try {
      const token = getToken();
      const res = await fetch(`${apiBaseUrl}/api/contacts?phone=${keyword}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      if (!res.ok) throw new Error("请求失败");
      const data = await res.json();
      setList(data);
    } catch (e: any) {
      showAlert("错误", e.message || "加载通讯录失败");
    }
  }, [keyword]);

  // 页面每次获得焦点时刷新一次（包括从新建联系人返回）
  useFocusEffect(
    useCallback(() => {
      loadContacts();
    }, [loadContacts]),
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="按手机号搜索"
        value={keyword}
        onChangeText={setKeyword}
        onSubmitEditing={loadContacts}
      />
      <FlatList
        data={list}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate("ContactDetail", { contactId: item.id })
            }
          >
            <Text style={styles.name}>{item.displayName}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
            {item.remark ? (
              <Text style={styles.remark} numberOfLines={2}>
                {item.remark}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  item: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  name: { fontSize: 16, fontWeight: "bold" },
  phone: { color: "#666", marginTop: 4 },
  remark: { color: "#888", fontSize: 13, marginTop: 4 },
});
