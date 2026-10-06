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

const COURSE_COLS = ['code', 'title', 'credits'];
const COURSE_FLEX = [0.7, 1.9, 0.9];
const COURSES = [
  ['CS', 'Computer Science', 4],
  ['IT', 'Information Technology', 3],
  ['IS', 'Information Systems', 3],
  ['SE', 'Software Engineering', 4],
];

const RESULT_COLS = ['id', 'student_id', 'subject', 'score'];
const RESULT_FLEX = [0.5, 1.2, 1, 0.8];
const RESULTS = [
  [1, 1, 'SQL', 78],
  [2, 1, 'PHP', 85],
  [3, 2, 'SQL', 92],
  [4, 3, 'SQL', 64],
  [5, 4, 'SQL', 71],
  [6, 2, 'PHP', 88],
];

const lessonContent = [
  /* ----------------------------- JOIN ---------------------------- */
  {
    id: '1',
    title: 'JOIN',
    icon: 'git-merge',
    color: '#8B5CF6',
    blocks: [
      {
        type: 'p',
        text: 'Real databases spread their data across several tables. The students table stores only a short course code such as CS. The full course name lives in a separate courses table. A JOIN combines rows from two tables whenever a condition matches, so you can read the related data in one result.',
      },
      {
        type: 'p',
        text: 'This section uses two new tables next to the students table from the previous sections. The courses table lists every course:',
      },
      {
        type: 'table',
        caption: 'courses table: 3 columns, 4 rows',
        columns: COURSE_COLS,
        flex: COURSE_FLEX,
        rows: COURSES,
      },
      {
        type: 'p',
        text: 'The results table stores exam scores. The student_id column points to the id of a student, which is called a foreign key:',
      },
      {
        type: 'table',
        caption: 'results table: 4 columns, 6 rows',
        columns: RESULT_COLS,
        flex: RESULT_FLEX,
        rows: RESULTS,
      },
      { type: 'p', text: 'To show each student with the full name of their course:' },
      {
        type: 'code',
        code: `SELECT students.name, courses.title
FROM students
INNER JOIN courses
  ON students.course = courses.code;`,
      },
      {
        type: 'table',
        caption: 'Result: 5 rows',
        columns: ['name', 'title'],
        flex: [1, 1.6],
        rows: [
          ['John', 'Computer Science'],
          ['Mary', 'Information Technology'],
          ['Ibrahim', 'Computer Science'],
          ['Fatima', 'Information Systems'],
          ['Yusuf', 'Software Engineering'],
        ],
      },
      {
        type: 'points',
        title: 'How to read it',
        items: [
          'FROM names the first table, and JOIN names the second one.',
          'ON explains how the rows match. Here, the course code in students must equal the code in courses.',
          'Writing the table name before the column (students.name) avoids confusion when both tables have a column with the same name.',
        ],
      },
      { type: 'p', text: 'Table aliases make long queries shorter. This query gives exactly the same result:' },
      {
        type: 'code',
        code: `SELECT s.name, c.title
FROM students s
INNER JOIN courses c
  ON s.course = c.code;`,
      },
      {
        type: 'p',
        text: 'INNER JOIN keeps only the rows that have a match in both tables. Joining students to results shows this clearly. Yusuf has no results, so he does not appear:',
      },
      {
        type: 'code',
        code: `SELECT s.name, r.subject, r.score
FROM students s
INNER JOIN results r
  ON r.student_id = s.id;`,
      },
      {
        type: 'table',
        caption: 'Result: 6 rows, no row for Yusuf',
        columns: ['name', 'subject', 'score'],
        flex: [1, 1, 0.8],
        rows: [
          ['John', 'SQL', 78],
          ['John', 'PHP', 85],
          ['Mary', 'SQL', 92],
          ['Ibrahim', 'SQL', 64],
          ['Fatima', 'SQL', 71],
          ['Mary', 'PHP', 88],
        ],
      },
      {
        type: 'p',
        text: 'A LEFT JOIN keeps every row from the left table (the one after FROM), even when nothing matches. The missing values are filled with NULL:',
      },
      {
        type: 'code',
        code: `SELECT s.name, r.subject, r.score
FROM students s
LEFT JOIN results r
  ON r.student_id = s.id
ORDER BY s.id, r.id;`,
      },
      {
        type: 'table',
        caption: 'Result: 7 rows, Yusuf appears with NULL',
        columns: ['name', 'subject', 'score'],
        flex: [1, 1, 0.8],
        rows: [
          ['John', 'SQL', 78],
          ['John', 'PHP', 85],
          ['Mary', 'SQL', 92],
          ['Mary', 'PHP', 88],
          ['Ibrahim', 'SQL', 64],
          ['Fatima', 'SQL', 71],
          ['Yusuf', 'NULL', 'NULL'],
        ],
        highlight: [6],
      },
      {
        type: 'table',
        caption: 'Types of JOIN',
        columns: ['Type', 'Keeps'],
        flex: [1, 2.2],
        rows: [
          ['INNER JOIN', 'Only rows that match in both tables'],
          ['LEFT JOIN', 'All rows from the left table, plus matches from the right'],
          ['RIGHT JOIN', 'All rows from the right table, plus matches from the left'],
          ['FULL JOIN', 'All rows from both tables'],
        ],
      },
      {
        type: 'warning',
        title: 'Never forget ON',
        text: 'A join without a matching condition pairs every row of one table with every row of the other. Joining 5 students with 4 courses would return 20 rows, almost all of them wrong.',
      },
      {
        type: 'tip',
        title: 'Different databases',
        text: 'INNER JOIN and LEFT JOIN work everywhere. MySQL has no FULL JOIN, and older versions of SQLite have no RIGHT JOIN or FULL JOIN.',
      },
    ],
  },

  /* ---------------------------- GROUP BY ------------------------- */
  {
    id: '2',
    title: 'GROUP BY',
    icon: 'albums',
    color: '#22C55E',
    blocks: [
      {
        type: 'p',
        text: 'So far every query returned individual rows. GROUP BY gathers rows that share the same value into groups, so you can get one summary row per group. It is how you answer questions such as how many students are in each course, or what the average score is for each subject.',
      },
      {
        type: 'p',
        text: 'GROUP BY is used with an aggregate function that summarizes each group. Here COUNT(*) counts the rows in each group. The next topics explain every aggregate function in detail.',
      },
      { type: 'code', code: 'SELECT course, COUNT(*) AS students\nFROM students\nGROUP BY course;' },
      {
        type: 'table',
        caption: 'Result: one row per course',
        columns: ['course', 'students'],
        flex: [1, 1],
        rows: [
          ['CS', 2],
          ['IT', 1],
          ['IS', 1],
          ['SE', 1],
        ],
      },
      {
        type: 'p',
        text: 'The database puts John and Ibrahim in one CS group, then counts the rows in each group. You can use several aggregate functions in the same query. This summarizes the results table by subject:',
      },
      {
        type: 'code',
        code: `SELECT subject,
       COUNT(*) AS total,
       AVG(score) AS average
FROM results
GROUP BY subject;`,
      },
      {
        type: 'table',
        caption: 'Result: one row per subject',
        columns: ['subject', 'total', 'average'],
        flex: [1, 0.8, 1],
        rows: [
          ['SQL', 4, 76.25],
          ['PHP', 2, 86.5],
        ],
      },
      {
        type: 'p',
        text: 'The highest score of each student comes from grouping by the student:',
      },
      {
        type: 'code',
        code: 'SELECT student_id, MAX(score) AS best\nFROM results\nGROUP BY student_id;',
      },
      {
        type: 'table',
        caption: 'Result: best score per student',
        columns: ['student_id', 'best'],
        flex: [1, 1],
        rows: [
          [1, 85],
          [2, 92],
          [3, 64],
          [4, 71],
        ],
      },
      {
        type: 'warning',
        title: 'The golden rule',
        text: 'Every column in SELECT must either appear in GROUP BY or be inside an aggregate function. Selecting name together with GROUP BY course is an error, because a group of several students has no single name.',
      },
    ],
  },

  /* ----------------------------- HAVING -------------------------- */
  {
    id: '3',
    title: 'HAVING',
    icon: 'filter',
    color: '#F59E0B',
    blocks: [
      {
        type: 'p',
        text: 'WHERE filters individual rows before they are grouped. It cannot filter on the result of an aggregate function, because that result does not exist yet. HAVING solves this: it filters the groups after GROUP BY has built them.',
      },
      {
        type: 'code',
        code: `SELECT subject, AVG(score) AS average
FROM results
GROUP BY subject
HAVING AVG(score) > 80;`,
      },
      {
        type: 'table',
        caption: 'Result: only PHP has an average above 80',
        columns: ['subject', 'average'],
        flex: [1, 1],
        rows: [['PHP', 86.5]],
      },
      {
        type: 'table',
        caption: 'WHERE compared with HAVING',
        columns: ['Clause', 'Filters', 'Runs'],
        flex: [0.9, 1.3, 1.4],
        rows: [
          ['WHERE', 'Single rows', 'Before grouping'],
          ['HAVING', 'Groups', 'After grouping'],
        ],
      },
      {
        type: 'p',
        text: 'You can use both in one query. WHERE first removes low scores, then GROUP BY builds the groups, and HAVING keeps only the subjects that still have more than two results:',
      },
      {
        type: 'code',
        code: `SELECT subject,
       COUNT(*) AS total,
       AVG(score) AS average
FROM results
WHERE score >= 70
GROUP BY subject
HAVING COUNT(*) > 2;`,
      },
      {
        type: 'table',
        caption: 'Result: SQL has 3 scores of 70 or more',
        columns: ['subject', 'total', 'average'],
        flex: [1, 0.8, 1],
        rows: [['SQL', 3, 80.33]],
      },
      {
        type: 'points',
        title: 'Order of the clauses',
        items: [
          'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT',
          'The database runs them in a different logical order: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT.',
        ],
      },
      {
        type: 'tip',
        title: 'Rule of thumb',
        text: 'If the condition uses COUNT, SUM, AVG, MIN or MAX, it belongs in HAVING. Otherwise, use WHERE, which is also faster because it reduces the rows early.',
      },
    ],
  },

  /* ------------------------ AGGREGATE FUNCTIONS ------------------ */
  {
    id: '4',
    title: 'Aggregate functions',
    icon: 'calculator',
    color: '#22D3EE',
    blocks: [
      {
        type: 'p',
        text: 'An aggregate function reads many rows and returns a single value that summarizes them. There are five you will use all the time:',
      },
      {
        type: 'table',
        caption: 'The five main aggregate functions',
        columns: ['Function', 'Returns', 'Example'],
        flex: [1, 1.3, 1.4],
        rows: [
          ['COUNT()', 'Number of rows', 'COUNT(*)'],
          ['SUM()', 'Total of a column', 'SUM(score)'],
          ['AVG()', 'Average value', 'AVG(score)'],
          ['MIN()', 'Smallest value', 'MIN(score)'],
          ['MAX()', 'Largest value', 'MAX(score)'],
        ],
      },
      {
        type: 'p',
        text: 'Without GROUP BY, an aggregate function summarizes the whole table and returns a single row. AS gives each result a readable name:',
      },
      {
        type: 'code',
        code: `SELECT COUNT(*) AS total,
       SUM(score) AS sum_score,
       AVG(score) AS average,
       MIN(score) AS lowest,
       MAX(score) AS highest
FROM results;`,
      },
      {
        type: 'table',
        caption: 'Result: one row for the whole results table',
        columns: ['total', 'sum_score', 'average', 'lowest', 'highest'],
        flex: [0.8, 1.1, 1, 0.9, 1],
        rows: [[6, 478, 79.67, 64, 92]],
      },
      {
        type: 'p',
        text: 'They also work with WHERE. WHERE filters the rows first, and then the function summarizes what is left:',
      },
      { type: 'code', code: "SELECT COUNT(*) AS cs_students\nFROM students\nWHERE course = 'CS';" },
      {
        type: 'table',
        caption: 'Result: John and Ibrahim',
        columns: ['cs_students'],
        rows: [[2]],
      },
      {
        type: 'points',
        title: 'Good to know',
        items: [
          'COUNT(*) counts every row. COUNT(column) counts only the rows where that column is not NULL.',
          'SUM, AVG, MIN and MAX ignore NULL values.',
          'SUM and AVG work on numbers. MIN and MAX also work on text and dates.',
          'The average of 6 scores is 79.666..., and each database rounds it in its own way.',
        ],
      },
    ],
  },

  /* ---------------------------- SUBQUERIES ----------------------- */
  {
    id: '5',
    title: 'Subqueries',
    icon: 'layers',
    color: '#EC4899',
    blocks: [
      {
        type: 'p',
        text: 'A subquery is a query placed inside another query, written between parentheses. The database runs the inner query first and uses its result in the outer query. It lets you answer a question in two steps without saving anything in between.',
      },
      {
        type: 'p',
        text: 'First, a subquery that returns a single value. Which scores are above the average score? The inner query calculates the average (79.67), and the outer query compares each score to it:',
      },
      {
        type: 'code',
        code: `SELECT * FROM results
WHERE score > (
  SELECT AVG(score) FROM results
);`,
      },
      {
        type: 'table',
        caption: 'Result: scores above 79.67',
        columns: RESULT_COLS,
        flex: RESULT_FLEX,
        rows: [RESULTS[1], RESULTS[2], RESULTS[5]],
      },
      {
        type: 'p',
        text: 'A subquery can also return a list of values, which you can use with IN. Which students have at least one result?',
      },
      {
        type: 'code',
        code: `SELECT name FROM students
WHERE id IN (
  SELECT student_id FROM results
);`,
      },
      {
        type: 'table',
        caption: 'Result: 4 students',
        columns: ['name'],
        rows: [['John'], ['Mary'], ['Ibrahim'], ['Fatima']],
      },
      { type: 'p', text: 'With NOT IN you get the opposite: students who have no results yet.' },
      {
        type: 'code',
        code: `SELECT name FROM students
WHERE id NOT IN (
  SELECT student_id FROM results
);`,
      },
      {
        type: 'table',
        caption: 'Result: 1 student',
        columns: ['name'],
        rows: [['Yusuf']],
        highlight: [0],
      },
      {
        type: 'points',
        title: 'Subquery or JOIN?',
        items: [
          'Many subqueries can be written as a JOIN, and a JOIN is often faster on large tables.',
          'A subquery is often easier to read, especially when you compare a value with a calculated one such as an average.',
          'A subquery that returns one value works with =, >, < and similar operators. A subquery that returns a list works with IN.',
        ],
      },
    ],
  },
];

