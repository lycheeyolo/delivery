import React, { useEffect, useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import Constants from "expo-constants";
import { getToken } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Contacts">;

interface Contact {
  id: number;
  phone: string;
  displayName: string;
}

const apiBaseUrl =
  (Constants.expoConfig?.extra as any)?.apiBaseUrl ||
  (Constants.manifest as any)?.extra?.apiBaseUrl;

export const ContactListScreen: React.FC<Props> = ({ navigation }) => {
  const [keyword, setKeyword] = useState("");
  const [list, setList] = useState<Contact[]>([]);

  const loadContacts = async () => {
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
      Alert.alert("错误", e.message || "加载通讯录失败");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

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
            onPress={() => navigation.navigate("ContactDetail", { contactId: item.id })}
          >
            <Text style={styles.name}>{item.displayName}</Text>
            <Text style={styles.phone}>{item.phone}</Text>
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
});

