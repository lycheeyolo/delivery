import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Button } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiChangePassword } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<RootStackParamList, "ChangePassword">;

export const ChangePasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert("提示", "请填写新密码和确认密码");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("提示", "两次输入的新密码不一致");
      return;
    }
    try {
      setLoading(true);
      await apiChangePassword({ oldPassword, newPassword });
      showAlert("成功", "密码修改成功");
      navigation.goBack();
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      showAlert("修改失败", e.message || "请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>修改密码</Text>
      <TextInput
        style={styles.input}
        placeholder="旧密码"
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="新密码"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="确认新密码"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button
        title={loading ? "提交中..." : "提交"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
});
