import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---- Easy to change ----
const APP_NAME_MAIN = 'Learn SQL';
const APP_NAME_ACCENT = 'Offline';
const TAGLINE = 'Master databases anywhere, anytime. No internet needed.';
const HOME_ROUTE = '/(tabs)/home'; // <- change to your home page route

// Same theme as the rest of the app
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
};

const HIGHLIGHTS = [
  { icon: 'book', color: '#3B82F6', title: 'Structured lessons', text: 'From SQL basics to advanced topics, step by step.' },
  { icon: 'flask', color: '#22D3EE', title: 'Practice & quizzes', text: 'Test yourself with challenges and instant answers.' },
  { icon: 'cloud-offline', color: '#22C55E', title: '100% offline', text: 'Learn on the bus, on a flight, or anywhere at all.' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Entrance animations
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(24)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Gentle glow pulse behind the logo
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [fade, slide, pulse]);

  const handleStart = () => {
    // replace so the user can't go back to the welcome screen
    router.replace(HOME_ROUTE);
  };

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

      {/* Decorative glows */}
      <View
        className="absolute rounded-full"
        style={{ width: 320, height: 320, top: -120, right: -100, backgroundColor: 'rgba(34,211,238,0.08)' }}
      />
      <View
        className="absolute rounded-full"
        style={{ width: 280, height: 280, bottom: 120, left: -120, backgroundColor: 'rgba(59,130,246,0.12)' }}
      />

      <Animated.View
        style={{
          flex: 1,
          paddingTop: insets.top + 24,
          opacity: fade,
          transform: [{ translateY: slide }],
        }}
        className="px-6"
      >
        {/* --- LOGO + TITLE --- */}
        <View className="items-center mt-6">
          <View className="items-center justify-center">
            <Animated.View
              className="absolute rounded-full"
              style={{
                width: 150,
                height: 150,
                backgroundColor: 'rgba(34,211,238,0.14)',
                transform: [{ scale: pulse }],
              }}
            />
            <View
              className="p-5 rounded-[32px]"
              style={{
                backgroundColor: 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.45)',
                shadowColor: C.cyan,
                shadowOpacity: 0.4,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 12,
              }}
            >
              <Image
                source={require('../assets/images/icon.png')}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
          </View>

          <Text className="text-white text-3xl font-extrabold tracking-wide text-center mt-8">
            {APP_NAME_MAIN} <Text style={{ color: C.cyan }}>{APP_NAME_ACCENT}</Text>
          </Text>
          <Text
            className="text-sm text-center leading-relaxed mt-3 px-4"
            style={{ color: C.muted }}
          >
            {TAGLINE}
          </Text>
        </View>

        {/* --- HIGHLIGHTS --- */}
        <View className="mt-10">
          {HIGHLIGHTS.map((item) => (
            <View
              key={item.title}
              className="flex-row items-center p-3.5 mb-3 rounded-2xl"
              style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
            >
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mr-4"
                style={{
                  backgroundColor: item.color + '33',
                  borderWidth: 1,
                  borderColor: item.color + '88',
                }}
              >
                <Ionicons name={item.icon} size={20} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">{item.title}</Text>
                <Text className="text-xs mt-0.5 leading-relaxed" style={{ color: C.muted }}>
                  {item.text}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View className="flex-1" />

        {/* --- CTA --- */}
        <View style={{ paddingBottom: insets.bottom + 20 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStart}
            accessibilityRole="button"
            accessibilityLabel="Start learning"
            className="w-full py-4 rounded-2xl flex-row justify-center items-center"
            style={{
              backgroundColor: C.blue,
              borderWidth: 1,
              borderColor: 'rgba(34,211,238,0.6)',
              shadowColor: C.cyan,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 14,
              elevation: 8,
            }}
          >
            <Text className="text-white text-base font-bold mr-2">Start Learning</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>

          <Text className="text-center text-[11px] mt-3" style={{ color: C.muted }}>
            Free • No account needed • Works offline
          </Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}