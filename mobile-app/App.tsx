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
import { ChangePasswordScreen } from "./src/screens/ChangePasswordScreen";
import { NewContactScreen } from "./src/screens/NewContactScreen";
import { MapPickerScreen } from "./src/screens/MapPickerScreen";
import { MapViewScreen } from "./src/screens/MapViewScreen";
import { DeliveryListScreen } from "./src/screens/DeliveryListScreen";
import { NewOrderScreen } from "./src/screens/NewOrderScreen";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Map: undefined;
  Contacts: undefined;
  ContactDetail: { contactId: string };
  NewContact: { pickedLat?: number; pickedLng?: number } | undefined;
  MapPicker: { initialLat?: number; initialLng?: number } | undefined;
  MapView: { lat: number; lng: number; title?: string };
  DeliveryList: undefined;
  NewOrder: undefined;
  Stats: undefined;
  Settings: undefined;
  ChangePassword: undefined;
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
        <Stack.Screen name="NewContact" component={NewContactScreen} options={{ title: "新建联系人" }} />
        <Stack.Screen name="MapPicker" component={MapPickerScreen} options={{ title: "地图选点" }} />
        <Stack.Screen name="MapView" component={MapViewScreen} options={{ title: "位置" }} />
        <Stack.Screen name="DeliveryList" component={DeliveryListScreen} options={{ title: "待配送列表" }} />
        <Stack.Screen name="NewOrder" component={NewOrderScreen} options={{ title: "新增任务" }} />
        <Stack.Screen name="Stats" component={StatsScreen} options={{ title: "统计" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "设置" }} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "修改密码" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

