import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";

import { LoginScreen } from "./src/screens/LoginScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ContactListScreen } from "./src/screens/ContactListScreen";
import { ContactDetailScreen } from "./src/screens/ContactDetailScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Map: undefined;
  Contacts: undefined;
  ContactDetail: { contactId: number };
  Stats: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: "登录" }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "注册" }} />
        <Stack.Screen name="Map" component={MapScreen} options={{ title: "配送地图" }} />
        <Stack.Screen name="Contacts" component={ContactListScreen} options={{ title: "通讯录" }} />
        <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ title: "家庭详情" }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: "统计" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "设置" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

