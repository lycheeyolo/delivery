import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";

import { LoginScreen } from "./src/screens/LoginScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ContactListScreen } from "./src/screens/ContactListScreen";
import { ContactDetailScreen } from "./src/screens/ContactDetailScreen";
import { NewContactScreen } from "./src/screens/NewContactScreen";
import { MapPickerScreen } from "./src/screens/MapPickerScreen";
import { MapViewScreen } from "./src/screens/MapViewScreen";
import { DeliveryListScreen } from "./src/screens/DeliveryListScreen";
import { NewOrderScreen } from "./src/screens/NewOrderScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { StatsScreen } from "./src/screens/StatsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ChangePasswordScreen } from "./src/screens/ChangePasswordScreen";

// 根 Stack：仅登录/注册/主界面
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

// 底部三栏
export type MainTabParamList = {
  Nav: undefined;
  Contacts: undefined;
  Home: undefined;
};

// 导航栏 Stack：地图 + 待配送
export type NavStackParamList = {
  Map: undefined;
  DeliveryList: undefined;
  NewOrder: undefined;
  MapView: { lat: number; lng: number; title?: string };
  ContactDetail: { contactId: string };
  NewContact: { pickedLat?: number; pickedLng?: number; returnTo?: "NewOrder" } | undefined;
  MapPicker: { initialLat?: number; initialLng?: number } | undefined;
};

// 通讯录 Stack
export type ContactsStackParamList = {
  ContactList: undefined;
  ContactDetail: { contactId: string };
  NewContact: { pickedLat?: number; pickedLng?: number; returnTo?: "NewOrder" } | undefined;
  MapPicker: { initialLat?: number; initialLng?: number } | undefined;
  MapView: { lat: number; lng: number; title?: string };
};

// 我的 Stack
export type HomeStackParamList = {
  Profile: undefined;
  Stats: undefined;
  Settings: undefined;
  ChangePassword: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const MainTabs = createBottomTabNavigator<MainTabParamList>();
const NavStack = createNativeStackNavigator<NavStackParamList>();
const ContactsStack = createNativeStackNavigator<ContactsStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

function NavStackScreen() {
  return (
    <NavStack.Navigator>
      <NavStack.Screen name="Map" component={MapScreen} options={{ title: "配送地图" }} />
      <NavStack.Screen name="DeliveryList" component={DeliveryListScreen} options={{ title: "待配送列表" }} />
      <NavStack.Screen name="NewOrder" component={NewOrderScreen} options={{ title: "新增任务" }} />
      <NavStack.Screen name="MapView" component={MapViewScreen} options={{ title: "位置" }} />
      <NavStack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ title: "家庭详情" }} />
      <NavStack.Screen name="NewContact" component={NewContactScreen} options={{ title: "新建联系人" }} />
      <NavStack.Screen name="MapPicker" component={MapPickerScreen} options={{ title: "地图选点" }} />
    </NavStack.Navigator>
  );
}

function ContactsStackScreen() {
  return (
    <ContactsStack.Navigator>
      <ContactsStack.Screen name="ContactList" component={ContactListScreen} options={{ title: "通讯录" }} />
      <ContactsStack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ title: "家庭详情" }} />
      <ContactsStack.Screen name="NewContact" component={NewContactScreen} options={{ title: "新建联系人" }} />
      <ContactsStack.Screen name="MapPicker" component={MapPickerScreen} options={{ title: "地图选点" }} />
      <ContactsStack.Screen name="MapView" component={MapViewScreen} options={{ title: "位置" }} />
    </ContactsStack.Navigator>
  );
}

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Profile" component={ProfileScreen} options={{ title: "我的" }} />
      <HomeStack.Screen name="Stats" component={StatsScreen} options={{ title: "统计" }} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: "设置" }} />
      <HomeStack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "修改密码" }} />
    </HomeStack.Navigator>
  );
}

function MainTabsScreen() {
  return (
    <MainTabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007bff",
        tabBarInactiveTintColor: "#666",
      }}
    >
      <MainTabs.Screen
        name="Nav"
        component={NavStackScreen}
        options={{ tabBarLabel: "导航", tabBarIcon: () => null }}
      />
      <MainTabs.Screen
        name="Contacts"
        component={ContactsStackScreen}
        options={{ tabBarLabel: "通讯录", tabBarIcon: () => null }}
      />
      <MainTabs.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: "我的", tabBarIcon: () => null }}
      />
    </MainTabs.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootStack.Navigator initialRouteName="Login" screenOptions={{ headerShown: true }}>
        <RootStack.Screen name="Login" component={LoginScreen} options={{ title: "登录" }} />
        <RootStack.Screen name="Register" component={RegisterScreen} options={{ title: "注册" }} />
        <RootStack.Screen name="Main" component={MainTabsScreen} options={{ headerShown: false }} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
