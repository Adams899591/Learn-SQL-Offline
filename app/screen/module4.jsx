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
const ACCOUNT_COLS = ['id', 'owner', 'balance'];
const ACCOUNT_FLEX = [0.6, 1.4, 1];

const lessonContent = [
  /* -------------------------- RELATIONSHIPS ---------------------- */
  {
    id: '1',
    title: 'Relationships',
    icon: 'git-network',
    color: '#3B82F6',
    blocks: [
      {
        type: 'p',
        text: 'Tables become powerful when they are connected. A relationship links rows in one table to rows in another, using keys. This is why a database can store a student once and still connect that student to many results, without copying any data.',
      },
      {
        type: 'points',
        title: 'Two kinds of keys',
        items: [
          'A primary key uniquely identifies each row in its own table, such as students.id.',
          'A foreign key is a column that stores the primary key of a row in another table, such as results.student_id, which points to students.id.',
        ],
      },
      {
        type: 'table',
        caption: 'The three types of relationship',
        columns: ['Type', 'Meaning', 'Example'],
        flex: [1, 1.6, 1.8],
        rows: [
          ['One-to-one', 'One row matches exactly one row', 'A user and their profile'],
          ['One-to-many', 'One row matches many rows', 'One student has many results'],
          ['Many-to-many', 'Many rows match many rows', 'Students and clubs'],
        ],
      },
      {
        type: 'p',
        text: 'One-to-many is the most common. The foreign key always goes on the "many" side. Here is how the results table declares its link to students:',
      },
      {
        type: 'code',
        code: `CREATE TABLE results (
  id INTEGER PRIMARY KEY,
  student_id INTEGER,
  subject TEXT,
  score INTEGER,
  FOREIGN KEY (student_id) REFERENCES students(id)
);`,
      },
      {
        type: 'p',
        text: 'With this rule in place, the database refuses to store a result for a student that does not exist. It also refuses to delete a student who still has results. You can change that second behavior with ON DELETE:',
      },
      {
        type: 'table',
        caption: 'ON DELETE options',
        columns: ['Option', 'What happens'],
        flex: [1.1, 2.4],
        rows: [
          ['RESTRICT', 'The delete is blocked while related rows exist'],
          ['CASCADE', 'The related rows are deleted too'],
          ['SET NULL', 'The foreign key in the related rows becomes NULL'],
        ],
      },
      {
        type: 'p',
        text: 'A many-to-many relationship cannot be stored with a single foreign key. A student can join many clubs, and a club has many students. The solution is a third table, called a junction table, that holds one row for every pairing:',
      },
      {
        type: 'table',
        caption: 'clubs table',
        columns: ['id', 'name'],
        flex: [0.6, 1.4],
        rows: [
          [1, 'Coding'],
          [2, 'Chess'],
        ],
      },
      {
        type: 'table',
        caption: 'memberships table (the junction table)',
        columns: ['student_id', 'club_id'],
        flex: [1, 1],
        rows: [
          [1, 1],
          [1, 2],
          [2, 1],
          [3, 2],
        ],
      },
      {
        type: 'code',
        code: `SELECT s.name, c.name AS club
FROM memberships m
INNER JOIN students s ON s.id = m.student_id
INNER JOIN clubs c ON c.id = m.club_id;`,
      },
      {
        type: 'table',
        caption: 'Result: John is in two clubs',
        columns: ['name', 'club'],
        flex: [1, 1],
        rows: [
          ['John', 'Coding'],
          ['John', 'Chess'],
          ['Mary', 'Coding'],
          ['Ibrahim', 'Chess'],
        ],
      },
      {
        type: 'tip',
        title: 'SQLite users',
        text: 'SQLite does not enforce foreign keys unless you turn them on for each connection with PRAGMA foreign_keys = ON;. MySQL and PostgreSQL enforce them by default.',
      },
    ],
  },

  /* ----------------------------- INDEXES ------------------------- */
  {
    id: '2',
    title: 'Indexes',
    icon: 'flash',
    color: '#F59E0B',
    blocks: [
      {
        type: 'p',
        text: 'Without help, the database finds a row by reading the table from the first row to the last. This is called a full table scan, and it becomes slow when a table has thousands or millions of rows. An index solves this. It works like the index at the back of a book: instead of reading every page, you look up the word and jump straight to the right page.',
      },
      { type: 'code', code: 'CREATE INDEX idx_students_name\nON students(name);' },
      {
        type: 'p',
        text: 'After this, a query such as SELECT * FROM students WHERE name = \'Mary\' uses the index to jump to Mary directly. You do not change the query. The database decides on its own to use the index.',
      },
      {
        type: 'table',
        caption: 'Searching for one name, roughly',
        columns: ['Table size', 'Without index', 'With index'],
        flex: [1, 1.5, 1.2],
        rows: [
          ['1,000 rows', 'Up to 1,000 rows read', 'About 10 steps'],
          ['1,000,000 rows', 'Up to 1,000,000 rows read', 'About 20 steps'],
        ],
      },
      { type: 'p', text: 'A UNIQUE index also forbids duplicate values, which makes it useful for columns like a title or an email:' },
      { type: 'code', code: 'CREATE UNIQUE INDEX idx_courses_title\nON courses(title);' },
      { type: 'p', text: 'To check whether a query uses an index, ask the database to explain its plan. In SQLite:' },
      { type: 'code', code: "EXPLAIN QUERY PLAN\nSELECT * FROM students WHERE name = 'Mary';" },
      {
        type: 'points',
        title: 'When to create an index',
        items: [
          'On columns you often use in WHERE, in JOIN ... ON, or in ORDER BY.',
          'On foreign key columns, such as results.student_id.',
          'Primary keys are indexed automatically, so you do not need to add one.',
        ],
      },
      {
        type: 'warning',
        title: 'Indexes have a cost',
        text: 'An index takes storage space, and every INSERT, UPDATE and DELETE must also update it, so writes become slower. Do not index small tables or columns with only a few different values.',
      },
      {
        type: 'tip',
        title: 'Remove an index',
        text: 'Use DROP INDEX idx_students_name; in SQLite and PostgreSQL. MySQL needs the table too: DROP INDEX idx_students_name ON students;',
      },
    ],
  },

  /* ------------------------------ VIEWS -------------------------- */
  {
    id: '3',
    title: 'Views',
    icon: 'eye',
    color: '#22C55E',
    blocks: [
      {
        type: 'p',
        text: 'A view is a saved query that you can use like a table. It stores no data of its own. Each time you read from a view, the database runs the saved query and returns the current data. Views let you give a complicated join a short, friendly name.',
      },
      {
        type: 'code',
        code: `CREATE VIEW student_scores AS
SELECT s.name, r.subject, r.score
FROM students s
INNER JOIN results r
  ON r.student_id = s.id;`,
      },
      { type: 'p', text: 'Now the whole join is hidden behind one name. You can select from it, filter it and sort it like any table:' },
      { type: 'code', code: 'SELECT * FROM student_scores\nWHERE score > 80;' },
      {
        type: 'table',
        caption: 'Result: scores above 80',
        columns: ['name', 'subject', 'score'],
        flex: [1, 1, 0.8],
        rows: [
          ['John', 'PHP', 85],
          ['Mary', 'SQL', 92],
          ['Mary', 'PHP', 88],
        ],
      },
      {
        type: 'table',
        caption: 'Table compared with view',
        columns: ['', 'Table', 'View'],
        flex: [1.2, 1.4, 1.4],
        rows: [
          ['Stores', 'The data', 'Only the query'],
          ['Up to date', 'Yes', 'Always, it runs each time'],
          ['Use in SELECT', 'Yes', 'Yes'],
        ],
      },
      {
        type: 'points',
        title: 'Why use views',
        items: [
          'They simplify: write a long join once and reuse it everywhere.',
          'They protect data: a view can show name and score but hide private columns.',
          'They keep things consistent: every report uses the same definition.',
        ],
      },
      { type: 'code', code: 'DROP VIEW student_scores;' },
      {
        type: 'tip',
        title: 'Good to know',
        text: 'A normal view is only as fast as its query. PostgreSQL also has materialized views, which store the result so it can be read quickly and refreshed when needed. Changing data through a view is only possible for simple views.',
      },
    ],
  },

  /* --------------------------- TRANSACTIONS ---------------------- */
  {
    id: '4',
    title: 'Transactions',
    icon: 'swap-horizontal',
    color: '#EC4899',
    blocks: [
      {
        type: 'p',
        text: 'Some tasks need several statements, and they only make sense together. Moving money is the classic example: you subtract from one account and add to another. If the first step works and the second one fails, money disappears. A transaction groups the steps into one unit that either completes fully or has no effect at all.',
      },
      {
        type: 'table',
        caption: 'accounts table before the transfer',
        columns: ACCOUNT_COLS,
        flex: ACCOUNT_FLEX,
        rows: [
          [1, 'Mary', 5000],
          [2, 'John', 3000],
        ],
      },
      {
        type: 'code',
        code: `BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;

COMMIT;`,
      },
      {
        type: 'table',
        caption: 'After COMMIT: Mary sent 500 to John',
        columns: ACCOUNT_COLS,
        flex: ACCOUNT_FLEX,
        rows: [
          [1, 'Mary', 4500],
          [2, 'John', 3500],
        ],
        highlight: [0, 1],
      },
      {
        type: 'p',
        text: 'COMMIT makes every change permanent. If something goes wrong before COMMIT, ROLLBACK undoes every change made since BEGIN, and the tables return to how they were:',
      },
      {
        type: 'code',
        code: `BEGIN TRANSACTION;

UPDATE accounts SET balance = balance - 500 WHERE id = 1;
-- something fails here, so we undo everything

ROLLBACK;`,
      },
      {
        type: 'table',
        caption: 'After ROLLBACK: nothing changed',
        columns: ACCOUNT_COLS,
        flex: ACCOUNT_FLEX,
        rows: [
          [1, 'Mary', 5000],
          [2, 'John', 3000],
        ],
      },
      {
        type: 'table',
        caption: 'ACID: the four guarantees of a transaction',
        columns: ['Property', 'Meaning'],
        flex: [1.2, 2.6],
        rows: [
          ['Atomicity', 'All steps happen, or none of them do'],
          ['Consistency', 'The data always follows the rules of the database'],
          ['Isolation', 'Transactions running at the same time do not see each other\'s unfinished work'],
          ['Durability', 'Once committed, changes survive a crash or power loss'],
        ],
      },
      {
        type: 'tip',
        title: 'Different databases',
        text: 'MySQL starts a transaction with START TRANSACTION or BEGIN. PostgreSQL uses BEGIN. SQLite uses BEGIN TRANSACTION. Outside a transaction, every single statement is saved at once. This is called autocommit.',
      },
      {
        type: 'warning',
        title: 'After COMMIT there is no way back',
        text: 'ROLLBACK only works before COMMIT. Once a transaction is committed, you can only undo it by writing new statements.',
      },
    ],
  },

  /* ---------------------------- CONSTRAINTS ---------------------- */
  {
    id: '5',
    title: 'Constraints',
    icon: 'shield-checkmark',
    color: '#22D3EE',
    blocks: [
      {
        type: 'p',
        text: 'A constraint is a rule that the database enforces on your data. If an INSERT or UPDATE breaks a rule, the database rejects it with an error. Constraints protect your data at the source, so bad values cannot get in, whichever app or script sends them.',
      },
      {
        type: 'table',
        caption: 'The main constraints',
        columns: ['Constraint', 'Rule'],
        flex: [1.2, 2.6],
        rows: [
          ['PRIMARY KEY', 'Unique and never NULL. Identifies each row.'],
          ['NOT NULL', 'The column must always have a value'],
          ['UNIQUE', 'No two rows can have the same value'],
          ['DEFAULT', 'Uses a given value when none is supplied'],
          ['CHECK', 'The value must satisfy a condition'],
          ['FOREIGN KEY', 'The value must exist in another table'],
        ],
      },
      {
        type: 'code',
        code: `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  age INTEGER CHECK (age >= 16),
  role TEXT DEFAULT 'student'
);`,
      },
      { type: 'p', text: 'Here is what the database does with different inserts into this table:' },
      {
        type: 'table',
        caption: 'Constraints at work',
        columns: ['Insert', 'Result'],
        flex: [1.6, 1.8],
        rows: [
          ['username is missing', 'Rejected: NOT NULL'],
          ['username already used', 'Rejected: UNIQUE'],
          ['age is 15', 'Rejected: CHECK age >= 16'],
          ['no role given', "Accepted: role = 'student'"],
        ],
      },
      {
        type: 'points',
        title: 'Good habits',
        items: [
          'Mark a column NOT NULL whenever a missing value would make no sense.',
          'Use CHECK for simple rules such as a score between 0 and 100.',
          'Add constraints when you create the table. It is much harder to fix bad data later.',
        ],
      },
      {
        type: 'p',
        text: 'In MySQL and PostgreSQL you can add a constraint to a table that already exists and give it a name, which makes error messages clearer:',
      },
      {
        type: 'code',
        code: 'ALTER TABLE users\nADD CONSTRAINT chk_age CHECK (age >= 16);',
      },
      {
        type: 'warning',
        title: 'Database differences',
        text: 'SQLite cannot add most constraints to an existing table, so plan them when you create it. MySQL versions before 8.0.16 accept CHECK but silently ignore it.',
      },
    ],
  },

  /* ------------------------ STORED PROCEDURES -------------------- */
  {
    id: '6',
    title: 'Stored procedures',
    icon: 'cube',
    color: '#8B5CF6',
    blocks: [
      {
        type: 'p',
        text: 'A stored procedure is a named block of SQL saved inside the database. Instead of sending the same group of statements again and again, you call the procedure by name and pass it values, called parameters. Procedures can run several statements, use logic, and change data.',
      },
      {
        type: 'p',
        text: 'This MySQL procedure returns the students of any course you give it:',
      },
      {
        type: 'code',
        code: `DELIMITER //

CREATE PROCEDURE get_students_by_course(
  IN course_code VARCHAR(10)
)
BEGIN
  SELECT * FROM students
  WHERE course = course_code;
END //

DELIMITER ;`,
      },
      { type: 'code', code: "CALL get_students_by_course('CS');" },
      {
        type: 'table',
        caption: 'Result of the CALL',
        columns: ['id', 'name', 'age', 'course'],
        flex: [0.6, 1.5, 0.8, 1],
        rows: [
          [1, 'John', 22, 'CS'],
          [3, 'Ibrahim', 21, 'CS'],
        ],
      },
      {
        type: 'p',
        text: 'A procedure can also hold a whole transaction. The money transfer from the previous topic becomes a single reusable command:',
      },
      {
        type: 'code',
        code: `DELIMITER //

CREATE PROCEDURE transfer_money(
  IN from_id INT,
  IN to_id INT,
  IN amount INT
)
BEGIN
  START TRANSACTION;
  UPDATE accounts SET balance = balance - amount WHERE id = from_id;
  UPDATE accounts SET balance = balance + amount WHERE id = to_id;
  COMMIT;
END //

DELIMITER ;`,
      },
      { type: 'code', code: 'CALL transfer_money(1, 2, 500);' },
      {
        type: 'table',
        caption: 'View compared with stored procedure',
        columns: ['', 'View', 'Procedure'],
        flex: [1.4, 1.2, 1.4],
        rows: [
          ['Takes parameters', 'No', 'Yes'],
          ['Changes data', 'Not normally', 'Yes'],
          ['How you use it', 'SELECT FROM', 'CALL'],
        ],
      },
      {
        type: 'points',
        title: 'Why use them',
        items: [
          'Reuse: write the logic once and call it from any app.',
          'Speed: several statements travel to the database as one call.',
          'Security: users can be allowed to call a procedure without direct access to the tables.',
        ],
      },
      { type: 'code', code: 'DROP PROCEDURE get_students_by_course;' },
      {
        type: 'warning',
        title: 'SQLite has no stored procedures',
        text: 'SQLite, the database inside many mobile apps, does not support stored procedures. There you keep the logic in your app code instead. MySQL, PostgreSQL and SQL Server all support them, but each uses its own syntax. PostgreSQL has CREATE PROCEDURE since version 11, and SQL Server uses EXEC to run one.',
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
      text: 'A well-designed table uses several of these ideas at once. This results table has constraints, a foreign key with cascade, an index on the foreign key, and a view for the best scores:',
    },
    {
      type: 'code',
      code: `CREATE TABLE results (
  id INTEGER PRIMARY KEY,
  student_id INTEGER NOT NULL,
  subject TEXT NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_results_student
ON results(student_id);

CREATE VIEW top_results AS
SELECT * FROM results
WHERE score >= 80;`,
    },
    {
      type: 'table',
      caption: 'SELECT * FROM top_results;',
      columns: ['id', 'student_id', 'subject', 'score'],
      flex: [0.5, 1.2, 1, 0.8],
      rows: [
        [2, 1, 'PHP', 85],
        [3, 2, 'SQL', 92],
        [6, 2, 'PHP', 88],
      ],
    },
    {
      type: 'p',
      text: 'The constraints keep the data clean, the foreign key keeps it connected, the index keeps lookups fast, and the view gives everyone one simple name for the best results.',
    },
  ],
};

const quickReference = {
  columns: ['Concept', 'Key command', 'Purpose'],
  flex: [1.1, 1.8, 1.5],
  rows: [
    ['Relationship', 'FOREIGN KEY ... REFERENCES', 'Link tables'],
    ['Index', 'CREATE INDEX', 'Faster lookups'],
    ['View', 'CREATE VIEW ... AS', 'Saved query'],
    ['Transaction', 'BEGIN, COMMIT, ROLLBACK', 'All or nothing'],
    ['Constraint', 'NOT NULL, UNIQUE, CHECK', 'Protect data'],
    ['Procedure', 'CREATE PROCEDURE, CALL', 'Reusable logic'],
  ],
};

/* ------------------------------------------------------------------ */
/* SQL syntax highlighting                                             */
/* ------------------------------------------------------------------ */
const STATEMENT_WORDS = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'CALL', 'EXPLAIN'];
const CLAUSE_WORDS = [
  'FROM', 'WHERE', 'SET', 'INTO', 'VALUES', 'TABLE', 'PRIMARY', 'KEY', 'AND', 'OR', 'NOT', 'NULL',
  'ORDER', 'BY', 'LIMIT', 'OFFSET', 'DISTINCT', 'LIKE', 'ILIKE', 'IN', 'BETWEEN', 'ASC', 'DESC', 'TOP',
  'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'GROUP', 'HAVING',
  'INDEX', 'UNIQUE', 'VIEW', 'PROCEDURE', 'BEGIN', 'END', 'COMMIT', 'ROLLBACK', 'TRANSACTION', 'START',
  'FOREIGN', 'REFERENCES', 'CASCADE', 'CHECK', 'DEFAULT', 'CONSTRAINT', 'ADD', 'DELIMITER', 'QUERY',
  'PLAN', 'PRAGMA', 'OUT',
];
const FUNCTION_WORDS = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX'];
const TYPE_WORDS = ['INTEGER', 'TEXT', 'INT', 'VARCHAR', 'REAL', 'DATE', 'DECIMAL'];

