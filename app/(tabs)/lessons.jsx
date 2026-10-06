// import React from 'react'
// import { Text } from 'react-native'

// function lesson() {
//   return (
//     <Text>this is the lesson screen </Text>
//   )
// }

// export default lesson



import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import router for navigation
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Learn SQL Offline theme
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
};

// Each section has a 'screen' property to map to your detail pages
// 'completed' is how many topics the user has finished (connect it to your store later)
const curriculumList = [
  {
    id: '1',
    title: 'SQL Basics',
    icon: 'server',
    color: '#3B82F6',
    completed: 0,
    topics: ['What is SQL?', 'Databases and tables', 'Rows and columns', 'SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    screen: '/screen/module1',
  },
  {
    id: '2',
    title: 'Queries',
    icon: 'code-slash',
    color: '#22C55E',
    completed: 0,
    topics: ['WHERE', 'ORDER BY', 'LIMIT', 'DISTINCT', 'LIKE', 'IN', 'BETWEEN'],
    screen: '/screen/module2',
  },
  {
    id: '3',
    title: 'Intermediate SQL',
    icon: 'git-merge',
    color: '#8B5CF6',
    completed: 0,
    topics: ['JOIN', 'GROUP BY', 'HAVING', 'Aggregate functions', 'Subqueries'],
    screen: '/screen/module3',
  },
  {
    id: '4',
    title: 'Advanced SQL',
    icon: 'rocket',
    color: '#F59E0B',
    completed: 0,
    topics: ['Relationships', 'Indexes', 'Views', 'Transactions', 'Constraints', 'Stored procedures'],
    screen: '/screen/module4',
  },
  {
    id: '5',
    title: 'Practice',
    icon: 'flask',
    color: '#22D3EE',
    completed: 0,
    topics: ['Quizzes', 'SQL challenges', 'Write the query exercises', 'Answers and explanations'],
    screen: '/screen/module5',
  },
  {
    id: '6',
    title: 'Database-Specific',
    icon: 'cube',
    color: '#EC4899',
    completed: 0,
    topics: ['MySQL', 'PostgreSQL', 'SQLite'],
    screen: '/screen/module6',
  },
];

const totalTopics = curriculumList.reduce((sum, s) => sum + s.topics.length, 0);

export default function LessonsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="rgba(59,130,246,0.45)" />

      {/* --- PROFESSIONAL HERO SECTION --- */}
      <View
        style={{
          paddingTop: insets.top + 8,
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
        }}
        className="pb-8 px-5"
      >
        <View className="flex-row items-center mb-4">
          <View
            className="p-3 rounded-2xl mr-4"
            style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' }}
          >
            <Image
              source={require('../../assets/images/icon.png')}
              className="w-12 h-12"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <Text className="text-white text-xl font-extrabold tracking-wide">
              Learn SQL <Text style={{ color: C.cyan }}>Offline</Text>
            </Text>
            <Text className="text-xs font-medium" style={{ color: C.muted }}>
              Your offline companion to mastering databases
            </Text>
          </View>
        </View>

        <View
          className="p-3.5 rounded-2xl mb-4"
          style={{ backgroundColor: 'rgba(2,10,42,0.45)', borderWidth: 1, borderColor: C.border }}
        >
          <Text className="text-xs leading-relaxed font-normal" style={{ color: '#CBD5E1' }}>
            Learn how to store, query and manage data with SQL. Designed for beginners and growing developers, this app gives you structured lessons, clear concepts, quizzes and a built-in playground to practice real queries, completely offline.
          </Text>
        </View>

        <View className="flex-row items-center justify-between px-1">
          <View className="flex-row items-center">
            <Ionicons name="book-outline" size={14} color={C.cyan} />
            <Text className="text-[11px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>
              {curriculumList.length} Sections
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="list-outline" size={14} color={C.cyan} />
            <Text className="text-[11px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>
              {totalTopics} Topics
            </Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="cloud-offline-outline" size={14} color={C.cyan} />
            <Text className="text-[11px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>
              100% Offline
            </Text>
          </View>
        </View>
      </View>

      {/* --- SCROLLABLE CURRICULUM LIST --- */}
      <ScrollView className="flex-1 px-4 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-bold uppercase tracking-wider mb-3 px-1" style={{ color: C.muted }}>
          Curriculum
        </Text>

        {curriculumList.map((item) => {
          const progress = item.completed / item.topics.length;
          const preview = item.topics.slice(0, 3).join('  •  ');
          const more = item.topics.length - 3;

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.85}
              onPress={() => router.push(item.screen)} // Pushes to the corresponding section screen
              className="flex-row items-center p-3.5 mb-3 rounded-2xl"
              style={{
                backgroundColor: C.glass,
                borderWidth: 1,
                borderColor: C.border,
              }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: item.color + '33', borderWidth: 1, borderColor: item.color + '88' }}
              >
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>

              <View className="flex-1">
                <Text className="text-white font-bold text-sm">{item.title}</Text>
                <Text className="text-xs mt-0.5" numberOfLines={1} style={{ color: C.muted }}>
                  {preview}{more > 0 ? `  +${more} more` : ''}
                </Text>

                <View className="flex-row items-center mt-2">
                  <View
                    className="flex-1 h-1.5 rounded-full overflow-hidden mr-2"
                    style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}
                  >
                    <View
                      className="h-full rounded-full"
                      style={{ width: `${progress * 100}%`, backgroundColor: item.color }}
                    />
                  </View>
                  <Text className="text-[10px] font-semibold" style={{ color: C.muted }}>
                    {item.completed}/{item.topics.length} completed
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={18} color={C.muted} style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          );
        })}

        <View className="h-28" />
      </ScrollView>
    </LinearGradient>
  );
}