const combinedExample = {
  id: 'combo',
  title: 'Putting it together',
  icon: 'sparkles',
  color: '#22D3EE',
  blocks: [
    {
      type: 'p',
      text: 'This query joins three tables, groups the scores by course, and sorts the courses from the best average to the worst:',
    },
    {
      type: 'code',
      code: `SELECT c.title,
       COUNT(*) AS exams,
       AVG(r.score) AS average
FROM results r
INNER JOIN students s ON r.student_id = s.id
INNER JOIN courses c ON s.course = c.code
GROUP BY c.title
ORDER BY average DESC;`,
    },
    {
      type: 'table',
      caption: 'Result: average score per course',
      columns: ['title', 'exams', 'average'],
      flex: [1.9, 0.8, 1],
      rows: [
        ['Information Technology', 2, 90],
        ['Computer Science', 3, 75.67],
        ['Information Systems', 1, 71],
      ],
    },
    {
      type: 'p',
      text: 'Software Engineering does not appear because its only student, Yusuf, has no results, and an INNER JOIN drops rows without a match.',
    },
  ],
};

const quickReference = {
  columns: ['Keyword', 'What it does', 'Example'],
  flex: [0.9, 1.3, 1.9],
  rows: [
    ['JOIN', 'Combines two tables', 'JOIN courses c ON s.course = c.code'],
    ['GROUP BY', 'Makes groups of rows', 'GROUP BY subject'],
    ['HAVING', 'Filters groups', 'HAVING COUNT(*) > 2'],
    ['COUNT SUM AVG MIN MAX', 'Summarize rows', 'AVG(score)'],
    ['Subquery', 'Query inside a query', 'WHERE id IN (SELECT ...)'],
  ],
};

