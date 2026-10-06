
import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import allQuestionsData from '../questions/sql-questions.json';
import { UsePracticeStore } from '../../zustand/StorePraticalQuestions';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL_QUIZ_TIME = 15 * 60; // 15 minutes in seconds

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

export default function QuizScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  // SINGLE STORE CALL
  const { 
    practiceQuestions, 
    userAnswers, 
    setPracticeData, 
    setUserAnswer 
  } = UsePracticeStore();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_QUIZ_TIME);

  // Initialize questions on mount safely
  useEffect(() => {
    if (!practiceQuestions || practiceQuestions.length === 0) {
      setPracticeData(allQuestionsData, 'SQL Architecture');
    }
  }, []);

  // --- STABLE TIMER COUNTDOWN EFFECT ---
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          // Defer navigation slightly out of the immediate reducer tick to avoid render conflicts
          setTimeout(() => {
            router.replace('/quiz/quiz-result-screen');
          }, 0);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, []); // Empty dependency array ensures interval starts only once on mount

  // Format seconds into MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Determine if time is 5 minutes (300 seconds) or less
  const isTimeCritical = timeLeft <= 300;

  // Safe early return AFTER all hooks have executed
  if (!practiceQuestions || practiceQuestions.length === 0) {
    return (
      <LinearGradient colors={C.bg} style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 justify-center items-center">
          <Text style={{ color: C.muted }} className="font-medium">Loading questions...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentQuestion = practiceQuestions[currentIndex];
  const selectedOptionIndex = userAnswers[currentQuestion.id] ?? null;
  const isLast = currentIndex === practiceQuestions.length - 1;
  const progress = (currentIndex + 1) / practiceQuestions.length;

  const handleSelectOption = (optionIndex) => {
    setUserAnswer(currentQuestion.id, optionIndex);
  };

  const handleNext = () => {
    if (currentIndex < practiceQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/quiz/quiz-result-screen'); 
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <SafeAreaView className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor="#020A2A" />
        
        {/* --- TOP HEADER BAR --- */}
        <View
          className="px-6 py-3.5 flex-row justify-between items-center"
          style={{ borderBottomWidth: 1, borderBottomColor: C.border }}
        >
          <View
            className="px-3.5 py-1.5 rounded-full flex-row items-center"
            style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' }}
          >
            <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: C.cyan }} />
            <Text className="text-xs font-bold tracking-wide" style={{ color: C.cyan }}>
              SQL Architecture
            </Text>
          </View>

          {/* Dynamic Timer Badge */}
          <View
            className="flex-row items-center px-3.5 py-1.5 rounded-2xl"
            style={{
              borderWidth: 1,
              backgroundColor: isTimeCritical ? 'rgba(245,158,11,0.14)' : C.glass,
              borderColor: isTimeCritical ? 'rgba(245,158,11,0.6)' : C.border,
            }}
          >
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={isTimeCritical ? C.amber : '#E2E8F0'} 
              style={{ marginRight: 6 }} 
            />
            <Text className="text-xs font-extrabold" style={{ color: isTimeCritical ? C.amber : '#E2E8F0' }}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        </View>

        {/* --- MAIN CONTENT SCROLL AREA --- */}
        <ScrollView 
          className="flex-1 px-6 pt-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>
              Question {currentIndex + 1} of {practiceQuestions.length}
            </Text>

            <View
              className="px-3 py-0.5 rounded-md"
              style={{ backgroundColor: 'rgba(59,130,246,0.18)', borderWidth: 1, borderColor: C.border }}
            >
              <Text className="text-[10px] font-bold uppercase" style={{ color: '#BFD3FF' }}>
                Core Concepts
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <View
            className="h-1.5 rounded-full overflow-hidden mb-5"
            style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}
          >
            <View
              className="h-full rounded-full"
              style={{ width: `${progress * 100}%`, backgroundColor: C.cyan }}
            />
          </View>

          {/* Question card */}
          <View
            className="p-10 rounded-3xl mb-6"
            style={{
              backgroundColor: C.glass,
              borderWidth: 1,
              borderColor: C.border,
              shadowColor: C.blue,
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Text className="text-white text-lg font-bold leading-relaxed">
              {currentQuestion.question}
            </Text>
          </View>

          {/* --- OPTIONS LIST --- */}
          <View>
            {currentQuestion.options.map((optionText, index) => {
              const letter = OPTION_LETTERS[index];
              const isSelected = selectedOptionIndex === index;
              
              return (
                <TouchableOpacity
                  key={letter}
                  activeOpacity={0.8}
                  onPress={() => handleSelectOption(index)}
                  className="flex-row items-center p-4 rounded-2xl mb-3"
                  style={{
                    borderWidth: 1,
                    backgroundColor: isSelected ? 'rgba(34,197,94,0.16)' : 'rgba(30,64,175,0.18)',
                    borderColor: isSelected ? C.green : C.border,
                  }}
                >
                  <View 
                    className="w-9 h-9 rounded-lg justify-center items-center mr-3.5"
                    style={{ backgroundColor: isSelected ? C.green : 'rgba(59,130,246,0.3)' }}
                  >
                    <Text className="text-sm font-extrabold uppercase text-white">
                      {letter}
                    </Text>
                  </View>

                  <Text 
                    className={`text-sm flex-1 ${isSelected ? 'font-bold text-white' : 'font-semibold'}`}
                    style={isSelected ? undefined : { color: '#CBD5E1' }}
                  >
                    {optionText}
                  </Text>

                  <View 
                    className="w-5 h-5 rounded-full items-center justify-center ml-2"
                    style={{
                      borderWidth: 1,
                      backgroundColor: isSelected ? C.green : 'transparent',
                      borderColor: isSelected ? C.green : 'rgba(148,163,184,0.5)',
                    }}
                  >
                    {isSelected && <Ionicons name="checkmark" size={12} color="#ffffff" />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* --- FLOATING BOTTOM NAVIGATION BAR --- */}
        <View 
          style={{
            paddingBottom: Math.max(insets.bottom, 12),
            backgroundColor: 'rgba(2,10,42,0.97)',
            borderTopWidth: 1,
            borderTopColor: C.border,
          }}
          className="absolute bottom-0 left-0 right-0 px-6 pt-4 flex-row justify-between items-center z-50"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
            className={`w-28 h-12 rounded-2xl flex-row justify-center items-center ${
              currentIndex === 0 ? 'opacity-50' : 'opacity-100'
            }`}
            style={{ borderWidth: 1, borderColor: C.border, backgroundColor: C.glass }}
          >
            <Ionicons name="arrow-back-outline" size={18} color="#E2E8F0" style={{ marginRight: 6 }} />
            <Text className="text-sm font-bold" style={{ color: '#E2E8F0' }}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            className="flex-1 ml-4 h-12 rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={isLast ? ['#22C55E', '#16A34A'] : ['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-sm font-bold text-white mr-2">
                {isLast ? 'Finish' : 'Next Question'}
              </Text>
              <Ionicons 
                name={isLast ? 'checkmark-circle-outline' : 'arrow-forward-outline'} 
                size={18} 
                color="#ffffff" 
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}