import React, { useMemo } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import your Zustand store
import { UsePracticeStore } from '../../zustand/StorePraticalQuestions';

// Learn SQL Offline theme
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  muted: '#93A4C7',
};

export default function QuizResultScreen() {
  const router = useRouter();

  // Pull practice questions, current courses, and user answers from Zustand
  const { practiceQuestions, currentCourses, userAnswers } = UsePracticeStore();

  // Calculate scores and metrics dynamically for the 20 random practice questions
  const examResult = useMemo(() => {
    if (!practiceQuestions || practiceQuestions.length === 0) {
      return { totalScore: 0, maxScore: 0, percentage: 0, passed: false };
    }

    let totalScore = 0;
    const maxScore = practiceQuestions.length;

    practiceQuestions.forEach((q) => {
      const userAnswerIndex = userAnswers[q.id]; // e.g., number 0, 1, 2, 3

      // Laravel questions standard key check for correct option
      // Depending on your JSON structure, 'answer' or 'correctAnswer' could be an index or letter string
      const correctAnswer = q.answer ?? q.correctAnswer ?? 0;

      // Match user selection with the correct answer format
      if (userAnswerIndex !== undefined && userAnswerIndex !== null) {
        if (userAnswerIndex === correctAnswer) {
          totalScore += 1;
        }
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    return {
      totalScore,
      maxScore,
      percentage,
      passed: percentage >= 50,
    };
  }, [practiceQuestions, userAnswers]);

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

        {/* --- TOP HEADER BAR --- */}
        <View
          className="px-6 py-4 flex-row justify-between items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: C.border }}
        >
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-xl justify-center items-center mr-3"
              style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' }}
            >
              <Ionicons name="trophy-outline" size={20} color={C.cyan} />
            </View>
            <Text className="text-lg font-bold text-white">Practice Results</Text>
          </View>

          <TouchableOpacity 
            onPress={() => router.replace('/home')}
            className="w-9 h-9 rounded-xl justify-center items-center"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="close-outline" size={20} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <ScrollView 
          className="flex-1 px-6 pt-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Score Card Banner */}
          <LinearGradient
            colors={examResult.passed ? ['#16A34A', '#0EA5E9'] : ['#1E3A8A', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 24,
              padding: 24,
              marginBottom: 24,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: examResult.passed ? 'rgba(34,197,94,0.6)' : C.border,
            }}
          >
            {/* Decorative Background Icon Ring */}
            <View className="absolute -right-6 -bottom-6 opacity-10">
              <Ionicons name="ribbon" size={160} color="#ffffff" />
            </View>

            <View className="flex-row justify-between items-start mb-4">
              <View className="bg-white/20 px-3.5 py-1 rounded-full border border-white/30">
                <Text className="text-xs font-bold text-white uppercase tracking-wider">
                  {examResult.passed ? '🎉 Great Job!' : 'Keep Practicing'}
                </Text>
              </View>
            </View>

            <View className="items-center my-3">
              <Text className="text-5xl font-extrabold text-white tracking-tight mb-1">
                {examResult.percentage}%
              </Text>
              <Text className="text-sm font-medium text-white/90">
                Score: {examResult.totalScore} out of {examResult.maxScore} questions
              </Text>
            </View>
          </LinearGradient>

          {/* Breakdown Section Title */}
          <View className="mb-4">
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>
              Category Breakdown
            </Text>
          </View>

          {/* Single/Main Subject Performance Card */}
          <View className="mb-8">
            <View
              className="p-7 rounded-2xl flex-row items-center justify-between mb-3"
              style={{
                backgroundColor: C.glass,
                borderWidth: 1,
                borderColor: C.border,
                shadowColor: C.blue,
                shadowOpacity: 0.2,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 5,
              }}
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View
                  className="w-10 h-10 rounded-xl justify-center items-center mr-3.5"
                  style={{ backgroundColor: 'rgba(59,130,246,0.25)', borderWidth: 1, borderColor: C.border }}
                >
                  <Ionicons name="logo-laravel" size={20} color={C.cyan} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-bold text-white mb-0.5">
                    {currentCourses || 'Laravel Architecture'}
                  </Text>
                  <Text className="text-xs font-medium" style={{ color: C.muted }}>
                    Correct: {examResult.totalScore} / {examResult.maxScore}
                  </Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-base font-extrabold mb-0.5" style={{ color: C.cyan }}>
                  {examResult.percentage}%
                </Text>
                <View
                  className="px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: 'rgba(34,197,94,0.16)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.5)' }}
                >
                  <Text className="text-[10px] font-bold" style={{ color: C.green }}>Completed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          {/* <View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.replace('/home')}
              className="w-full h-14 rounded-2xl bg-[#FF3B30] flex-row justify-center items-center shadow-md"
            >
              <Text className="text-sm font-bold text-white mr-2">
                Back to Dashboard
              </Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View> */}
          {/* Action Buttons */}
          <View>
            {/* --- ADD THIS REVIEW BUTTON HERE --- */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/quiz/review-answers-screen')} // Update path to match your review screen route
              className="w-full h-14 rounded-2xl flex-row justify-center items-center mb-3"
              style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
            >
              <Ionicons name="eye-outline" size={18} color="#E2E8F0" style={{ marginRight: 8 }} />
              <Text className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
                Review Detailed Answers
              </Text>
            </TouchableOpacity>
            {/* ------------------------------------ */}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.replace('/home')}
              className="w-full h-14 rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={['#0EA5E9', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
              >
                <Text className="text-sm font-bold text-white mr-2">
                  Back to Dashboard
                </Text>
                <Ionicons name="arrow-forward-outline" size={18} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}