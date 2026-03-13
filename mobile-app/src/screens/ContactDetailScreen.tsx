import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "ContactDetail">;

export const ContactDetailScreen: React.FC<Props> = ({ route }) => {
  const { contactId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>联系人 ID：{contactId}</Text>
      <Text>这里可以扩展展示该联系人所有家庭地址、历史配送记录等。</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
});

