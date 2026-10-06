import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* ------------------------------------------------------------------ */
/* Theme                                                               */
/* ------------------------------------------------------------------ */
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  muted: '#93A4C7',
  text: '#CBD5E1',
};

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

/* ------------------------------------------------------------------ */
/* Lesson data                                                         */
/* Block types: p, points, code, table, tip, warning                   */
/* ------------------------------------------------------------------ */
const STUDENT_COLS = ['id', 'name', 'age', 'course'];
const STUDENT_FLEX = [0.6, 1.5, 0.8, 1];
const STUDENTS = [
  [1, 'John', 22, 'CS'],
  [2, 'Mary', 23, 'IT'],
  [3, 'Ibrahim', 21, 'CS'],
  [4, 'Fatima', 24, 'IS'],
  [5, 'Yusuf', 22, 'SE'],
];

const lessonContent = [
  {
    id: '1',
    title: 'What is SQL?',
    icon: 'information-circle',
    color: '#3B82F6',
    blocks: [
      {
        type: 'p',
        text: 'SQL stands for Structured Query Language. It is the standard language used to communicate with relational databases. Instead of searching through files by hand, you write a short statement that describes the data you want, and the database finds it for you.',
      },
      {
        type: 'p',
        text: 'Almost every application you use stores its data in a database: a school keeps student records, a shop keeps orders, a bank keeps transactions. SQL is how those applications read, add, change and remove that data.',
      },
      {
        type: 'points',
        title: 'What you can do with SQL',
        items: [
          'Retrieve data with SELECT',
          'Add new data with INSERT',
          'Change existing data with UPDATE',
          'Remove data with DELETE',
          'Create and manage the structure of a database with CREATE, ALTER and DROP',
        ],
      },
      {
        type: 'p',
        text: 'The same core commands work in MySQL, PostgreSQL, SQLite and SQL Server. Each system adds a few extras of its own, but once you know the basics you can move between them easily.',
      },
      { type: 'code', code: 'SELECT name FROM students;' },
      {
        type: 'p',
        text: 'This statement reads almost like English: select the name column from the students table.',
      },
      {
        type: 'tip',
        title: 'Good to know',
        text: 'SQL keywords are not case-sensitive, but writing them in UPPERCASE makes queries easier to read. Each statement ends with a semicolon.',
      },
    ],
  },
  {
    id: '2',
    title: 'Databases and tables',
    icon: 'server',
    color: '#22C55E',
    blocks: [
      {
        type: 'p',
        text: 'A database is an organized collection of data. Inside a database, the data is stored in tables. You can think of a table as a spreadsheet that holds one kind of thing, such as students, courses or exam results.',
      },
      {
        type: 'table',
        caption: 'Tables inside a school database',
        columns: ['Table', 'Stores', 'Example column'],
        flex: [1, 1.4, 1.2],
        rows: [
          ['students', 'One row per student', 'name'],
          ['courses', 'One row per course', 'title'],
          ['results', 'One row per exam result', 'score'],
        ],
      },
      {
        type: 'p',
        text: 'Keeping each kind of data in its own table avoids repetition. Tables are linked to each other using keys. A primary key is a column, usually id, whose value is unique for every row, so each record can be identified without confusion.',
      },
      { type: 'p', text: 'This is how the students table is created:' },
      {
        type: 'code',
        code: `CREATE TABLE students (
  id INTEGER PRIMARY KEY,
  name TEXT,
  age INTEGER,
  course TEXT
);`,
      },
      {
        type: 'points',
        title: 'Common data types',
        items: [
          'INTEGER: whole numbers such as 22',
          'TEXT: words and sentences such as John',
          'REAL or DECIMAL: numbers with decimals such as 3.75',
          'DATE: calendar dates such as 2026-10-04',
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Rows and columns',
    icon: 'grid',
    color: '#8B5CF6',
    blocks: [
      {
        type: 'p',
        text: 'Every table is made of columns and rows. Columns describe what is stored, and rows hold the actual records.',
      },
      {
        type: 'table',
        caption: 'students table: 4 columns, 5 rows',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: STUDENTS,
      },
      {
        type: 'points',
        title: 'Reading the table',
        items: [
          'A column is a field with a name and a data type. Here: id, name, age and course.',
          'A row is one complete record. Row 3 describes Ibrahim, who is 21 and studies CS.',
          'A cell is the value where a row and a column meet. The cell at row 2, column age holds 23.',
          'The id column is the primary key. No two students share the same id.',
        ],
      },
      {
        type: 'tip',
        title: 'Tip',
        text: 'All examples in the next topics start from this original students table, so you can follow every result.',
      },
    ],
  },
  {
    id: '4',
    title: 'SELECT',
    icon: 'search',
    color: '#22D3EE',
    blocks: [
      {
        type: 'p',
        text: 'SELECT is the command you will use most. It reads data from a table and returns it as a result. It never changes the data stored in the table.',
      },
      { type: 'p', text: 'Use an asterisk to select every column:' },
      { type: 'code', code: 'SELECT * FROM students;' },
      {
        type: 'table',
        caption: 'Result: 5 rows',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: STUDENTS,
      },
      { type: 'p', text: 'Name the columns you need to get a smaller, cleaner result:' },
      { type: 'code', code: 'SELECT name, course FROM students;' },
      {
        type: 'table',
        caption: 'Result: 5 rows',
        columns: ['name', 'course'],
        flex: [1, 1],
        rows: STUDENTS.map((s) => [s[1], s[3]]),
      },
      {
        type: 'p',
        text: 'Add a WHERE clause to keep only the rows that match a condition:',
      },
      { type: 'code', code: 'SELECT name, age FROM students WHERE age > 22;' },
      {
        type: 'table',
        caption: 'Result: 2 rows',
        columns: ['name', 'age'],
        flex: [1, 1],
        rows: [
          ['Mary', 23],
          ['Fatima', 24],
        ],
      },
      {
        type: 'points',
        title: 'Key points',
        items: [
          'SELECT chooses the columns',
          'FROM names the table',
          'WHERE filters the rows (optional)',
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'INSERT',
    icon: 'add-circle',
    color: '#F59E0B',
    blocks: [
      {
        type: 'p',
        text: 'INSERT adds a new row to a table. You list the columns you want to fill, then give the values in the same order.',
      },
      {
        type: 'code',
        code: `INSERT INTO students (id, name, age, course)
VALUES (6, 'Aisha', 20, 'CS');`,
      },
      {
        type: 'table',
        caption: 'students after INSERT: the new row is highlighted',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [...STUDENTS, [6, 'Aisha', 20, 'CS']],
        highlight: [5],
      },
      {
        type: 'points',
        title: 'Rules to remember',
        items: [
          'Values must be in the same order as the listed columns',
          'Text values go inside single quotes, numbers do not',
          'The primary key must be unique, so id 6 cannot be used twice',
          'Columns you leave out are filled with their default value, or NULL if none is set',
        ],
      },
      {
        type: 'warning',
        title: 'Common error',
        text: 'Inserting an id that already exists fails with a constraint error. The table protects itself from duplicate keys.',
      },
    ],
  },
  {
    id: '6',
    title: 'UPDATE',
    icon: 'create',
    color: '#EC4899',
    blocks: [
      {
        type: 'p',
        text: 'UPDATE changes values in rows that already exist. SET says which columns get new values, and WHERE says which rows are affected.',
      },
      { type: 'code', code: "UPDATE students\nSET course = 'SE'\nWHERE id = 3;" },
      {
        type: 'table',
        caption: 'students after UPDATE: Ibrahim moved from CS to SE',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: STUDENTS.map((s) => (s[0] === 3 ? [3, 'Ibrahim', 21, 'SE'] : s)),
        highlight: [2],
      },
      { type: 'p', text: 'You can change several columns in one statement by separating them with commas:' },
      { type: 'code', code: "UPDATE students\nSET age = 25, course = 'IT'\nWHERE name = 'Fatima';" },
      {
        type: 'warning',
        title: 'Always use WHERE',
        text: 'If you forget the WHERE clause, UPDATE changes every row in the table. Check your condition before you run the statement.',
      },
    ],
  },
  {
    id: '7',
    title: 'DELETE',
    icon: 'trash',
    color: '#EF4444',
    blocks: [
      {
        type: 'p',
        text: 'DELETE removes rows from a table. Like UPDATE, it uses WHERE to decide which rows to remove.',
      },
      { type: 'code', code: 'DELETE FROM students\nWHERE id = 5;' },
      {
        type: 'table',
        caption: 'students after DELETE: Yusuf (id 5) is gone',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: STUDENTS.filter((s) => s[0] !== 5),
      },
      {
        type: 'points',
        title: 'DELETE compared with DROP',
        items: [
          'DELETE removes rows, but the table and its columns remain',
          'DROP TABLE removes the whole table, including its structure',
        ],
      },
      {
        type: 'tip',
        title: 'A safe habit',
        text: 'Before you delete, run a SELECT with the same WHERE condition. If it returns exactly the rows you expect, change SELECT * to DELETE.',
      },
      { type: 'code', code: 'SELECT * FROM students WHERE id = 5;' },
      {
        type: 'warning',
        title: 'No WHERE means no rows left',
        text: 'DELETE FROM students; with no WHERE removes every row in the table. Deleted rows cannot be recovered unless you have a backup.',
      },
    ],
  },
];

const quickReference = {
  columns: ['Command', 'What it does', 'Example'],
  flex: [0.9, 1.3, 1.9],
  rows: [
    ['SELECT', 'Reads data', 'SELECT * FROM students;'],
    ['INSERT', 'Adds a row', "INSERT INTO students ... VALUES (...);"],
    ['UPDATE', 'Changes rows', "UPDATE students SET age = 23 WHERE id = 1;"],
    ['DELETE', 'Removes rows', 'DELETE FROM students WHERE id = 5;'],
  ],
};

/* ------------------------------------------------------------------ */
/* SQL syntax highlighting                                             */
/* ------------------------------------------------------------------ */
const STATEMENT_WORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
const CLAUSE_WORDS = [
  'FROM', 'WHERE', 'SET', 'INTO', 'VALUES', 'TABLE', 'PRIMARY', 'KEY', 'AND', 'OR', 'NOT', 'NULL',
];
const TYPE_WORDS = ['INTEGER', 'TEXT', 'REAL', 'DATE', 'DECIMAL'];

function tokenColor(token) {
  const upper = token.toUpperCase();
  if (token.startsWith("'")) return C.amber;
  if (/^\d+$/.test(token)) return '#FACC15';
  if (STATEMENT_WORDS.includes(upper)) return C.cyan;
  if (CLAUSE_WORDS.includes(upper)) return '#F472B6';
  if (TYPE_WORDS.includes(upper)) return '#A78BFA';
  return '#E2E8F0';
}

function SqlText({ code }) {
  const tokens = code.match(/'[^']*'|\d+|[A-Za-z_]+|\s+|[^\sA-Za-z_0-9']+/g) || [];
  return (
    <Text style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 20 }}>
      {tokens.map((t, i) => (
        <Text key={i} style={{ color: tokenColor(t) }}>
          {t}
        </Text>
      ))}
    </Text>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable blocks                                                     */
/* ------------------------------------------------------------------ */
function CodeBlock({ code, id, copiedId, onCopy }) {
  const copied = copiedId === id;
  return (
    <View
      className="rounded-2xl overflow-hidden my-3"
      style={{ backgroundColor: 'rgba(2,10,42,0.85)', borderWidth: 1, borderColor: C.border }}
    >
      <View
        className="flex-row items-center justify-between px-4 py-2"
        style={{ backgroundColor: 'rgba(59,130,246,0.15)', borderBottomWidth: 1, borderBottomColor: C.border }}
      >
        <View className="flex-row items-center">
          <Ionicons name="code-slash" size={14} color={C.cyan} />
          <Text className="text-[11px] font-bold ml-1.5" style={{ color: C.cyan }}>
            SQL
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onCopy(code, id)}
          disabled={copied}
          hitSlop={8}
          className="flex-row items-center"
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={15}
            color={copied ? C.green : C.muted}
          />
          <Text className="text-[11px] font-semibold ml-1" style={{ color: copied ? C.green : C.muted }}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>
      <View className="p-4">
        <SqlText code={code} />
      </View>
    </View>
  );
}

function DataTable({ caption, columns, rows, flex, highlight = [] }) {
  return (
    <View className="my-3">
      {caption ? (
        <View className="flex-row items-center mb-2">
          <Ionicons name="grid-outline" size={13} color={C.muted} />
          <Text className="text-[11px] font-semibold ml-1.5" style={{ color: C.muted }}>
            {caption}
          </Text>
        </View>
      ) : null}

      <View className="rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: C.border }}>
        {/* header */}
        <View className="flex-row" style={{ backgroundColor: 'rgba(59,130,246,0.28)' }}>
          {columns.map((col, i) => (
            <Text
              key={col}
              className="text-[11px] font-bold px-3 py-2.5"
              style={{ flex: flex ? flex[i] : 1, color: '#E0F2FE' }}
            >
              {col}
            </Text>
          ))}
        </View>

        {/* rows */}
        {rows.map((row, r) => {
          const isHighlight = highlight.includes(r);
          return (
            <View
              key={r}
              className="flex-row"
              style={{
                borderTopWidth: 1,
                borderTopColor: 'rgba(59,130,246,0.25)',
                backgroundColor: isHighlight
                  ? 'rgba(34,197,94,0.18)'
                  : r % 2 === 0
                  ? 'rgba(2,10,42,0.35)'
                  : 'rgba(30,64,175,0.12)',
              }}
            >
              {row.map((cell, c) => (
                <Text
                  key={c}
                  className="text-xs px-3 py-2.5"
                  style={{
                    flex: flex ? flex[c] : 1,
                    color: isHighlight ? '#DCFCE7' : C.text,
                    fontWeight: isHighlight ? '700' : '400',
                    fontFamily: typeof cell === 'string' && /\(|;/.test(cell) ? MONO : undefined,
                  }}
                >
                  {String(cell)}
                </Text>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Points({ title, items }) {
  return (
    <View
      className="rounded-2xl px-5 py-5 my-4"
      style={{ backgroundColor: 'rgba(34,211,238,0.06)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.2)' }}
    >
      <View className="flex-row items-center mb-3">
        <Ionicons name="bulb-outline" size={16} color={C.cyan} />
        <Text className="text-sm font-bold ml-2" style={{ color: C.cyan }}>
          {title}
        </Text>
      </View>
      {items.map((item, i) => (
        <View key={i} className="flex-row items-start mb-2">
          <View className="w-1.5 h-1.5 rounded-full mt-2 mr-2.5" style={{ backgroundColor: C.cyan }} />
          <Text className="flex-1 text-[13px] leading-5" style={{ color: '#E2E8F0' }}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Callout({ kind, title, text }) {
  const warn = kind === 'warning';
  const accent = warn ? C.amber : C.green;
  return (
    <View
      className="rounded-2xl px-5 py-5 my-4 flex-row"
      style={{
        backgroundColor: warn ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
        borderWidth: 1,
        borderColor: warn ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.35)',
      }}
    >
      <Ionicons
        name={warn ? 'warning-outline' : 'checkmark-circle-outline'}
        size={18}
        color={accent}
        style={{ marginTop: 1, marginRight: 10 }}
      />
      <View className="flex-1">
        <Text className="text-[13px] font-bold mb-0.5" style={{ color: accent }}>
          {title}
        </Text>
        <Text className="text-[13px] leading-5" style={{ color: '#E2E8F0' }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Text-to-speech helper                                               */
/* ------------------------------------------------------------------ */
function lessonToSpeech(lesson) {
  const parts = lesson.blocks
    .map((b) => {
      if (b.type === 'p') return b.text;
      if (b.type === 'points') return `${b.title}. ${b.items.join('. ')}`;
      if (b.type === 'tip' || b.type === 'warning') return `${b.title}. ${b.text}`;
      return null; // code and tables are not read aloud
    })
    .filter(Boolean);
  return `${lesson.title}. ${parts.join(' ')}`;
}

// The speech engine rejects text longer than 4000 characters,
// so the text is split into chunks of at most 3000 characters at sentence ends.
function splitIntoChunks(text, max = 3000) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text];
  const chunks = [];
  let current = '';
  sentences.forEach((s) => {
    if ((current + s).length > max && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  });
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function SQLBasicsScreen() {
  const insets = useSafeAreaInsets();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedId, setCopiedId] = useState(null); // Tracks which block was copied

  const stopRef = useRef(false); // true when the user (or leaving the screen) stops the audio

  // Stop speaking if the user navigates away from the screen
  useEffect(() => {
    return () => {
      stopRef.current = true;
      Speech.stop();
    };
  }, []);

  // Speak one chunk, then continue with the next when it finishes
  const speakChunks = (chunks, index) => {
    if (stopRef.current || index >= chunks.length) {
      setIsSpeaking(false);
      return;
    }
    Speech.speak(chunks[index], {
      rate: 0.9,
      onDone: () => speakChunks(chunks, index + 1),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Handle Text-to-Speech reading
  const handleReadAloud = () => {
    if (isSpeaking) {
      stopRef.current = true;
      Speech.stop();
      setIsSpeaking(false);
    } else {
      const introText =
        'Section 1: SQL Basics. Learn what SQL is, how databases and tables are organized, and how to read, add, change and delete data.';
      const topicsText = lessonContent.map(lessonToSpeech).join(' Next topic: ');

      stopRef.current = false;
      setIsSpeaking(true);
      speakChunks(splitIntoChunks(`${introText} ${topicsText}`), 0);
    }
  };

  // Handle Copy to Clipboard with temporary checkmark
  const copyToClipboard = async (text, id) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderBlock = (block, lessonId, i) => {
    const key = `${lessonId}-${i}`;
    switch (block.type) {
      case 'p':
        return (
          <Text key={key} className="text-sm leading-6 mb-2" style={{ color: C.text }}>
            {block.text}
          </Text>
        );
      case 'code':
        return <CodeBlock key={key} id={key} code={block.code} copiedId={copiedId} onCopy={copyToClipboard} />;
      case 'table':
        return (
          <DataTable
            key={key}
            caption={block.caption}
            columns={block.columns}
            rows={block.rows}
            flex={block.flex}
            highlight={block.highlight}
          />
        );
      case 'points':
        return <Points key={key} title={block.title} items={block.items} />;
      case 'tip':
        return <Callout key={key} kind="tip" title={block.title} text={block.text} />;
      case 'warning':
        return <Callout key={key} kind="warning" title={block.title} text={block.text} />;
      default:
        return null;
    }
  };

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
       <StatusBar barStyle="light-content" backgroundColor="rgba(30,64,175,0.22)" />

      {/* --- HEADER SECTION --- */}
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
        }}
        className="pb-8 px-6"
      >
        <View className="flex-row items-center justify-between mb-5">
          <TouchableOpacity
            onPress={() => {
              Speech.stop();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="arrow-back" size={22} color="#E2E8F0" />
          </TouchableOpacity>
          <Text className="text-xs font-semibold tracking-wider" style={{ color: C.muted }}>
            Section 1 of 6
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(59,130,246,0.3)', borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="server" size={24} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-extrabold">SQL Basics</Text>
        </View>

        <Text className="text-sm leading-relaxed mb-4" style={{ color: '#BFD3FF' }}>
          Start from zero. Learn what SQL is, how databases and tables are organized, and how to read, add, change and delete data.
        </Text>

        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            className="flex-row items-center px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="book" size={14} color={C.cyan} />
            <Text className="text-white text-xs font-semibold ml-1.5">{lessonContent.length} Topics</Text>
          </View>

          {/* TTS Listen/Stop Button */}
          <TouchableOpacity
            onPress={handleReadAloud}
            className="flex-row items-center px-3 py-1.5 rounded-lg"
            style={{
              borderWidth: 1,
              backgroundColor: isSpeaking ? C.cyan : C.glass,
              borderColor: isSpeaking ? C.cyan : C.border,
            }}
          >
            <Ionicons
              name={isSpeaking ? 'stop-circle' : 'volume-high'}
              size={14}
              color={isSpeaking ? '#020A2A' : C.cyan}
            />
            <Text
              className="text-xs font-semibold ml-1.5"
              style={{ color: isSpeaking ? '#020A2A' : '#fff' }}
            >
              {isSpeaking ? 'Stop Audio' : 'Listen'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- CONTENT LIST --- */}
      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {lessonContent.map((lesson, index) => (
          <View
            key={lesson.id}
            className="px-6 py-6 mb-6 rounded-3xl"
            style={{
              backgroundColor: 'rgba(30,64,175,0.14)',
              borderWidth: 1,
              borderColor: 'rgba(59,130,246,0.25)',
            }}
          >
            {/* Topic Header */}
            <View className="flex-row items-center mb-4">
              <View
                className="w-11 h-11 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: lesson.color + '33', borderWidth: 1, borderColor: lesson.color + '88' }}
              >
                <Ionicons name={lesson.icon} size={20} color={lesson.color} />
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-semibold mb-0.5" style={{ color: C.muted }}>
                  Topic {index + 1} of {lessonContent.length}
                </Text>
                <Text className="text-white font-bold text-lg">{lesson.title}</Text>
              </View>
            </View>

            {/* Topic content */}
            {lesson.blocks.map((block, i) => renderBlock(block, lesson.id, i))}
          </View>
        ))}

        {/* Quick reference */}
        <View
          className="px-6 py-6 mb-6 rounded-3xl"
          style={{ backgroundColor: 'rgba(30,64,175,0.14)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.35)' }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons name="flash" size={18} color={C.cyan} />
            <Text className="text-white font-bold text-lg ml-2">Quick reference</Text>
          </View>
          <Text className="text-[13px] leading-5 mb-1" style={{ color: C.text }}>
            The four commands you learned in this section:
          </Text>
          <DataTable columns={quickReference.columns} rows={quickReference.rows} flex={quickReference.flex} />
        </View>

        {/* Next section */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            Speech.stop();
            router.push('/screen/module2');
          }}
          className="h-14 rounded-2xl overflow-hidden mb-4"
        >
          <LinearGradient
            colors={['#0EA5E9', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text className="text-sm font-bold text-white mr-2">Next section: Queries</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View className="h-12" />
      </ScrollView>
    </LinearGradient>
  );
}