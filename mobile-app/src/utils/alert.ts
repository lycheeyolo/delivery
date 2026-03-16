import { Alert, Platform } from "react-native";

export function showAlert(title: string, message: string) {
  // 无论什么平台，都先打一条日志，方便在浏览器控制台或开发工具看到
  // eslint-disable-next-line no-console
  console.log(`[ALERT] ${title}: ${message}`);

  if (Platform.OS === "web") {
    const text = `${title}\n${message}`;
    // RN Web 下有时 window 不是全局，可以用 globalThis 兜底
    const anyGlobal = globalThis as any;
    if (typeof anyGlobal.alert === "function") {
      anyGlobal.alert(text);
    }
  } else {
    Alert.alert(title, message);
  }
}

export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  options?: { cancelText?: string; confirmText?: string },
) {
  const cancelText = options?.cancelText ?? "取消";
  const confirmText = options?.confirmText ?? "确定";

  if (Platform.OS === "web") {
    const text = `${title}\n${message}`;
    const anyGlobal = globalThis as any;
    if (typeof anyGlobal.confirm === "function") {
      const ok = anyGlobal.confirm(text);
      if (ok) onConfirm();
      return;
    }
  }

  Alert.alert(title, message, [
    { text: cancelText, style: "cancel" },
    { text: confirmText, style: "destructive", onPress: onConfirm },
  ]);
}
