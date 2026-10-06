import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


// Learn SQL Offline theme (swap these values to re-theme the whole tab bar)
const ACTIVE = '#22D3EE'; // cyan
const ACTIVE_SOFT = 'rgba(34, 211, 238, 0.14)';
const INACTIVE = '#93A4C7';
const BAR_BG = '#020A2A'; // deep navy
const GLOW = '#3B82F6'; // blue


type IconName = React.ComponentProps<typeof Ionicons>['name'];

/**
 * Tab icon with a soft pill that springs in behind it when the tab is focused.
 * Uses the built-in Animated API with the native driver, so no extra packages are needed.
 */
function AnimatedTabIcon({
  focused,
  color,
  name,
  outlineName,
}: {
  focused: boolean;
  color: string;
  name: IconName;
  outlineName: IconName;
}) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  }, [focused, progress]);

  // The pill grows sideways and fades in
  const pillScaleX = progress.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const pillOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // The icon lifts and pops slightly (the spring gives it a small bounce)
  const iconScale = progress.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const iconLift = progress.interpolate({ inputRange: [0, 1], outputRange: [0, -1] });

  return (
    <View style={styles.iconWrap}>
      <Animated.View
        style={[styles.pill, { opacity: pillOpacity, transform: [{ scaleX: pillScaleX }] }]}
      />
      <Animated.View style={{ transform: [{ translateY: iconLift }, { scale: iconScale }] }}>
        <Ionicons name={focused ? name : outlineName} size={22} color={color} />
      </Animated.View>
    </View>
  );
}

const tabIcon =
  (name: IconName, outlineName: IconName) =>
  ({ color, focused }: { color: string; focused: boolean }) =>
    <AnimatedTabIcon focused={focused} color={color} name={name} outlineName={outlineName} />;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: styles.label,
        tabBarStyle: {
          backgroundColor: BAR_BG,
          borderTopWidth: 0,
          // borderTopLeftRadius: 24,
          // borderTopRightRadius: 24,
          height: 60 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          // soft shadow lifting the bar off the content
          shadowColor: GLOW,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 16,
        },
      }}
      screenListeners={{
        tabPress: () => {
          // A light haptic on every tab press
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="lessons"
        options={{ title: 'Lessons', tabBarIcon: tabIcon('book', 'book-outline') }}
      />
      <Tabs.Screen
        name="quiz"
        options={{ title: 'Quiz', tabBarIcon: tabIcon('help-circle', 'help-circle-outline') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 56,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 15,
    backgroundColor: ACTIVE_SOFT,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});