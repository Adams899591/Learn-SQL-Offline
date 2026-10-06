import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Same theme as the rest of the app
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
};

// ---- Easy to change ----
const COLUMNS = 4; // 4 = one row of four cards, 2 = a 2x2 grid
const GAP = 10;
const H_PADDING = 20;

// Change these routes to match your app
const QUICK_ACTIONS = [
  { id: 'lessons', label: 'Lessons', icon: 'book', color: '#3B82F6', route: '/lessons' },
  { id: 'quiz', label: 'Quiz', icon: 'help-circle', color: '#8B5CF6', route: '/quiz' },
  { id: 'create-table', label: 'Create Table', icon: 'grid', color: '#22C55E', route: '/create-table' },
  { id: 'settings', label: 'Settings', icon: 'settings', color: '#F59E0B', route: '/settings' },
];

// Where "Continue learning" should take the user
const CONTINUE_ROUTE = '/screen/module1';

// Hook these up to your store later
const PROGRESS = { completed: 0, total: 38 };
const STATS = [
  { icon: 'layers-outline', value: '6', label: 'Sections' },
  { icon: 'list-outline', value: String(PROGRESS.total), label: 'Topics' },
  { icon: 'checkmark-done-outline', value: String(PROGRESS.completed), label: 'Completed' },
];

const TOPICS = ['SELECT', 'WHERE', 'JOIN', 'GROUP BY', 'Subqueries', 'Indexes', 'Transactions'];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const tileWidth = (width - H_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;
  const progress = PROGRESS.total ? PROGRESS.completed / PROGRESS.total : 0;
  const pct = Math.round(progress * 100);

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(59,130,246,0.45)" />
      {/* <StatusBar barStyle="light-content" backgroundColor="#020A2A" /> */}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- HERO --- */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: H_PADDING,
            paddingBottom: 56,
            borderBottomLeftRadius: 40,
            borderBottomRightRadius: 40,
            borderBottomWidth: 1,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: C.border,
            backgroundColor: 'rgba(30,64,175,0.28)',
            shadowColor: C.blue,
            shadowOpacity: 0.35,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 10,
            overflow: 'hidden',
          }}
        >
          <View
            className="absolute rounded-full"
            style={{ width: 220, height: 220, top: -80, right: -60, backgroundColor: 'rgba(34,211,238,0.10)' }}
          />

          <View className="flex-row items-center">
            <View
              className="p-2.5 rounded-2xl mr-3"
              style={{
                backgroundColor: 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.4)',
              }}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium" style={{ color: C.muted }}>Welcome back 👋</Text>
              <Text className="text-white text-lg font-extrabold tracking-wide">
                Learn SQL <Text style={{ color: C.cyan }}>Offline</Text>
              </Text>
            </View>
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.4)',
              }}
            >
              <Ionicons name="cloud-offline-outline" size={13} color={C.cyan} />
              <Text className="text-[10px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>Offline</Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-extrabold mt-6">
            Ready to write your{'\n'}
            <Text style={{ color: C.cyan }}>next query?</Text>
          </Text>
          <Text className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>
            Pick up where you left off or jump into something new.
          </Text>
        </View>

        <View style={{ paddingHorizontal: H_PADDING, marginTop: -32 }}>
          {/* --- CONTINUE LEARNING CARD --- */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push(CONTINUE_ROUTE)}
            accessibilityRole="button"
            accessibilityLabel="Continue learning"
            className="rounded-3xl p-4"
            style={{
              backgroundColor: '#061552',
              borderWidth: 1,
              borderColor: C.border,
              shadowColor: C.blue,
              shadowOpacity: 0.3,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: '#3B82F633', borderWidth: 1, borderColor: '#3B82F688' }}
              >
                <Ionicons name="play" size={22} color={C.blue} />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.muted }}>
                  Continue learning
                </Text>
                <Text className="text-white font-bold text-base mt-0.5">SQL Basics</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={C.muted} />
            </View>

            <View className="flex-row items-center mt-4">
              <View
                className="flex-1 h-2 rounded-full overflow-hidden mr-3"
                style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: C.cyan }}
                />
              </View>
              <Text className="text-xs font-semibold" style={{ color: '#BFD3FF' }}>{pct}%</Text>
            </View>
          </TouchableOpacity>

          {/* --- STATS --- */}
          <View className="flex-row mt-4" style={{ gap: GAP }}>
            {STATS.map((s) => (
              <View
                key={s.label}
                className="flex-1 items-center py-3 rounded-2xl"
                style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
              >
                <Ionicons name={s.icon} size={18} color={C.cyan} />
                <Text className="text-white text-base font-extrabold mt-1">{s.value}</Text>
                <Text className="text-[11px]" style={{ color: C.muted }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* --- QUICK ACTIONS --- */}
          <Text
            className="text-xs font-bold uppercase tracking-wider mt-8 mb-3 px-1"
            style={{ color: C.muted }}
          >
            Quick actions
          </Text>

          <View className="flex-row flex-wrap" style={{ gap: GAP }}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity
                key={a.id}
                activeOpacity={0.85}
                onPress={() => router.push(a.route)}
                accessibilityRole="button"
                accessibilityLabel={a.label}
                className="items-center justify-center rounded-2xl py-4 px-1"
                style={{
                  width: tileWidth,
                  backgroundColor: C.glass,
                  borderWidth: 1,
                  borderColor: C.border,
                }}
              >
                <View
                  className="w-11 h-11 rounded-xl items-center justify-center mb-2"
                  style={{
                    backgroundColor: a.color + '33',
                    borderWidth: 1,
                    borderColor: a.color + '88',
                  }}
                >
                  <Ionicons name={a.icon} size={20} color={a.color} />
                </View>
                <Text
                  className="text-white text-[11px] font-semibold text-center"
                  numberOfLines={2}
                >
                  {a.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- POPULAR TOPICS --- */}
          <Text
            className="text-xs font-bold uppercase tracking-wider mt-8 mb-3 px-1"
            style={{ color: C.muted }}
          >
            Popular topics
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -H_PADDING }}>
            <View className="flex-row" style={{ paddingHorizontal: H_PADDING, gap: 8 }}>
              {TOPICS.map((t) => (
                <View
                  key={t}
                  className="px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: 'rgba(34,211,238,0.10)',
                    borderWidth: 1,
                    borderColor: 'rgba(34,211,238,0.35)',
                  }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#BFD3FF' }}>{t}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* --- TIP CARD --- */}
          <View
            className="flex-row items-start p-4 mt-8 rounded-2xl"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#F59E0B33', borderWidth: 1, borderColor: '#F59E0B88' }}
            >
              <Ionicons name="bulb" size={18} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">Tip of the day</Text>
              <Text className="text-xs mt-1 leading-relaxed" style={{ color: C.muted }}>
                Always use a WHERE clause with UPDATE and DELETE, otherwise you'll change every row in the table.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}