import React, { useMemo, useState } from 'react';
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
import { UsePracticeStore } from '../../zustand/StorePraticalQuestions';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

// Learn SQL Offline theme
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  green: '#22C55E',
  rose: '#F87171',
  muted: '#93A4C7',
};

export default function CBTReviewAnswersScreen() {
  const router = useRouter();

  const [filter, setFilter] = useState('all');
  const { practiceQuestions, userAnswers } = UsePracticeStore();

  const evaluatedQuestions = useMemo(() => {
    if (!practiceQuestions || practiceQuestions.length === 0) return [];

    return practiceQuestions.map((q, index) => {
      const userAnswerIndex = userAnswers[q.id];
      const correctAnswerIndex = q.answer ?? q.correctAnswer ?? 0;

      const hasAnswered = userAnswerIndex !== undefined && userAnswerIndex !== null;
      const isCorrect = hasAnswered && userAnswerIndex === correctAnswerIndex;

      return {
        ...q,
        questionNumber: index + 1,
        userAnswerIndex,
        correctAnswerIndex,
        hasAnswered,
        isCorrect,
      };
    });
  }, [practiceQuestions, userAnswers]);

  const filteredQuestions = useMemo(() => {
    if (filter === 'passed') return evaluatedQuestions.filter((q) => q.isCorrect);
    if (filter === 'failed') return evaluatedQuestions.filter((q) => !q.isCorrect);
    return evaluatedQuestions;
  }, [evaluatedQuestions, filter]);

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

        {/* Header */}
        <View
          className="px-6 py-4 flex-row justify-between items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: C.border }}
        >
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()}
              className="w-9 h-9 rounded-xl justify-center items-center mr-3"
              style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
            >
              <Ionicons name="arrow-back" size={20} color="#E2E8F0" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-white">Review Answers</Text>
          </View>

          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' }}
          >
            <Text className="text-xs font-bold" style={{ color: C.cyan }}>
              {practiceQuestions.length} Questions
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="px-6 pt-4 pb-2 flex-row" style={{ gap: 8 }}>
          <TouchableOpacity
            // onPress={() => setFilter('all')}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{
              borderWidth: 1,
              backgroundColor: filter === 'all' ? C.blue : C.glass,
              borderColor: filter === 'all' ? C.blue : C.border,
            }}
          >
            <Text className="text-xs font-bold" style={{ color: filter === 'all' ? '#fff' : '#CBD5E1' }}>
              All ({evaluatedQuestions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => setFilter('passed')}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{
              borderWidth: 1,
              backgroundColor: filter === 'passed' ? C.green : 'rgba(34,197,94,0.12)',
              borderColor: filter === 'passed' ? C.green : 'rgba(34,197,94,0.45)',
            }}
          >
            <Text className="text-xs font-bold" style={{ color: filter === 'passed' ? '#fff' : '#86EFAC' }}>
              Passed ({evaluatedQuestions.filter(q => q.isCorrect).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            // onPress={() => setFilter('failed')}
            className="flex-1 py-2.5 rounded-xl items-center"
            style={{
              borderWidth: 1,
              backgroundColor: filter === 'failed' ? '#EF4444' : 'rgba(248,113,113,0.12)',
              borderColor: filter === 'failed' ? '#EF4444' : 'rgba(248,113,113,0.45)',
            }}
          >
            <Text className="text-xs font-bold" style={{ color: filter === 'failed' ? '#fff' : '#FCA5A5' }}>
              Failed ({evaluatedQuestions.filter(q => !q.isCorrect).length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          className="flex-1 px-6 pt-4" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {filteredQuestions.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Ionicons name="document-text-outline" size={48} color={C.muted} />
              <Text className="font-semibold mt-3 text-sm" style={{ color: C.muted }}>
                No questions found in this filter category.
              </Text>
            </View>
          ) : (
            filteredQuestions.map((item) => (
              <View 
                key={item.id}
                className="rounded-3xl p-10 mb-5"
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
                {/* Question Header & Status Badge */}
                <View className="flex-row justify-between items-center mb-3">
                  <View
                    className="px-2.5 py-0.5 rounded-md"
                    style={{ backgroundColor: 'rgba(59,130,246,0.18)', borderWidth: 1, borderColor: C.border }}
                  >
                    <Text className="text-[10px] font-bold uppercase" style={{ color: '#BFD3FF' }}>
                      Question {item.questionNumber}
                    </Text>
                  </View>

                  <View
                    className="flex-row items-center px-2.5 py-1 rounded-full"
                    style={{
                      borderWidth: 1,
                      backgroundColor: item.isCorrect ? 'rgba(34,197,94,0.14)' : 'rgba(248,113,113,0.14)',
                      borderColor: item.isCorrect ? 'rgba(34,197,94,0.5)' : 'rgba(248,113,113,0.5)',
                    }}
                  >
                    <Ionicons 
                      name={item.isCorrect ? 'checkmark-circle' : 'close-circle'} 
                      size={14} 
                      color={item.isCorrect ? C.green : C.rose} 
                      style={{ marginRight: 4 }}
                    />
                    <Text className="text-xs font-bold" style={{ color: item.isCorrect ? '#86EFAC' : '#FCA5A5' }}>
                      {item.isCorrect ? 'Passed' : item.hasAnswered ? 'Failed' : 'Unanswered'}
                    </Text>
                  </View>
                </View>

                {/* Question Text */}
                <View className="mb-4">
                  <Text className="text-base text-white font-medium leading-6">
                    {item.question}
                  </Text>
                </View>

                {/* Options Array Mapping */}
                <View className="mb-4">
                  {item.options.map((optionText, optIdx) => {
                    const letter = OPTION_LETTERS[optIdx];
                    const isUserPick = item.userAnswerIndex === optIdx;
                    const isCorrectAnswer = item.correctAnswerIndex === optIdx;

                    let optionBg = 'rgba(2,10,42,0.45)';
                    let optionBorder = C.border;
                    let badgeBg = 'rgba(59,130,246,0.3)';
                    let textColor = '#CBD5E1';
                    let textWeight = '500';

                    if (isCorrectAnswer) {
                      optionBg = 'rgba(34,197,94,0.16)';
                      optionBorder = C.green;
                      badgeBg = C.green;
                      textColor = '#DCFCE7';
                      textWeight = '700';
                    } else if (isUserPick && !isCorrectAnswer) {
                      optionBg = 'rgba(248,113,113,0.14)';
                      optionBorder = C.rose;
                      badgeBg = '#EF4444';
                      textColor = '#FEE2E2';
                      textWeight = '700';
                    }

                    return (
                      <View
                        key={optIdx}
                        className="flex-row items-center p-3.5 rounded-2xl mb-2"
                        style={{ borderWidth: 1, backgroundColor: optionBg, borderColor: optionBorder }}
                      >
                        <View
                          className="w-7 h-7 rounded-lg justify-center items-center mr-3"
                          style={{ backgroundColor: badgeBg }}
                        >
                          <Text className="text-xs font-bold text-white">{letter}</Text>
                        </View>
                        <Text className="text-sm flex-1" style={{ color: textColor, fontWeight: textWeight }}>
                          {optionText}
                        </Text>
                        
                        {isCorrectAnswer && <Ionicons name="checkmark-sharp" size={16} color={C.green} />}
                        {isUserPick && !isCorrectAnswer && <Ionicons name="close-sharp" size={16} color={C.rose} />}
                      </View>
                    );
                  })}
                </View>

                {/* Explanation Box */}
                {item.explanation ? (
                  <View
                    className="rounded-2xl p-4 mb-4"
                    style={{ backgroundColor: 'rgba(34,211,238,0.08)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.35)' }}
                  >
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="bulb-outline" size={16} color={C.cyan} style={{ marginRight: 6 }} />
                      <Text className="text-xs font-bold uppercase tracking-wider" style={{ color: C.cyan }}>
                        Explanation
                      </Text>
                    </View>
                    <Text className="text-xs leading-relaxed font-medium" style={{ color: '#BAE6FD' }}>
                      {item.explanation}
                    </Text>
                  </View>
                ) : null}

                {/* Footer Summary */}
                <View
                  className="pt-3 flex-row justify-between items-center"
                  style={{ borderTopWidth: 1, borderTopColor: C.border }}
                >
                  <Text className="text-xs font-medium" style={{ color: C.muted }}>
                    Your Choice: <Text className="font-bold uppercase text-white">
                      {item.hasAnswered ? OPTION_LETTERS[item.userAnswerIndex] : 'None'}
                    </Text>
                  </Text>
                  <Text className="text-xs font-medium" style={{ color: C.muted }}>
                    Correct Choice: <Text className="font-bold uppercase" style={{ color: C.green }}>
                      {OPTION_LETTERS[item.correctAnswerIndex]}
                    </Text>
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}