function tokenColor(token) {
  const upper = token.toUpperCase();
  if (token.startsWith('--')) return '#64748B';
  if (token.startsWith("'")) return C.amber;
  if (/^\d+$/.test(token)) return '#FACC15';
  if (STATEMENT_WORDS.includes(upper)) return C.cyan;
  if (CLAUSE_WORDS.includes(upper)) return '#F472B6';
  if (FUNCTION_WORDS.includes(upper) || TYPE_WORDS.includes(upper)) return '#A78BFA';
  return '#E2E8F0';
}

function SqlText({ code }) {
  const tokens = code.match(/--[^\n]*|'[^']*'|\d+|[A-Za-z_]+|\s+|[^\sA-Za-z_0-9']+/g) || [];
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
              key={i}
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
export default function AdvancedSQLScreen() {
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
        'Section 4: Advanced SQL. Learn how tables relate to each other, how indexes make queries fast, and how views, transactions, constraints and stored procedures keep your data organized and safe.';
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
            Section 4 of 6
          </Text>
          <View className="w-10 h-10" />
        </View>

        <View className="flex-row items-center mb-3">
          <View
            className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
            style={{ backgroundColor: 'rgba(245,158,11,0.25)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.6)' }}
          >
            <Ionicons name="rocket" size={24} color="#fff" />
          </View>
          <Text className="text-white text-3xl font-extrabold">Advanced SQL</Text>
        </View>

        <Text className="text-sm leading-relaxed mb-4" style={{ color: '#BFD3FF' }}>
          Design databases like a professional. Learn how tables relate, how to make queries fast, and how to keep your data safe and consistent.
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
            The concepts you learned in this section:
          </Text>
          <DataTable columns={quickReference.columns} rows={quickReference.rows} flex={quickReference.flex} />
        </View>

        {/* Next section */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            stopRef.current = true;
            Speech.stop();
            router.push('/screen/module5');
          }}
          className="h-14 rounded-2xl overflow-hidden mb-4"
        >
          <LinearGradient
            colors={['#0EA5E9', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
          >
            <Text className="text-sm font-bold text-white mr-2">Next section: Practice</Text>
            <Ionicons name="arrow-forward-outline" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom Padding */}
        <View className="h-12" />
      </ScrollView>
    </LinearGradient>
  );
}