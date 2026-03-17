import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { getCustomApiBaseUrl, setCustomApiBaseUrl } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "SettingsConfig">;

export const BackendConfigScreen: React.FC<Props> = () => {
  const [backendUrl, setBackendUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentCustomUrl, setCurrentCustomUrl] = useState<string | null>(null);

  useEffect(() => {
    // 初始不在输入框展示地址，避免泄露默认后端信息
    setBackendUrl("");
    setCurrentCustomUrl(getCustomApiBaseUrl());
  }, []);

  const handleSave = async () => {
    const trimmed = backendUrl.trim();
    if (!trimmed) {
      showAlert("保存失败", "请输入后端地址，或点击下方“使用默认后端地址”按钮。");
      return;
    }
    // 简单校验：要求以 http:// 或 https:// 开头，且后面至少有一个字符
    const ok =
      /^https?:\/\/[^\s]+$/i.test(trimmed) &&
      trimmed.length > "http://".length;
    if (!ok) {
      showAlert("保存失败", "请输入合法的后端地址，例如：http://192.168.0.10:3000");
      return;
    }
    try {
      setSaving(true);
      await setCustomApiBaseUrl(trimmed);
      showAlert("成功", "后端地址已更新");
      setCurrentCustomUrl(trimmed);
      setBackendUrl("");
    } catch (e: any) {
      showAlert("保存失败", e?.message || "请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setBackendUrl("");
    await setCustomApiBaseUrl(null);
    showAlert("成功", "已恢复默认后端地址");
    setCurrentCustomUrl(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>自定义后端地址</Text>
      <Text style={styles.current}>
        {currentCustomUrl
          ? `当前使用后端地址：${currentCustomUrl}`
          : "当前使用默认后端地址"}
      </Text>
      <TextInput
        style={styles.input}
        placeholder="例如：http://192.168.0.10:3000"
        autoCapitalize="none"
        autoCorrect={false}
        value={backendUrl}
        onChangeText={setBackendUrl}
      />
      <Button
        title={saving ? "保存中..." : "保存后端地址"}
        onPress={handleSave}
        disabled={saving}
      />
      <View style={styles.resetWrapper}>
        <Button title="使用默认后端地址" onPress={handleReset} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 14, color: "#333", marginBottom: 4 },
  current: { fontSize: 13, color: "#666", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  resetWrapper: { marginTop: 12 },
});

