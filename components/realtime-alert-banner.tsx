import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Animated } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useRealtimeEvent, type RealtimeEvent } from "@/lib/realtime-sync";

interface AlertBannerProps {
  onDismiss?: () => void;
}

export function RealtimeAlertBanner({ onDismiss }: AlertBannerProps) {
  const colors = useColors();
  const [alert, setAlert] = useState<RealtimeEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  // Listen for alert events
  useRealtimeEvent("alert_created", (event) => {
    setAlert(event);
    setVisible(true);

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      dismissAlert();
    }, 5000);

    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const dismissAlert = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!alert) return null;

  const severity = alert.data.severity || "info";
  const backgroundColor =
    severity === "critical"
      ? colors.error
      : severity === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <View
        className="flex-row items-center justify-between px-4 py-3 gap-3"
        style={{ backgroundColor }}
      >
        <View className="flex-1">
          <Text className="text-sm font-semibold text-background">
            {alert.data.message}
          </Text>
        </View>
        <Pressable onPress={dismissAlert} className="px-2 py-1">
          <Text className="text-lg text-background font-bold">✕</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
