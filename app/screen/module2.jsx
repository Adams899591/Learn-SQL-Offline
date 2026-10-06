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
  /* ---------------------------- WHERE ---------------------------- */
  {
    id: '1',
    title: 'WHERE',
    icon: 'funnel',
    color: '#3B82F6',
    blocks: [
      {
        type: 'p',
        text: 'WHERE filters rows. Without it, a query returns every row in the table. With it, the database checks each row against your condition and keeps only the rows where the condition is true.',
      },
      {
        type: 'table',
        caption: 'The students table used in every example of this section',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: STUDENTS,
      },
      { type: 'p', text: 'To find the students who study CS:' },
      { type: 'code', code: "SELECT * FROM students\nWHERE course = 'CS';" },
      {
        type: 'table',
        caption: 'Result: 2 rows',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[0], STUDENTS[2]],
      },
      {
        type: 'p',
        text: 'A condition is built with a comparison operator. These are the ones you will use most often:',
      },
      {
        type: 'table',
        caption: 'Comparison operators',
        columns: ['Operator', 'Meaning', 'Example'],
        flex: [0.9, 1.4, 1.5],
        rows: [
          ['=', 'Equal to', "course = 'CS'"],
          ['<> or !=', 'Not equal to', "course <> 'CS'"],
          ['>', 'Greater than', 'age > 22'],
          ['<', 'Less than', 'age < 22'],
          ['>=', 'Greater than or equal to', 'age >= 23'],
          ['<=', 'Less than or equal to', 'age <= 22'],
        ],
      },
      {
        type: 'p',
        text: 'You can combine conditions. AND needs both conditions to be true. OR needs at least one of them to be true.',
      },
      { type: 'code', code: "SELECT * FROM students\nWHERE course = 'CS' AND age > 21;" },
      {
        type: 'table',
        caption: 'AND: only John is in CS and older than 21',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[0]],
      },
      { type: 'code', code: "SELECT * FROM students\nWHERE course = 'IT' OR course = 'IS';" },
      {
        type: 'table',
        caption: 'OR: students in IT or in IS',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[1], STUDENTS[3]],
      },
      {
        type: 'tip',
        title: 'Remember',
        text: 'Text values need single quotes (\'CS\'). Numbers do not (22). Column names are never quoted.',
      },
    ],
  },

  /* -------------------------- ORDER BY --------------------------- */
  {
    id: '2',
    title: 'ORDER BY',
    icon: 'swap-vertical',
    color: '#22C55E',
    blocks: [
      {
        type: 'p',
        text: 'A table does not store its rows in any promised order. ORDER BY sorts the result so it always comes back in the order you want. It goes after FROM and WHERE.',
      },
      { type: 'code', code: 'SELECT name, age FROM students\nORDER BY age ASC;' },
      {
        type: 'table',
        caption: 'Youngest first (ASC = ascending, the default)',
        columns: ['name', 'age'],
        flex: [1, 1],
        rows: [
          ['Ibrahim', 21],
          ['John', 22],
          ['Yusuf', 22],
          ['Mary', 23],
          ['Fatima', 24],
        ],
      },
      { type: 'p', text: 'Use DESC for descending order, from the largest value to the smallest.' },
      {
        type: 'p',
        text: 'John and Yusuf are both 22. When rows tie, you can add a second column to decide. The database sorts by the first column, then uses the next one to break ties:',
      },
      { type: 'code', code: 'SELECT name, age FROM students\nORDER BY age DESC, name ASC;' },
      {
        type: 'table',
        caption: 'Oldest first, ties sorted by name',
        columns: ['name', 'age'],
        flex: [1, 1],
        rows: [
          ['Fatima', 24],
          ['Mary', 23],
          ['John', 22],
          ['Yusuf', 22],
          ['Ibrahim', 21],
        ],
      },
      {
        type: 'points',
        title: 'Key points',
        items: [
          'ASC sorts from low to high (A to Z). It is the default.',
          'DESC sorts from high to low (Z to A).',
          'Text is sorted alphabetically, numbers by value, dates by time.',
          'Sort by several columns by separating them with commas.',
        ],
      },
    ],
  },

  /* ---------------------------- LIMIT ---------------------------- */
  {
    id: '3',
    title: 'LIMIT',
    icon: 'cut',
    color: '#F59E0B',
    blocks: [
      {
        type: 'p',
        text: 'LIMIT sets the maximum number of rows a query returns. It is useful when a table is large and you only need a sample, the top results, or one page of results at a time.',
      },
      { type: 'code', code: 'SELECT * FROM students\nLIMIT 3;' },
      {
        type: 'table',
        caption: 'Result: the first 3 rows',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[0], STUDENTS[1], STUDENTS[2]],
      },
      {
        type: 'p',
        text: 'LIMIT becomes powerful when you combine it with ORDER BY. This finds the two oldest students:',
      },
      { type: 'code', code: 'SELECT name, age FROM students\nORDER BY age DESC\nLIMIT 2;' },
      {
        type: 'table',
        caption: 'Top 2 by age',
        columns: ['name', 'age'],
        flex: [1, 1],
        rows: [
          ['Fatima', 24],
          ['Mary', 23],
        ],
      },
      {
        type: 'p',
        text: 'OFFSET skips rows before the limit starts. It is how apps build pages: page 1 skips 0 rows, page 2 skips 2 rows, and so on.',
      },
      { type: 'code', code: 'SELECT * FROM students\nORDER BY id\nLIMIT 2 OFFSET 2;' },
      {
        type: 'table',
        caption: 'Page 2 with 2 rows per page',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[2], STUDENTS[3]],
      },
      {
        type: 'warning',
        title: 'Always sort first',
        text: 'Without ORDER BY, "the first 3 rows" is not guaranteed to be the same rows every time. Sort the data when the result matters.',
      },
      {
        type: 'tip',
        title: 'Different databases',
        text: 'LIMIT works in MySQL, PostgreSQL and SQLite. SQL Server uses SELECT TOP 3 instead, and Oracle uses FETCH FIRST 3 ROWS ONLY.',
      },
    ],
  },

  /* --------------------------- DISTINCT -------------------------- */
  {
    id: '4',
    title: 'DISTINCT',
    icon: 'sparkles',
    color: '#EC4899',
    blocks: [
      {
        type: 'p',
        text: 'A column can contain the same value many times. Selecting the course column returns CS twice, because two students study CS. DISTINCT removes the duplicates so every value appears once.',
      },
      { type: 'code', code: 'SELECT course FROM students;' },
      {
        type: 'table',
        caption: 'Without DISTINCT: 5 rows, CS appears twice',
        columns: ['course'],
        rows: [['CS'], ['IT'], ['CS'], ['IS'], ['SE']],
        highlight: [0, 2],
      },
      { type: 'code', code: 'SELECT DISTINCT course FROM students;' },
      {
        type: 'table',
        caption: 'With DISTINCT: 4 rows, each course once',
        columns: ['course'],
        rows: [['CS'], ['IT'], ['IS'], ['SE']],
      },
      {
        type: 'points',
        title: 'How it works',
        items: [
          'DISTINCT goes right after SELECT.',
          'With several columns, DISTINCT removes rows where the whole combination repeats, not each column on its own.',
          'It does not change the table. It only changes what the query returns.',
        ],
      },
      {
        type: 'tip',
        title: 'When to use it',
        text: 'Use DISTINCT to build a list of options, such as every course offered or every city in a customer table.',
      },
    ],
  },

  /* ----------------------------- LIKE ---------------------------- */
  {
    id: '5',
    title: 'LIKE',
    icon: 'text',
    color: '#22D3EE',
    blocks: [
      {
        type: 'p',
        text: 'WHERE with = needs an exact match. LIKE searches for a pattern instead, which is what you need when you only know part of a value, such as the first letter of a name.',
      },
      { type: 'p', text: 'LIKE uses two wildcard characters:' },
      {
        type: 'points',
        title: 'Wildcards',
        items: [
          '% stands for any number of characters, including none.',
          '_ stands for exactly one character.',
        ],
      },
      {
        type: 'table',
        caption: 'Common patterns',
        columns: ['Pattern', 'Meaning', 'Matches'],
        flex: [0.9, 1.4, 1.5],
        rows: [
          ["'F%'", 'Starts with F', 'Fatima'],
          ["'%a'", 'Ends with a', 'Fatima'],
          ["'%a%'", 'Contains a', 'Mary, Ibrahim, Fatima'],
          ["'_ary'", 'Any letter, then ary', 'Mary'],
        ],
      },
      { type: 'code', code: "SELECT * FROM students\nWHERE name LIKE '%a%';" },
      {
        type: 'table',
        caption: 'Result: names that contain the letter a',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[1], STUDENTS[2], STUDENTS[3]],
      },
      {
        type: 'tip',
        title: 'Case sensitivity',
        text: 'In MySQL and SQLite, LIKE ignores upper and lower case. In PostgreSQL, LIKE is case-sensitive, so use ILIKE to ignore case.',
      },
      {
        type: 'warning',
        title: 'Performance',
        text: 'A pattern that starts with % (such as \'%a\') forces the database to read every row. On very large tables, prefer patterns that start with fixed text, like \'F%\'.',
      },
    ],
  },

  /* ------------------------------ IN ----------------------------- */
  {
    id: '6',
    title: 'IN',
    icon: 'list',
    color: '#8B5CF6',
    blocks: [
      {
        type: 'p',
        text: 'IN checks whether a value matches any value in a list. It is a shorter, cleaner way to write several OR conditions on the same column.',
      },
      { type: 'code', code: "SELECT * FROM students\nWHERE course IN ('CS', 'IT');" },
      {
        type: 'table',
        caption: 'Result: students in CS or IT',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[0], STUDENTS[1], STUDENTS[2]],
      },
      { type: 'p', text: 'This is the same query written with OR. The result is identical, but it is longer and easier to get wrong:' },
      { type: 'code', code: "SELECT * FROM students\nWHERE course = 'CS' OR course = 'IT';" },
      { type: 'p', text: 'Add NOT to get everything that is not in the list:' },
      { type: 'code', code: "SELECT * FROM students\nWHERE course NOT IN ('CS', 'IT');" },
      {
        type: 'table',
        caption: 'Result: students in neither CS nor IT',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[3], STUDENTS[4]],
      },
      {
        type: 'tip',
        title: 'Good to know',
        text: 'The list can also come from another query, called a subquery. You will meet that in Intermediate SQL.',
      },
    ],
  },

  /* ---------------------------- BETWEEN -------------------------- */
  {
    id: '7',
    title: 'BETWEEN',
    icon: 'swap-horizontal',
    color: '#EF4444',
    blocks: [
      {
        type: 'p',
        text: 'BETWEEN selects values inside a range. It works with numbers, text and dates, and it includes both end values.',
      },
      { type: 'code', code: 'SELECT * FROM students\nWHERE age BETWEEN 22 AND 23;' },
      {
        type: 'table',
        caption: 'Result: ages 22 and 23 are both included',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[0], STUDENTS[1], STUDENTS[4]],
      },
      { type: 'p', text: 'It is the same as writing two comparisons joined by AND:' },
      { type: 'code', code: 'SELECT * FROM students\nWHERE age >= 22 AND age <= 23;' },
      { type: 'p', text: 'Use NOT BETWEEN to get the values outside the range:' },
      { type: 'code', code: 'SELECT * FROM students\nWHERE age NOT BETWEEN 22 AND 23;' },
      {
        type: 'table',
        caption: 'Result: younger than 22 or older than 23',
        columns: STUDENT_COLS,
        flex: STUDENT_FLEX,
        rows: [STUDENTS[2], STUDENTS[3]],
      },
      {
        type: 'warning',
        title: 'Order matters',
        text: 'Write the smaller value first. BETWEEN 23 AND 22 returns no rows, because no number is both at least 23 and at most 22.',
      },
      {
        type: 'tip',
        title: 'Dates',
        text: "BETWEEN is very handy for dates, for example WHERE created_at BETWEEN '2026-01-01' AND '2026-12-31'.",
      },
    ],
  },
];

