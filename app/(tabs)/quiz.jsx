import React from 'react';
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { UsePracticeStore } from '../../zustand/StorePraticalQuestions';
import allQuestionsData from '../questions/sql-questions.json'; // Adjust path if needed

const QUIZ_TOPIC = 'Laravel Architecture';

// Learn SQL Offline theme (shared across both projects)
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
};

// Quick facts shown in the card that overlaps the hero
const STATS = [
  { icon: 'help-circle-outline', value: '20', label: 'Questions' },
  { icon: 'speedometer-outline', value: 'Mixed', label: 'Difficulty' },
  { icon: 'shuffle-outline', value: 'Random', label: 'Order' },
];

// What the user can expect before they start
const EXPECTATIONS = [
  {
    icon: 'shuffle',
    color: '#3B82F6',
    title: 'A fresh set every time',
    text: 'Each attempt picks 20 new questions at random from the Laravel question bank.',
  },
  {
    icon: 'layers',
    color: '#8B5CF6',
    title: 'Basics to trickier concepts',
    text: 'Questions vary in difficulty, so you can see exactly where you stand.',
  },
  {
    icon: 'refresh',
    color: '#22C55E',
    title: 'Retake anytime',
    text: 'Practice as often as you like to improve your score.',
  },
];

export default function QuizWelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clearPracticeData, setPracticeData } = UsePracticeStore();

  const handleStartQuiz = () => {
    // Clear old data first, then generate a brand new set of random questions
    clearPracticeData();
    setPracticeData(allQuestionsData, QUIZ_TOPIC);
    router.push('/quiz/quiz-screen');
  };

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(59,130,246,0.45)" />

      {/* --- HERO --- */}
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
          overflow: 'hidden',
        }}
      >
        {/* Soft decorative glows */}
        <View
          className="absolute rounded-full"
          style={{ width: 220, height: 220, top: -80, right: -60, backgroundColor: 'rgba(34,211,238,0.10)' }}
        />
        <View
          className="absolute rounded-full"
          style={{ width: 160, height: 160, bottom: -60, left: -50, backgroundColor: 'rgba(59,130,246,0.14)' }}
        />

        <View className="items-center px-6 pt-6 pb-16">
          <View
            className="p-4 rounded-3xl mb-5"
            style={{
              backgroundColor: 'rgba(34,211,238,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(34,211,238,0.4)',
            }}
          >
            <Image
              source={require('../../assets/images/icon.png')}
              className="w-14 h-14"
              resizeMode="contain"
            />
          </View>

          <Text className="text-white text-2xl font-extrabold text-center">
            Ready for the <Text style={{ color: C.cyan }}>challenge?</Text>
          </Text>
          <Text className="text-sm text-center leading-relaxed mt-2 px-2" style={{ color: C.muted }}>
            Test your Laravel knowledge, reinforce what you've learned, and see how far you've come.
          </Text>

          {/* Topic pill */}
          <View
            className="flex-row items-center mt-5 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(34,211,238,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(34,211,238,0.4)',
            }}
          >
            <Ionicons name="bookmark-outline" size={14} color={C.cyan} />
            <Text className="text-xs font-semibold ml-1.5" style={{ color: '#BFD3FF' }}>
              {QUIZ_TOPIC}
            </Text>
          </View>
        </View>
      </View>

      {/* --- CONTENT (slides up over the hero) --- */}
      <ScrollView
        className="flex-1 px-5 -mt-10"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats card */}
        <View
          className="flex-row rounded-3xl py-5"
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
          {STATS.map((s, i) => (
            <View
              key={s.label}
              className="flex-1 items-center"
              style={
                i < STATS.length - 1
                  ? { borderRightWidth: 1, borderRightColor: 'rgba(59,130,246,0.25)' }
                  : undefined
              }
            >
              <View
                className="w-9 h-9 rounded-full items-center justify-center mb-2"
                style={{
                  backgroundColor: 'rgba(34,211,238,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(34,211,238,0.4)',
                }}
              >
                <Ionicons name={s.icon} size={18} color={C.cyan} />
              </View>
              <Text className="text-white text-base font-extrabold">{s.value}</Text>
              <Text className="text-xs mt-0.5" style={{ color: C.muted }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* What to expect */}
        <Text
          className="text-xs font-bold uppercase tracking-wider mt-8 mb-3 px-1"
          style={{ color: C.muted }}
        >
          What to expect
        </Text>

        {EXPECTATIONS.map((item) => (
          <View
            key={item.title}
            className="flex-row items-center p-3.5 mb-3 rounded-2xl"
            style={{
              backgroundColor: C.glass,
              borderWidth: 1,
              borderColor: C.border,
            }}
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
      </ScrollView>

      {/* --- STICKY START BUTTON --- */}
      <SafeAreaView>
        <View
          className="px-5 pt-3 pb-4"
          style={{ borderTopWidth: 1, borderTopColor: 'rgba(59,130,246,0.25)' }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleStartQuiz}
            accessibilityRole="button"
            accessibilityLabel="Start quiz"
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
            <Text className="text-white text-base font-bold mr-2">Start quiz</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}