/* ------------------------------------------------------------------ */
/* SQL syntax highlighting                                             */
/* ------------------------------------------------------------------ */
const STATEMENT_WORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
const CLAUSE_WORDS = [
  'FROM', 'WHERE', 'SET', 'INTO', 'VALUES', 'TABLE', 'PRIMARY', 'KEY', 'AND', 'OR', 'NOT', 'NULL',
  'ORDER', 'BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'LIKE', 'ILIKE', 'IN', 'BETWEEN', 'ASC', 'DESC', 'TOP',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'GROUP', 'HAVING',
];
const FUNCTION_WORDS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];

function tokenColor(token) {
  const upper = token.toUpperCase();
  if (token.startsWith("'")) return C.amber;
  if (/^\d+$/.test(token)) return '#FACC15';
  if (STATEMENT_WORDS.includes(upper)) return C.cyan;
  if (CLAUSE_WORDS.includes(upper)) return '#F472B6';
  if (FUNCTION_WORDS.includes(upper)) return '#A78BFA';
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="px-5 py-4">
          <SqlText code={code} />
        </View>
      </ScrollView>
    </View>
  );
}

function DataTable({ caption, columns, rows, flex, highlight = [] }) {
  return (
    <View className="my-4">
      {caption ? (
        <View className="flex-row items-center mb-2">
          <Ionicons name="grid-outline" size={13} color={C.muted} />
          <Text className="text-[11px] font-semibold ml-1.5 flex-1" style={{ color: C.muted }}>
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
                    color: isHighlight ? '#DCFCE7' : cell === 'NULL' ? C.muted : C.text,
                    fontWeight: isHighlight ? '700' : '400',
                    fontStyle: cell === 'NULL' ? 'italic' : 'normal',
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
export default function IntermediateSQLScreen() {
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
        'Section 3: Intermediate SQL. Learn how to combine tables with joins, summarize data with groups and aggregate functions, and use queries inside other queries.';
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
            Section 3 of 6
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(139,92,246,0.25)', borderWidth: 1, borderColor: 'rgba(139,92,246,0.6)' }}
          >
            <Ionicons name="git-merge" size={24} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-extrabold">Intermediate SQL</Text>
        </View>

        <Text className="text-sm leading-relaxed mb-4" style={{ color: '#BFD3FF' }}>
          Work with more than one table. Learn how to join tables, group rows, summarize data with aggregate functions and use queries inside other queries.
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
            router.push('/screen/module4');
          }}
          className="h-14 rounded-2xl overflow-hidden mb-4"
        >
          <LinearGradient
            colors={['#0EA5E9', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text className="text-sm font-bold text-white mr-2">Next section: Advanced SQL</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View className="h-12" />
      </ScrollView>
    </LinearGradient>
  );
}