const combinedExample = {
  id: 'combo',
  title: 'Putting it together',
  icon: 'layers',
  color: '#22D3EE',
  blocks: [
    {
      type: 'p',
      text: 'Real queries use several of these clauses together. They must always appear in this order: SELECT, FROM, WHERE, ORDER BY, LIMIT.',
    },
    {
      type: 'code',
      code: `SELECT name, age
FROM students
WHERE age BETWEEN 21 AND 23
  AND course IN ('CS', 'IT')
ORDER BY age DESC
LIMIT 2;`,
    },
    {
      type: 'table',
      caption: 'Result: the two oldest CS or IT students aged 21 to 23',
      columns: ['name', 'age'],
      flex: [1, 1],
      rows: [
        ['Mary', 23],
        ['John', 22],
      ],
    },
    {
      type: 'p',
      text: 'The database reads it in a logical order: find the table, filter the rows, sort what is left, then keep only the first two.',
    },
  ],
};

const quickReference = {
  columns: ['Keyword', 'What it does', 'Example'],
  flex: [0.9, 1.2, 1.9],
  rows: [
    ['WHERE', 'Filters rows', "WHERE course = 'CS'"],
    ['ORDER BY', 'Sorts the result', 'ORDER BY age DESC'],
    ['LIMIT', 'Caps the row count', 'LIMIT 5'],
    ['DISTINCT', 'Removes duplicates', 'SELECT DISTINCT course'],
    ['LIKE', 'Matches a pattern', "name LIKE 'F%'"],
    ['IN', 'Matches a list', "course IN ('CS', 'IT')"],
    ['BETWEEN', 'Matches a range', 'age BETWEEN 22 AND 23'],
  ],
};

