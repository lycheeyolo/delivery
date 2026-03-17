import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { CommonActions } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { HomeStackParamList } from "../../App";
import { apiGetProfile, apiUpdateProfile, clearToken } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<HomeStackParamList, "Settings">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const me = await apiGetProfile();
      setName(me.name || "");
      setPhone(me.phone || "");
      setCreatedAt(me.createdAt || null);
    } catch (e: any) {
      showAlert("错误", e.message || "加载个人信息失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await apiUpdateProfile({ name, phone });
      showAlert("成功", "个人信息已更新");
    } catch (e: any) {
      showAlert("更新失败", e.message || "请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearToken();
    let nav: any = navigation;
    while (nav?.getParent()) nav = nav.getParent();
    if (nav) nav.dispatch(CommonActions.reset({ index: 0, routes: [{ name: "Login" }] }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>个人主页</Text>
      <TextInput
        style={styles.input}
        placeholder="姓名"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="手机号"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      {createdAt && (
        <Text style={styles.meta}>
          注册时间：{new Date(createdAt).toLocaleString()}
        </Text>
      )}
      <Button
        title={loading ? "保存中..." : "保存修改"}
        onPress={handleSave}
        disabled={loading}
      />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>账号安全</Text>
        <Button
          title="修改密码"
          onPress={() => navigation.navigate("ChangePassword")}
        />
      </View>
      <View style={styles.logoutWrapper}>
        <Button title="退出登录" color="#d9534f" onPress={handleLogout} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  meta: {
    fontSize: 12,
    color: "#666",
    marginBottom: 16,
  },
  logoutWrapper: {
    marginTop: 24,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
