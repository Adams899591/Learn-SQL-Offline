import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
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
  rose: '#F87171',
  pink: '#EC4899',
  muted: '#93A4C7',
  text: '#CBD5E1',
};

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

/* ------------------------------------------------------------------ */
/* Sample data (same tables as the lessons)                            */
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

/* ------------------------------------------------------------------ */
/* Quiz questions                                                      */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    id: 'q1',
    question: 'Which command reads data from a table?',
    options: ['SELECT', 'INSERT', 'UPDATE', 'FETCH'],
    correct: 0,
    explanation: 'SELECT reads data and never changes it. INSERT adds rows, UPDATE changes rows, and FETCH is not an SQL command for reading a table.',
  },
  {
    id: 'q2',
    question: 'What does DELETE FROM students; do when it has no WHERE clause?',
    options: [
      'Deletes nothing',
      'Removes every row but keeps the table',
      'Removes the whole table',
      'Removes only the first row',
    ],
    correct: 1,
    explanation: 'Without WHERE, DELETE affects every row. The table and its columns remain. Removing the table itself needs DROP TABLE.',
  },
  {
    id: 'q3',
    question: 'Which clause filters groups after GROUP BY has built them?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correct: 1,
    explanation: 'WHERE filters single rows before grouping. HAVING filters the groups afterwards, so it can use COUNT, AVG and other aggregate functions.',
  },
  {
    id: 'q4',
    question: "What does SELECT COUNT(*) FROM students WHERE course = 'CS'; return?",
    options: ['1', '2', '3', '5'],
    correct: 1,
    explanation: 'Two students study CS: John and Ibrahim. COUNT(*) counts the rows that remain after WHERE.',
  },
  {
    id: 'q5',
    question: 'Which join keeps every row from the left table, even when there is no match?',
    options: ['INNER JOIN', 'LEFT JOIN', 'CROSS JOIN', 'SELF JOIN'],
    correct: 1,
    explanation: 'LEFT JOIN keeps all rows from the table after FROM and fills the missing columns from the right table with NULL.',
  },
  {
    id: 'q6',
    question: 'Which condition finds names that start with the letter F?',
    options: ["name = 'F'", "name LIKE '%F'", "name LIKE 'F%'", "name IN ('F')"],
    correct: 2,
    explanation: "The % wildcard stands for any number of characters, so 'F%' means F followed by anything. '%F' would find names that end with F.",
  },
  {
    id: 'q7',
    question: 'Which values does age BETWEEN 22 AND 23 include?',
    options: ['Only 22', 'Only 23', 'Both 22 and 23', 'Neither 22 nor 23'],
    correct: 2,
    explanation: 'BETWEEN includes both end values. It is the same as age >= 22 AND age <= 23.',
  },
  {
    id: 'q8',
    question: 'Which statement undoes the changes made since BEGIN in a transaction?',
    options: ['COMMIT', 'SAVE', 'ROLLBACK', 'UNDO'],
    correct: 2,
    explanation: 'ROLLBACK cancels every change made since the transaction began. COMMIT does the opposite and makes the changes permanent.',
  },
];