/* ------------------------------------------------------------------ */
/* SQL syntax highlighting                                             */
/* ------------------------------------------------------------------ */
const STATEMENT_WORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
const CLAUSE_WORDS = [
  'FROM', 'WHERE', 'SET', 'INTO', 'VALUES', 'TABLE', 'PRIMARY', 'KEY', 'AND', 'OR', 'NOT', 'NULL',
  'ORDER', 'BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'LIKE', 'ILIKE', 'IN', 'BETWEEN', 'ASC', 'DESC', 'TOP',
];

function tokenColor(token) {
  const upper = token.toUpperCase();
  if (token.startsWith("'")) return C.amber;
  if (/^\d+$/.test(token)) return '#FACC15';
  if (STATEMENT_WORDS.includes(upper)) return C.cyan;
  if (CLAUSE_WORDS.includes(upper)) return '#F472B6';
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
      className="rounded-2xl overflow-hidden my-4"
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
      <View className="px-5 py-4">
        <SqlText code={code} />
      </View>
    </View>
  );
}

function DataTable({ caption, columns, rows, flex, highlight = [] }) {
  return (
    <View className="my-4">
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
                    fontFamily: typeof cell === 'string' && /[%_(;<>=]/.test(cell) ? MONO : undefined,
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
        <Text className="text-[13px] font-bold mb-1" style={{ color: accent }}>
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
/* Text-to-speech helpers                                              */
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
export default function QueriesScreen() {
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
        'Section 2: Queries. Learn how to filter, sort, limit and search the data you get back from a table.';
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

  const renderLessonCard = (lesson, label) => (
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
            {label}
          </Text>
          <Text className="text-white font-bold text-lg">{lesson.title}</Text>
        </View>
      </View>

      {/* Topic content */}
      {lesson.blocks.map((block, i) => renderBlock(block, lesson.id, i))}
    </View>
  );

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
              stopRef.current = true;
              Speech.stop();
              router.back();
            }}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="arrow-back" size={22} color="#E2E8F0" />
          </TouchableOpacity>
          <Text className="text-xs font-semibold tracking-wider" style={{ color: C.muted }}>
            Section 2 of 6
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(34,197,94,0.25)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.6)' }}
          >
            <Ionicons name="code-slash" size={24} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-extrabold">Queries</Text>
        </View>

        <Text className="text-sm leading-relaxed mb-4" style={{ color: '#BFD3FF' }}>
          Get exactly the data you need. Learn how to filter rows, sort results, limit how many come back, remove duplicates and search with patterns.
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
        {lessonContent.map((lesson, index) =>
          renderLessonCard(lesson, `Topic ${index + 1} of ${lessonContent.length}`)
        )}

        {/* Combined example */}
        {renderLessonCard(combinedExample, 'Bonus example')}

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
            The keywords you learned in this section:
          </Text>
          <DataTable columns={quickReference.columns} rows={quickReference.rows} flex={quickReference.flex} />
        </View>

        {/* Next section */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            stopRef.current = true;
            Speech.stop();
            router.push('/screen/module3');
          }}
          className="h-14 rounded-2xl overflow-hidden mb-4"
        >
          <LinearGradient
            colors={['#0EA5E9', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text className="text-sm font-bold text-white mr-2">Next section: Intermediate SQL</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View className="h-12" />
      </ScrollView>
    </LinearGradient>
  );
}