import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { apiGetDailyStats } from "../services/api";

type Props = NativeStackScreenProps<RootStackParamList, "Stats">;

export const StatsScreen: React.FC<Props> = () => {
  const [date] = useState(() => new Date().toISOString().slice(0, 10));
  const [stats, setStats] = useState<{ total: number; done: number; pending: number } | null>(
    null
  );

  const load = async () => {
    try {
      const data = await apiGetDailyStats(date);
      setStats(data);
    } catch (e: any) {
      Alert.alert("错误", e.message || "加载统计失败");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>日期：{date}</Text>
      {stats && (
        <>
          <Text style={styles.item}>今日创建订单数：{stats.total}</Text>
          <Text style={styles.item}>已完成：{stats.done}</Text>
          <Text style={styles.item}>未完成：{stats.pending}</Text>
        </>
      )}
      <Button title="刷新" onPress={load} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  item: { fontSize: 16, marginBottom: 8 },
});

