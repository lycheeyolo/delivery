import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Button,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { NavStackParamList } from "../../App";
import { apiCreateContact } from "../services/api";
import { showAlert } from "../utils/alert";

type Props = NativeStackScreenProps<NavStackParamList, "NewContact">;

export const NewContactScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pickedLat, pickedLng, returnTo } = route.params || {};
  const [phone, setPhone] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [remark, setRemark] = useState("");
  const [addressText, setAddressText] = useState("");
  const [doorplate, setDoorplate] = useState("");
  const [householdNote, setHouseholdNote] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pickedLat != null && pickedLng != null) {
      setLat(pickedLat);
      setLng(pickedLng);
    }
  }, [pickedLat, pickedLng]);

  const goMapPicker = () => {
    navigation.navigate("MapPicker", {
      initialLat: lat ?? undefined,
      initialLng: lng ?? undefined,
    });
  };

  const handleSubmit = async () => {
    if (!phone.trim() || !displayName.trim()) {
      showAlert("提示", "请填写手机号和姓名");
      return;
    }
    const payload: Parameters<typeof apiCreateContact>[0] = {
      phone: phone.trim(),
      displayName: displayName.trim(),
      remark: remark.trim() || undefined,
    };
    if (lat != null && lng != null) {
      payload.household = {
        addressText: addressText.trim() || `${lat}, ${lng}`,
        lat,
        lng,
        doorplate: doorplate.trim() || undefined,
        note: householdNote.trim() || undefined,
      };
    }
    try {
      setLoading(true);
      await apiCreateContact(payload);
      showAlert("成功", "联系人已添加");
      if (returnTo === "NewOrder") {
        // 从新增任务进入时，保存后明确回到新增任务界面
        navigation.navigate("NewOrder");
      } else {
        // 其他场景（如通讯录）保持返回上一个页面的逻辑
        navigation.goBack();
      }
    } catch (e: any) {
      showAlert("添加失败", e.message || "请稍后再试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>基本信息</Text>
      <TextInput
        style={styles.input}
        placeholder="姓名 *"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TextInput
        style={styles.input}
        placeholder="手机号 *"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="联系人备注（选填）"
        value={remark}
        onChangeText={setRemark}
        multiline
      />

      <Text style={styles.sectionTitle}>地址与定位</Text>
      <TextInput
        style={styles.input}
        placeholder="详细地址（选填，可地图选点后填写）"
        value={addressText}
        onChangeText={setAddressText}
      />
      <TouchableOpacity style={styles.mapBtn} onPress={goMapPicker}>
        <Text style={styles.mapBtnText}>地图选点</Text>
      </TouchableOpacity>
      {lat != null && lng != null && (
        <Text style={styles.coords}>
          已选坐标：{lat.toFixed(5)}, {lng.toFixed(5)}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="门牌号（选填）"
        value={doorplate}
        onChangeText={setDoorplate}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="该地址备注（选填）"
        value={householdNote}
        onChangeText={setHouseholdNote}
        multiline
      />

      <Button
        title={loading ? "提交中..." : "保存联系人"}
        onPress={handleSubmit}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  textArea: { minHeight: 60 },
  mapBtn: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  mapBtnText: { color: "#fff", fontWeight: "bold" },
  coords: { fontSize: 12, color: "#666", marginBottom: 12 },
});