/* ------------------------------------------------------------------ */
/* SQL challenges                                                      */
/* ------------------------------------------------------------------ */
const challenges = [
  {
    id: 'c1',
    level: 'Easy',
    title: 'Older students',
    task: 'Write a query that returns only the names of students who are older than 22.',
    hint: 'You need SELECT, FROM and a WHERE condition on age.',
    solution: 'SELECT name\nFROM students\nWHERE age > 22;',
    result: { caption: 'Expected result: 2 rows', columns: ['name'], rows: [['Mary'], ['Fatima']] },
    explanation: 'WHERE age > 22 keeps Mary (23) and Fatima (24). Selecting only the name column keeps the result short.',
  },
  {
    id: 'c2',
    level: 'Easy',
    title: 'Students per course',
    task: 'Show each course code together with the number of students who study it.',
    hint: 'Group the rows by course and count each group.',
    solution: 'SELECT course, COUNT(*) AS students\nFROM students\nGROUP BY course;',
    result: {
      caption: 'Expected result: 4 rows',
      columns: ['course', 'students'],
      flex: [1, 1],
      rows: [['CS', 2], ['IT', 1], ['IS', 1], ['SE', 1]],
    },
    explanation: 'GROUP BY course puts John and Ibrahim in one group. COUNT(*) then counts the rows in each group.',
  },
  {
    id: 'c3',
    level: 'Medium',
    title: 'The top score',
    task: 'Find the single best exam result and show the name of the student, the subject and the score.',
    hint: 'Join results to students, sort by score from high to low, and keep one row.',
    solution:
      'SELECT s.name, r.subject, r.score\nFROM results r\nINNER JOIN students s\n  ON r.student_id = s.id\nORDER BY r.score DESC\nLIMIT 1;',
    result: {
      caption: 'Expected result: 1 row',
      columns: ['name', 'subject', 'score'],
      flex: [1, 1, 0.8],
      rows: [['Mary', 'SQL', 92]],
    },
    explanation: 'The JOIN adds the student name to every result. ORDER BY score DESC puts the best result first, and LIMIT 1 keeps only that row.',
  },
  {
    id: 'c4',
    level: 'Medium',
    title: 'No results yet',
    task: 'List the names of students who have no rows in the results table.',
    hint: 'Use a subquery that lists every student_id in results, and exclude those ids.',
    solution:
      'SELECT name\nFROM students\nWHERE id NOT IN (\n  SELECT student_id FROM results\n);',
    result: {
      caption: 'Expected result: 1 row',
      columns: ['name'],
      rows: [['Yusuf']],
      highlight: [0],
    },
    explanation: 'The inner query returns the ids 1, 2, 3 and 4. NOT IN keeps the students whose id is not in that list, which leaves Yusuf. A LEFT JOIN with WHERE r.id IS NULL gives the same answer.',
  },
  {
    id: 'c5',
    level: 'Hard',
    title: 'High achievers',
    task: 'Show the name and average score of every student whose average score is above 80.',
    hint: 'Join the tables, group by the student, and filter the groups with HAVING.',
    solution:
      'SELECT s.name, AVG(r.score) AS average\nFROM students s\nINNER JOIN results r\n  ON r.student_id = s.id\nGROUP BY s.name\nHAVING AVG(r.score) > 80;',
    result: {
      caption: 'Expected result: 2 rows',
      columns: ['name', 'average'],
      flex: [1, 1],
      rows: [['John', 81.5], ['Mary', 90]],
    },
    explanation: 'John averages (78 + 85) / 2 = 81.5 and Mary averages (92 + 88) / 2 = 90. Ibrahim (64) and Fatima (71) fall below 80. The condition uses AVG, so it must go in HAVING, not WHERE.',
  },
  {
    id: 'c6',
    level: 'Hard',
    title: 'Beating the SQL average',
    task: 'Show the names and scores of students whose SQL score is higher than the average SQL score.',
    hint: 'Use a subquery to calculate the average of the SQL scores, and compare each SQL score with it.',
    solution:
      "SELECT s.name, r.score\nFROM results r\nINNER JOIN students s\n  ON s.id = r.student_id\nWHERE r.subject = 'SQL'\n  AND r.score > (\n    SELECT AVG(score)\n    FROM results\n    WHERE subject = 'SQL'\n  );",
    result: {
      caption: 'Expected result: 2 rows',
      columns: ['name', 'score'],
      flex: [1, 1],
      rows: [['John', 78], ['Mary', 92]],
    },
    explanation: 'The four SQL scores are 78, 92, 64 and 71, and their average is 76.25. Only John (78) and Mary (92) are above it.',
  },
];

/* ------------------------------------------------------------------ */
/* "Write the query" exercises                                         */
/* patterns are tested against a normalized version of what you type   */
/* ------------------------------------------------------------------ */
const exercises = [
  {
    id: 'e1',
    level: 'Easy',
    prompt: 'Select all columns from the courses table.',
    hint: 'An asterisk (*) means every column.',
    answer: 'SELECT * FROM courses;',
    patterns: [/^select (\*|code,title,credits) from courses$/],
    explanation: 'SELECT * returns every column, and FROM courses names the table.',
    result: { caption: 'Result: 4 rows', columns: COURSE_COLS, flex: COURSE_FLEX, rows: COURSES },
  },
  {
    id: 'e2',
    level: 'Easy',
    prompt: 'List the names of all students in alphabetical order.',
    hint: 'Sort with ORDER BY. Ascending order is the default.',
    answer: 'SELECT name FROM students ORDER BY name;',
    patterns: [/^select name from students order by name( asc)?$/],
    explanation: 'ORDER BY name sorts text from A to Z. Adding ASC is allowed, but it is the default.',
    result: {
      caption: 'Result: 5 rows',
      columns: ['name'],
      rows: [['Fatima'], ['Ibrahim'], ['John'], ['Mary'], ['Yusuf']],
    },
  },
  {
    id: 'e3',
    level: 'Easy',
    prompt: 'Show the names of students who study CS or IT.',
    hint: 'IN lets you compare a column with a list of values.',
    answer: "SELECT name FROM students WHERE course IN ('CS', 'IT');",
    patterns: [
      /^select name from students where course in\('cs','it'\)$/,
      /^select name from students where course in\('it','cs'\)$/,
      /^select name from students where course='cs' or course='it'$/,
      /^select name from students where course='it' or course='cs'$/,
    ],
    explanation: 'IN is a shorter way to write several OR conditions on the same column.',
    result: {
      caption: 'Result: 3 rows',
      columns: ['name'],
      rows: [['John'], ['Mary'], ['Ibrahim']],
    },
  },
  {
    id: 'e4',
    level: 'Medium',
    prompt: "Add a new student: id 6, name Aisha, age 20, course CS.",
    hint: 'Use INSERT INTO with a column list, then VALUES. Text goes in single quotes.',
    answer: "INSERT INTO students (id, name, age, course)\nVALUES (6, 'Aisha', 20, 'CS');",
    patterns: [/^insert into students(\(id,name,age,course\))? values\(6,'aisha',20,'cs'\)$/],
    explanation: 'The values must follow the same order as the columns. Numbers are written without quotes, and text values use single quotes.',
    result: {
      caption: 'students after the INSERT: the new row is highlighted',
      columns: STUDENT_COLS,
      flex: STUDENT_FLEX,
      rows: [...STUDENTS, [6, 'Aisha', 20, 'CS']],
      highlight: [5],
    },
  },
  {
    id: 'e5',
    level: 'Medium',
    prompt: "Change Yusuf's course to IT.",
    hint: 'UPDATE ... SET ... WHERE. Do not forget the WHERE clause.',
    answer: "UPDATE students\nSET course = 'IT'\nWHERE name = 'Yusuf';",
    patterns: [/^update students set course='it' where (name='yusuf'|id=5)$/],
    explanation: 'SET gives the new value and WHERE chooses the row. Without WHERE, every student would move to IT. Using id = 5 also works and is even safer, because an id is unique.',
    result: {
      caption: 'students after the UPDATE: Yusuf is highlighted',
      columns: STUDENT_COLS,
      flex: STUDENT_FLEX,
      rows: STUDENTS.map((s) => (s[0] === 5 ? [5, 'Yusuf', 22, 'IT'] : s)),
      highlight: [4],
    },
  },
  {
    id: 'e6',
    level: 'Medium',
    prompt: 'Delete the result that has id 4.',
    hint: 'DELETE FROM table WHERE condition.',
    answer: 'DELETE FROM results\nWHERE id = 4;',
    patterns: [/^delete from results where id=4$/],
    explanation: 'WHERE id = 4 targets exactly one row, because id is the primary key. Always check the WHERE clause before you run a DELETE.',
    result: {
      caption: 'results after the DELETE: 5 rows remain',
      columns: RESULT_COLS,
      flex: RESULT_FLEX,
      rows: RESULTS.filter((r) => r[0] !== 4),
    },
  },
  {
    id: 'e7',
    level: 'Medium',
    prompt: 'Find the highest score in the results table.',
    hint: 'Use an aggregate function on the score column.',
    answer: 'SELECT MAX(score) FROM results;',
    patterns: [/^select max\(score\)( as \w+)? from results$/],
    explanation: 'MAX returns the largest value in a column. The highest score is 92, which belongs to Mary.',
    result: { caption: 'Result: 1 row', columns: ['MAX(score)'], flex: [1], rows: [[92]] },
  },
  {
    id: 'e8',
    level: 'Hard',
    prompt: 'Count how many students are older than 21.',
    hint: 'Combine COUNT(*) with a WHERE condition on age.',
    answer: 'SELECT COUNT(*) FROM students\nWHERE age > 21;',
    patterns: [/^select count\(\*\)( as \w+)? from students where (age>21|age>=22)$/],
    explanation: 'WHERE removes Ibrahim (21) first, then COUNT(*) counts the 4 rows that remain.',
    result: { caption: 'Result: 1 row', columns: ['COUNT(*)'], flex: [1], rows: [[4]] },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
// Makes two differently formatted but equal queries look the same
function normalizeSql(sql) {
  return sql
    .trim()
    .replace(/;+\s*$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\s*,\s*/g, ',')
    .replace(/\s+\(/g, '(')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .replace(/\s*(>=|<=|<>|!=|=|>|<)\s*/g, '$1');
}

const STATEMENT_WORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'];
const CLAUSE_WORDS = [
  'FROM', 'WHERE', 'SET', 'INTO', 'VALUES', 'TABLE', 'AND', 'OR', 'NOT', 'NULL', 'ORDER', 'BY', 'LIMIT',
  'DISTINCT', 'LIKE', 'IN', 'BETWEEN', 'ASC', 'DESC', 'JOIN', 'INNER', 'LEFT', 'ON', 'AS', 'GROUP', 'HAVING',
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

function levelColor(level) {
  if (level === 'Easy') return C.green;
  if (level === 'Medium') return C.amber;
  return C.pink;
}

/* ------------------------------------------------------------------ */
/* Reusable pieces                                                     */
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
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={15} color={copied ? C.green : C.muted} />
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
    <View className="my-3">
      {caption ? (
        <View className="flex-row items-center mb-2">
          <Ionicons name="grid-outline" size={13} color={C.muted} />
          <Text className="text-[11px] font-semibold ml-1.5 flex-1" style={{ color: C.muted }}>
            {caption}
          </Text>
        </View>
      ) : null}

      <View className="rounded-2xl overflow-hidden" style={{ borderWidth: 1, borderColor: C.border }}>
        <View className="flex-row" style={{ backgroundColor: 'rgba(59,130,246,0.28)' }}>
          {columns.map((col, i) => (
            <Text
              key={i}
              className="text-[11px] font-bold px-3 py-2.5"
              style={{ flex: flex ? flex[i] : 1, color: '#E0F2FE' }}
            >
              {col}
            </Text>
          ))}
        </View>

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

function Callout({ kind, title, text }) {
  const warn = kind === 'warning';
  const accent = warn ? C.amber : C.green;
  return (
    <View
      className="rounded-2xl px-5 py-4 my-3 flex-row"
      style={{
        backgroundColor: warn ? 'rgba(245,158,11,0.08)' : 'rgba(34,197,94,0.08)',
        borderWidth: 1,
        borderColor: warn ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.35)',
      }}
    >
      <Ionicons
        name={warn ? 'alert-circle-outline' : 'checkmark-circle-outline'}
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

function Explanation({ text }) {
  return (
    <View
      className="rounded-2xl px-5 py-4 my-3"
      style={{ backgroundColor: 'rgba(34,211,238,0.06)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.2)' }}
    >
      <View className="flex-row items-center mb-2">
        <Ionicons name="bulb-outline" size={16} color={C.cyan} />
        <Text className="text-sm font-bold ml-2" style={{ color: C.cyan }}>
          Explanation
        </Text>
      </View>
      <Text className="text-[13px] leading-5" style={{ color: '#E2E8F0' }}>
        {text}
      </Text>
    </View>
  );
}

function PrimaryButton({ label, icon, onPress, disabled, colors = ['#0EA5E9', '#2563EB'] }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      className="h-12 rounded-2xl overflow-hidden"
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
      >
        <Text className="text-sm font-bold text-white mr-2">{label}</Text>
        {icon ? <Ionicons name={icon} size={18} color="#fff" /> : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

function GhostButton({ label, icon, onPress, color = C.cyan, active = false }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center px-3.5 py-2 rounded-xl"
      style={{
        borderWidth: 1,
        borderColor: active ? color : C.border,
        backgroundColor: active ? color + '22' : C.glass,
      }}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text className="text-xs font-semibold ml-1.5" style={{ color: active ? color : '#E2E8F0' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function LevelBadge({ level }) {
  const color = levelColor(level);
  return (
    <View
      className="px-2.5 py-0.5 rounded-md"
      style={{ backgroundColor: color + '22', borderWidth: 1, borderColor: color + '88' }}
    >
      <Text className="text-[10px] font-bold uppercase" style={{ color }}>
        {level}
      </Text>
    </View>
  );
}

function Card({ children, style }) {
  return (
    <View
      className="px-5 py-5 mb-5 rounded-3xl"
      style={[
        { backgroundColor: 'rgba(30,64,175,0.14)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)' },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Sample tables card (collapsible)                                    */
/* ------------------------------------------------------------------ */
function SampleTables() {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setOpen(!open)} className="flex-row items-center">
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: 'rgba(34,211,238,0.12)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.4)' }}
        >
          <Ionicons name="server" size={18} color={C.cyan} />
        </View>
        <View className="flex-1">
          <Text className="text-white font-bold text-base">Sample tables</Text>
          <Text className="text-xs" style={{ color: C.muted }}>
            students, courses and results
          </Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
      </TouchableOpacity>

      {open ? (
        <View className="mt-2">
          <DataTable caption="students" columns={STUDENT_COLS} flex={STUDENT_FLEX} rows={STUDENTS} />
          <DataTable caption="courses" columns={COURSE_COLS} flex={COURSE_FLEX} rows={COURSES} />
          <DataTable caption="results" columns={RESULT_COLS} flex={RESULT_FLEX} rows={RESULTS} />
        </View>
      ) : null}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Tabs                                                                */
/* ------------------------------------------------------------------ */
const TABS = [
  { key: 'quiz', label: 'Quiz', icon: 'help-circle' },
  { key: 'challenges', label: 'Challenges', icon: 'trophy' },
  { key: 'write', label: 'Write', icon: 'create' },
];

function Segmented({ active, onChange }) {
  return (
    <View
      className="flex-row p-1 rounded-2xl mb-5"
      style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
    >
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            activeOpacity={0.85}
            onPress={() => onChange(t.key)}
            className="flex-1 flex-row items-center justify-center py-2.5 rounded-xl"
            style={{ backgroundColor: on ? 'rgba(34,211,238,0.16)' : 'transparent' }}
          >
            <Ionicons name={t.icon} size={16} color={on ? C.cyan : C.muted} />
            <Text className="text-xs font-bold ml-1.5" style={{ color: on ? C.cyan : C.muted }}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Quiz                                                                */
/* ------------------------------------------------------------------ */
function QuizView() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState([]); // chosen option per question
  const [finished, setFinished] = useState(false);

  const total = quizQuestions.length;
  const q = quizQuestions[index];
  const isLast = index === total - 1;

  const handleCheck = () => {
    if (selected === null) return;
    const next = [...answers];
    next[index] = selected;
    setAnswers(next);
    setChecked(true);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
      setChecked(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setAnswers([]);
    setFinished(false);
  };

  /* ---------- result + review ---------- */
  if (finished) {
    const score = quizQuestions.filter((item, i) => answers[i] === item.correct).length;
    const percent = Math.round((score / total) * 100);
    const passed = percent >= 50;

    return (
      <View>
        <LinearGradient
          colors={passed ? ['#16A34A', '#0EA5E9'] : ['#1E3A8A', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 24,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: passed ? 'rgba(34,197,94,0.6)' : C.border,
          }}
        >
          <Text className="text-xs font-bold text-white uppercase tracking-wider text-center">
            {percent >= 80 ? 'Excellent work' : passed ? 'Good progress' : 'Keep practicing'}
          </Text>
          <Text className="text-5xl font-extrabold text-white text-center my-2">{percent}%</Text>
          <Text className="text-sm font-medium text-white/90 text-center">
            You answered {score} of {total} questions correctly
          </Text>
        </LinearGradient>

        <Text className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: C.muted }}>
          Answers and explanations
        </Text>

        {quizQuestions.map((item, i) => {
          const right = answers[i] === item.correct;
          return (
            <Card key={item.id}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>
                  Question {i + 1}
                </Text>
                <View
                  className="flex-row items-center px-2.5 py-1 rounded-full"
                  style={{
                    borderWidth: 1,
                    backgroundColor: right ? 'rgba(34,197,94,0.14)' : 'rgba(248,113,113,0.14)',
                    borderColor: right ? 'rgba(34,197,94,0.5)' : 'rgba(248,113,113,0.5)',
                  }}
                >
                  <Ionicons
                    name={right ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={right ? C.green : C.rose}
                    style={{ marginRight: 4 }}
                  />
                  <Text className="text-xs font-bold" style={{ color: right ? '#86EFAC' : '#FCA5A5' }}>
                    {right ? 'Correct' : 'Wrong'}
                  </Text>
                </View>
              </View>
              <Text className="text-white font-semibold text-[15px] leading-6 mb-3">{item.question}</Text>
              <Text className="text-xs mb-1" style={{ color: C.muted }}>
                Correct answer:{' '}
                <Text className="font-bold" style={{ color: C.green }}>
                  {OPTION_LETTERS[item.correct]}. {item.options[item.correct]}
                </Text>
              </Text>
              {!right && answers[i] !== undefined ? (
                <Text className="text-xs" style={{ color: C.muted }}>
                  Your answer:{' '}
                  <Text className="font-bold" style={{ color: C.rose }}>
                    {OPTION_LETTERS[answers[i]]}. {item.options[answers[i]]}
                  </Text>
                </Text>
              ) : null}
              <Explanation text={item.explanation} />
            </Card>
          );
        })}

        <PrimaryButton label="Try again" icon="refresh" onPress={restart} />
      </View>
    );
  }

  /* ---------- question ---------- */
  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: C.muted }}>
          Question {index + 1} of {total}
        </Text>
        <Text className="text-xs font-semibold" style={{ color: C.cyan }}>
          {answers.filter((a, i) => a === quizQuestions[i].correct).length} correct
        </Text>
      </View>
      <View className="h-1.5 rounded-full overflow-hidden mb-5" style={{ backgroundColor: 'rgba(148,163,184,0.25)' }}>
        <View
          className="h-full rounded-full"
          style={{ width: `${((index + (checked ? 1 : 0)) / total) * 100}%`, backgroundColor: C.cyan }}
        />
      </View>

      <Card>
        <Text className="text-white text-lg font-bold leading-relaxed">{q.question}</Text>
      </Card>

      {q.options.map((opt, i) => {
        const isSelected = selected === i;
        const isCorrect = checked && i === q.correct;
        const isWrongPick = checked && isSelected && i !== q.correct;

        let bg = 'rgba(30,64,175,0.18)';
        let border = C.border;
        let badge = 'rgba(59,130,246,0.3)';
        if (isSelected && !checked) {
          bg = 'rgba(34,211,238,0.12)';
          border = C.cyan;
          badge = C.cyan;
        }
        if (isCorrect) {
          bg = 'rgba(34,197,94,0.16)';
          border = C.green;
          badge = C.green;
        }
        if (isWrongPick) {
          bg = 'rgba(248,113,113,0.14)';
          border = C.rose;
          badge = '#EF4444';
        }

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            disabled={checked}
            onPress={() => setSelected(i)}
            className="flex-row items-center p-4 rounded-2xl mb-3"
            style={{ borderWidth: 1, backgroundColor: bg, borderColor: border }}
          >
            <View
              className="w-9 h-9 rounded-lg justify-center items-center mr-3.5"
              style={{ backgroundColor: badge }}
            >
              <Text className="text-sm font-extrabold" style={{ color: isSelected && !checked ? '#020A2A' : '#fff' }}>
                {OPTION_LETTERS[i]}
              </Text>
            </View>
            <Text
              className="text-sm flex-1"
              style={{ color: isCorrect || isWrongPick || isSelected ? '#fff' : '#CBD5E1', fontWeight: isSelected || isCorrect ? '700' : '500' }}
            >
              {opt}
            </Text>
            {isCorrect ? <Ionicons name="checkmark-circle" size={20} color={C.green} /> : null}
            {isWrongPick ? <Ionicons name="close-circle" size={20} color={C.rose} /> : null}
          </TouchableOpacity>
        );
      })}

      {checked ? (
        <View>
          <Callout
            kind={selected === q.correct ? 'tip' : 'warning'}
            title={selected === q.correct ? 'Correct!' : 'Not quite'}
            text={
              selected === q.correct
                ? 'Well done. Read the explanation below, then continue.'
                : `The correct answer is ${OPTION_LETTERS[q.correct]}. ${q.options[q.correct]}`
            }
          />
          <Explanation text={q.explanation} />
          <PrimaryButton
            label={isLast ? 'See results' : 'Next question'}
            icon={isLast ? 'checkmark-circle-outline' : 'arrow-forward-outline'}
            colors={isLast ? ['#22C55E', '#16A34A'] : ['#0EA5E9', '#2563EB']}
            onPress={handleNext}
          />
        </View>
      ) : (
        <PrimaryButton label="Check answer" icon="checkmark" onPress={handleCheck} disabled={selected === null} />
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Challenges                                                          */
/* ------------------------------------------------------------------ */
function ChallengesView({ copiedId, onCopy }) {
  const [hints, setHints] = useState({});
  const [revealed, setRevealed] = useState({});
  const [solved, setSolved] = useState({});

  const toggle = (setter, state, id) => setter({ ...state, [id]: !state[id] });
  const solvedCount = Object.values(solved).filter(Boolean).length;

  return (
    <View>
      <Text className="text-[13px] leading-5 mb-4" style={{ color: C.text }}>
        Each challenge is a small problem. Solve it on paper or in your playground first, then reveal the solution
        and compare. Mark a challenge as solved when you got it.
      </Text>

      <View className="flex-row items-center mb-4">
        <Ionicons name="trophy-outline" size={16} color={C.amber} />
        <Text className="text-xs font-semibold ml-2" style={{ color: C.muted }}>
          {solvedCount} of {challenges.length} solved
        </Text>
      </View>

      {challenges.map((ch, i) => (
        <Card key={ch.id} style={solved[ch.id] ? { borderColor: 'rgba(34,197,94,0.55)' } : null}>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>
              Challenge {i + 1}
            </Text>
            <LevelBadge level={ch.level} />
          </View>
          <Text className="text-white font-bold text-lg mb-2">{ch.title}</Text>
          <Text className="text-sm leading-6" style={{ color: C.text }}>
            {ch.task}
          </Text>

          <View className="flex-row mt-4" style={{ gap: 8 }}>
            <GhostButton
              label="Hint"
              icon="help-circle-outline"
              color={C.amber}
              active={!!hints[ch.id]}
              onPress={() => toggle(setHints, hints, ch.id)}
            />
            <GhostButton
              label={revealed[ch.id] ? 'Hide solution' : 'Show solution'}
              icon={revealed[ch.id] ? 'eye-off-outline' : 'eye-outline'}
              active={!!revealed[ch.id]}
              onPress={() => toggle(setRevealed, revealed, ch.id)}
            />
          </View>

          {hints[ch.id] ? <Callout kind="warning" title="Hint" text={ch.hint} /> : null}

          {revealed[ch.id] ? (
            <View className="mt-2">
              <CodeBlock code={ch.solution} id={`sol-${ch.id}`} copiedId={copiedId} onCopy={onCopy} />
              <DataTable
                caption={ch.result.caption}
                columns={ch.result.columns}
                rows={ch.result.rows}
                flex={ch.result.flex}
                highlight={ch.result.highlight}
              />
              <Explanation text={ch.explanation} />
              <GhostButton
                label={solved[ch.id] ? 'Solved' : 'Mark as solved'}
                icon={solved[ch.id] ? 'checkmark-circle' : 'checkmark-circle-outline'}
                color={C.green}
                active={!!solved[ch.id]}
                onPress={() => toggle(setSolved, solved, ch.id)}
              />
            </View>
          ) : null}
        </Card>
      ))}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Write the query                                                     */
/* ------------------------------------------------------------------ */
function WriteView({ copiedId, onCopy }) {
  const [inputs, setInputs] = useState({});
  const [status, setStatus] = useState({}); // 'correct' | 'wrong'
  const [hints, setHints] = useState({});
  const [revealed, setRevealed] = useState({});

  const correctCount = Object.values(status).filter((s) => s === 'correct').length;

  const handleCheck = (ex) => {
    const normalized = normalizeSql(inputs[ex.id] || '');
    const ok = ex.patterns.some((p) => p.test(normalized));
    setStatus({ ...status, [ex.id]: ok ? 'correct' : 'wrong' });
  };

  const handleReset = (ex) => {
    setInputs({ ...inputs, [ex.id]: '' });
    setStatus({ ...status, [ex.id]: undefined });
  };

  return (
    <View>
      <Text className="text-[13px] leading-5 mb-4" style={{ color: C.text }}>
        Type the SQL query that does what the exercise asks. Spaces, capital letters and the final semicolon do not
        matter. Use the sample tables above to check your column names.
      </Text>

      <View className="flex-row items-center mb-4">
        <Ionicons name="create-outline" size={16} color={C.cyan} />
        <Text className="text-xs font-semibold ml-2" style={{ color: C.muted }}>
          {correctCount} of {exercises.length} correct
        </Text>
      </View>

      {exercises.map((ex, i) => {
        const st = status[ex.id];
        return (
          <Card
            key={ex.id}
            style={st === 'correct' ? { borderColor: 'rgba(34,197,94,0.55)' } : null}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[11px] font-bold uppercase" style={{ color: C.muted }}>
                Exercise {i + 1}
              </Text>
              <LevelBadge level={ex.level} />
            </View>
            <Text className="text-white font-semibold text-[15px] leading-6 mb-3">{ex.prompt}</Text>

            <TextInput
              value={inputs[ex.id] || ''}
              onChangeText={(t) => setInputs({ ...inputs, [ex.id]: t })}
              placeholder="Write your SQL here..."
              placeholderTextColor="#64748B"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              style={{
                minHeight: 92,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: st === 'correct' ? C.green : st === 'wrong' ? C.amber : C.border,
                backgroundColor: 'rgba(2,10,42,0.85)',
                color: '#E2E8F0',
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: 20,
              }}
            />

            <View className="flex-row flex-wrap mt-3" style={{ gap: 8 }}>
              <GhostButton
                label="Check"
                icon="checkmark"
                color={C.green}
                onPress={() => handleCheck(ex)}
              />
              <GhostButton
                label="Hint"
                icon="help-circle-outline"
                color={C.amber}
                active={!!hints[ex.id]}
                onPress={() => setHints({ ...hints, [ex.id]: !hints[ex.id] })}
              />
              <GhostButton
                label={revealed[ex.id] ? 'Hide answer' : 'Show answer'}
                icon={revealed[ex.id] ? 'eye-off-outline' : 'eye-outline'}
                active={!!revealed[ex.id]}
                onPress={() => setRevealed({ ...revealed, [ex.id]: !revealed[ex.id] })}
              />
              <GhostButton label="Clear" icon="close" color={C.muted} onPress={() => handleReset(ex)} />
            </View>

            {hints[ex.id] ? <Callout kind="warning" title="Hint" text={ex.hint} /> : null}

            {st === 'correct' ? (
              <View>
                <Callout kind="tip" title="Correct!" text="Your query matches the expected solution." />
                <DataTable
                  caption={ex.result.caption}
                  columns={ex.result.columns}
                  rows={ex.result.rows}
                  flex={ex.result.flex}
                  highlight={ex.result.highlight}
                />
                <Explanation text={ex.explanation} />
              </View>
            ) : null}

            {st === 'wrong' ? (
              <Callout
                kind="warning"
                title="Not quite yet"
                text="Check the table and column names, the quotes around text, and the keywords. A different but valid query may not be recognized, so use Show answer to compare."
              />
            ) : null}

            {revealed[ex.id] ? (
              <View>
                <CodeBlock code={ex.answer} id={`ans-${ex.id}`} copiedId={copiedId} onCopy={onCopy} />
                {st !== 'correct' ? (
                  <View>
                    <DataTable
                      caption={ex.result.caption}
                      columns={ex.result.columns}
                      rows={ex.result.rows}
                      flex={ex.result.flex}
                      highlight={ex.result.highlight}
                    />
                    <Explanation text={ex.explanation} />
                  </View>
                ) : null}
              </View>
            ) : null}
          </Card>
        );
      })}
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                              */
/* ------------------------------------------------------------------ */
export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('quiz');
  const [copiedId, setCopiedId] = useState(null);

  // Handle Copy to Clipboard with temporary checkmark
  const copyToClipboard = async (text, id) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // All three views stay mounted so your progress is kept when you switch tabs
  const show = (key) => ({ display: tab === key ? 'flex' : 'none' });

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

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
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <Ionicons name="arrow-back" size={22} color="#E2E8F0" />
          </TouchableOpacity>
          <Text className="text-xs font-semibold tracking-wider" style={{ color: C.muted }}>
            Section 5 of 6
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(34,211,238,0.2)', borderWidth: 1, borderColor: 'rgba(34,211,238,0.6)' }}
          >
            <Ionicons name="flask" size={24} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-extrabold">Practice</Text>
        </View>

        <Text className="text-sm leading-relaxed mb-4" style={{ color: '#BFD3FF' }}>
          Turn what you learned into skill. Test yourself with a quiz, solve SQL challenges and write your own queries, with answers and explanations for everything.
        </Text>

        <View className="flex-row flex-wrap" style={{ gap: 10 }}>
          {[
            { icon: 'help-circle', label: `${quizQuestions.length} Questions` },
            { icon: 'trophy', label: `${challenges.length} Challenges` },
            { icon: 'create', label: `${exercises.length} Exercises` },
          ].map((chip) => (
            <View
              key={chip.label}
              className="flex-row items-center px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
            >
              <Ionicons name={chip.icon} size={14} color={C.cyan} />
              <Text className="text-white text-xs font-semibold ml-1.5">{chip.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* --- CONTENT --- */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SampleTables />

          <Segmented active={tab} onChange={setTab} />

          <View style={show('quiz')}>
            <QuizView />
          </View>
          <View style={show('challenges')}>
            <ChallengesView copiedId={copiedId} onCopy={copyToClipboard} />
          </View>
          <View style={show('write')}>
            <WriteView copiedId={copiedId} onCopy={copyToClipboard} />
          </View>

          {/* Next section */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/screen/module6')}
            className="h-14 rounded-2xl overflow-hidden mt-2 mb-4"
          >
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
            >
              <Text className="text-sm font-bold text-white mr-2">Next section: Database-Specific</Text>
              <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <View className="h-12" />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}