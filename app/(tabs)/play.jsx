// // app/(tabs)/playground.jsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Keyboard,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import * as SQLite from 'expo-sqlite';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// /* -------------------------------------------------------------------------- */
// /*  Theme (same as the rest of the app)                                        */
// /* -------------------------------------------------------------------------- */
// const C = {
//   bg: ['#020A2A', '#031445', '#020A2A'],
//   border: 'rgba(59,130,246,0.45)',
//   glass: 'rgba(30,64,175,0.22)',
//   panel: '#061552',
//   cyan: '#22D3EE',
//   blue: '#3B82F6',
//   muted: '#93A4C7',
//   text: '#E2E8F0',
//   red: '#F87171',
//   green: '#22C55E',
// };

// const SYNTAX = {
//   clause: '#22D3EE', // SELECT, FROM, WHERE...
//   keyword: '#C084FC', // ORDER, BY, JOIN...
//   number: '#FBBF24',
//   string: '#4ADE80',
//   comment: '#64748B',
//   plain: '#E2E8F0',
// };

// const glassBox = { backgroundColor: C.glass, borderWidth: 1, borderColor: C.border };

// const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
// const FONT_SIZE = 14;
// const LINE_H = 22;
// const MIN_LINES = 5;
// const ROW_H = 40;
// const MAX_ROWS = 1000; // max rows drawn in the results table

// // The editor text and the highlighted text underneath MUST share this exact style
// const codeFont = {
//   fontFamily: MONO,
//   fontSize: FONT_SIZE,
//   lineHeight: LINE_H,
//   padding: 0,
//   margin: 0,
//   includeFontPadding: false,
// };

// /* -------------------------------------------------------------------------- */
// /*  Sample data (seeded the first time the playground opens)                   */
// /* -------------------------------------------------------------------------- */
// const COURSES = ['CS', 'IT', 'IS', 'SE', 'EE'];

// const FIRST_STUDENTS = [
//   ['John', 22, 'CS'],
//   ['Mary', 23, 'IT'],
//   ['Ibrahim', 21, 'CS'],
//   ['Fatima', 24, 'IS'],
//   ['Yusuf', 22, 'SE'],
// ];

// const MORE_NAMES = [
//   'Aisha', 'Chidi', 'Amara', 'Tunde', 'Zainab', 'Emeka', 'Hauwa', 'Samuel', 'Grace', 'Musa',
//   'Blessing', 'Daniel', 'Halima', 'Peter', 'Ngozi', 'Abdul', 'Ruth', 'Kelvin', 'Sadiya', 'David',
//   'Esther', 'Bello', 'Joy', 'Ahmed', 'Faith', 'Victor', 'Maryam', 'Paul', 'Linda', 'Usman',
//   'Precious', 'Isaac', 'Khadija', 'James', 'Rita',
// ];

// const COURSE_INFO = [
//   ['CS', 'Computer Science', 4],
//   ['IT', 'Information Technology', 3],
//   ['IS', 'Information Systems', 3],
//   ['SE', 'Software Engineering', 4],
//   ['EE', 'Electrical Engineering', 4],
// ];

// async function setupDatabase(db) {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS students (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       age INTEGER,
//       course TEXT
//     );
//     CREATE TABLE IF NOT EXISTS courses (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       code TEXT,
//       title TEXT,
//       credits INTEGER
//     );
//     CREATE TABLE IF NOT EXISTS results (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       student_id INTEGER,
//       course_code TEXT,
//       score INTEGER
//     );
//   `);

//   // Only seed once (so rows the user deletes stay deleted)
//   const v = await db.getFirstAsync('PRAGMA user_version');
//   if (v && v.user_version >= 1) return;

//   await db.withTransactionAsync(async () => {
//     const students = [...FIRST_STUDENTS];
//     MORE_NAMES.forEach((name, i) => {
//       students.push([name, 18 + ((i * 5 + 3) % 9), COURSES[(i * 3 + 1) % COURSES.length]]);
//     });

//     for (const [name, age, course] of students) {
//       await db.runAsync('INSERT INTO students (name, age, course) VALUES (?, ?, ?)', [name, age, course]);
//     }
//     for (const [code, title, credits] of COURSE_INFO) {
//       await db.runAsync('INSERT INTO courses (code, title, credits) VALUES (?, ?, ?)', [code, title, credits]);
//     }
//     for (let id = 1; id <= students.length; id++) {
//       for (let k = 0; k < 2; k++) {
//         await db.runAsync('INSERT INTO results (student_id, course_code, score) VALUES (?, ?, ?)', [
//           id,
//           COURSES[(id + k) % COURSES.length],
//           40 + ((id * 17 + k * 31) % 60),
//         ]);
//       }
//     }
//   });
//   await db.execAsync('PRAGMA user_version = 1;');
// }

// async function resetDatabase(db) {
//   const tables = await db.getAllAsync(
//     "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
//   );
//   for (const t of tables) {
//     await db.execAsync(`DROP TABLE IF EXISTS "${t.name}"`);
//   }
//   await db.execAsync('PRAGMA user_version = 0;');
//   await setupDatabase(db);
// }

// /* -------------------------------------------------------------------------- */
// /*  Syntax highlighting                                                        */
// /* -------------------------------------------------------------------------- */
// const CLAUSE_WORDS = new Set([
//   'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
//   'CREATE', 'TABLE', 'DROP', 'ALTER',
// ]);
// const KEYWORDS = new Set([
//   'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
//   'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'DISTINCT', 'NULL', 'IS', 'COUNT',
//   'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'AUTOINCREMENT', 'INTEGER',
//   'TEXT', 'REAL', 'UNIQUE', 'DEFAULT', 'EXISTS', 'IF', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE',
//   'END', 'WITH', 'PRAGMA',
// ]);

// function tokenize(code) {
//   const re = /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g;
//   const out = [];
//   let m;
//   while ((m = re.exec(code)) !== null) {
//     let color = SYNTAX.plain;
//     if (m[1]) color = SYNTAX.comment;
//     else if (m[2]) color = SYNTAX.string;
//     else if (m[3]) color = SYNTAX.number;
//     else if (m[4]) {
//       const up = m[4].toUpperCase();
//       if (CLAUSE_WORDS.has(up)) color = SYNTAX.clause;
//       else if (KEYWORDS.has(up)) color = SYNTAX.keyword;
//     }
//     const last = out[out.length - 1];
//     if (last && last.color === color) last.text += m[0]; // merge neighbours to keep the tree small
//     else out.push({ text: m[0], color });
//   }
//   return out;
// }

// function Highlighted({ code }) {
//   const tokens = useMemo(() => tokenize(code), [code]);
//   return (
//     <Text style={[codeFont, { color: SYNTAX.plain }]}>
//       {tokens.map((t, i) => (
//         <Text key={i} style={{ color: t.color }}>
//           {t.text}
//         </Text>
//       ))}
//     </Text>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Dynamic results table                                                      */
// /*  Columns, widths and rows are all built from whatever the query returns.    */
// /*  Scrolls vertically AND horizontally, header stays fixed.                   */
// /* -------------------------------------------------------------------------- */
// function ResultsTable({ columns, rows }) {
//   const { width } = useWindowDimensions();
//   const available = width - 32 - 20; // screen padding + card padding

//   const widths = useMemo(() => {
//     const sample = rows.slice(0, 50);
//     const base = columns.map((col) => {
//       let maxLen = String(col).length;
//       sample.forEach((r) => {
//         const v = r[col];
//         const len = v === null || v === undefined ? 4 : String(v).length;
//         if (len > maxLen) maxLen = len;
//       });
//       return Math.min(220, Math.max(72, maxLen * 9 + 28));
//     });
//     const total = base.reduce((a, b) => a + b, 0);
//     // If the table is narrower than the card, stretch the columns to fill it
//     return total < available ? base.map((w) => (w / total) * available) : base;
//   }, [columns, rows, available]);

//   const totalWidth = widths.reduce((a, b) => a + b, 0);

//   const renderRow = useCallback(
//     ({ item, index }) => (
//       <View
//         className="flex-row items-center"
//         style={{
//           height: ROW_H,
//           width: totalWidth,
//           backgroundColor: index % 2 === 0 ? 'rgba(30,64,175,0.10)' : 'transparent',
//         }}
//       >
//         {columns.map((col, i) => {
//           const v = item[col];
//           const isNull = v === null || v === undefined;
//           return (
//             <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
//               <Text
//                 numberOfLines={1}
//                 className="text-[13px]"
//                 style={[
//                   { color: C.text },
//                   typeof v === 'number' && { color: '#BFD3FF' },
//                   isNull && { color: C.muted, fontStyle: 'italic' },
//                 ]}
//               >
//                 {isNull ? 'NULL' : String(v)}
//               </Text>
//             </View>
//           );
//         })}
//       </View>
//     ),
//     [columns, widths, totalWidth]
//   );

//   return (
//     <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
//       <View style={{ width: totalWidth }}>
//         {/* Header stays fixed while rows scroll */}
//         <View
//           className="flex-row items-center rounded-t-xl"
//           style={{ height: ROW_H, width: totalWidth, backgroundColor: 'rgba(59,130,246,0.22)' }}
//         >
//           {columns.map((col, i) => (
//             <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
//               <Text numberOfLines={1} className="text-xs font-extrabold" style={{ color: '#BFD3FF' }}>
//                 {String(col).toLowerCase()}
//               </Text>
//             </View>
//           ))}
//         </View>

//         <FlatList
//           data={rows}
//           renderItem={renderRow}
//           keyExtractor={(_, i) => String(i)}
//           getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
//           initialNumToRender={20}
//           maxToRenderPerBatch={20}
//           windowSize={10}
//           showsVerticalScrollIndicator
//           persistentScrollbar
//           style={{ flex: 1 }}
//           ListEmptyComponent={
//             <Text className="text-[13px] text-center py-6" style={{ color: C.muted, width: available }}>
//               No rows returned
//             </Text>
//           }
//         />
//       </View>
//     </ScrollView>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Bottom sheet                                                               */
// /* -------------------------------------------------------------------------- */
// function Sheet({ visible, title, onClose, children }) {
//   const insets = useSafeAreaInsets();
//   return (
//     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//       <Pressable className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={onClose} />
//       <View
//         className="px-4 pt-2.5 rounded-t-[28px]"
//         style={{
//           backgroundColor: '#04123A',
//           borderWidth: 1,
//           borderBottomWidth: 0,
//           borderColor: C.border,
//           paddingBottom: insets.bottom + 16,
//         }}
//       >
//         <View
//           className="self-center w-10 h-1 rounded-full mb-3"
//           style={{ backgroundColor: 'rgba(147,164,199,0.4)' }}
//         />
//         <View className="flex-row items-center justify-between mb-3">
//           <Text className="text-white text-base font-extrabold">{title}</Text>
//           <TouchableOpacity onPress={onClose} hitSlop={10}>
//             <Ionicons name="close" size={22} color={C.muted} />
//           </TouchableOpacity>
//         </View>
//         {children}
//       </View>
//     </Modal>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Examples                                                                   */
// /* -------------------------------------------------------------------------- */
// const EXAMPLES = [
//   { title: 'Select everything', query: 'SELECT * FROM students;' },
//   {
//     title: 'Filter with WHERE',
//     query: 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;',
//   },
//   {
//     title: 'Count students per course',
//     query: 'SELECT course, COUNT(*) AS total\nFROM students\nGROUP BY course\nORDER BY total DESC;',
//   },
//   {
//     title: 'JOIN two tables',
//     query:
//       'SELECT s.name, r.course_code, r.score\nFROM students s\nJOIN results r ON r.student_id = s.id\nORDER BY r.score DESC;',
//   },
//   {
//     title: 'Average score per course',
//     query: 'SELECT course_code, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY course_code;',
//   },
//   {
//     title: 'Insert a row',
//     query: "INSERT INTO students (name, age, course)\nVALUES ('Aisha', 20, 'CS');",
//   },
//   {
//     title: 'Update a row',
//     query: "UPDATE students\nSET age = 25\nWHERE name = 'John';",
//   },
//   {
//     title: 'Create your own table',
//     query: 'CREATE TABLE books (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT,\n  price REAL\n);',
//   },
// ];

// const DEFAULT_QUERY = 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;';

// /* -------------------------------------------------------------------------- */
// /*  Screen                                                                     */
// /* -------------------------------------------------------------------------- */
// export default function PlaygroundScreen() {
//   const insets = useSafeAreaInsets();
//   const dbRef = useRef(null);

//   const [ready, setReady] = useState(false);
//   const [running, setRunning] = useState(false);
//   const [sql, setSql] = useState(DEFAULT_QUERY);
//   const [inputH, setInputH] = useState(0);
//   const [result, setResult] = useState(null);

//   const [showExamples, setShowExamples] = useState(false);
//   const [showTables, setShowTables] = useState(false);
//   const [tables, setTables] = useState([]);

//   const lineCount = sql.split('\n').length;
//   const editorH = Math.max(MIN_LINES * LINE_H, lineCount * LINE_H, inputH);

//   /* ---- run a query ---- */
//   const runQuery = useCallback(
//     async (override) => {
//       const db = dbRef.current;
//       if (!db) return;

//       const text = (override ?? sql).trim();
//       if (!text) {
//         setResult({ kind: 'error', message: 'Write a query first.' });
//         return;
//       }

//       Keyboard.dismiss();
//       setRunning(true);
//       const start = Date.now();

//       try {
//         const cleaned = text.replace(/;+\s*$/, '');
//         const stripped = cleaned.replace(/--[^\n]*/g, '').trim();
//         const isRead = /^(select|with|pragma|explain)\b/i.test(stripped);
//         const multi = stripped.includes(';');

//         if (isRead && !multi) {
//           // Prepared statement so we can read the column names even when 0 rows come back
//           const stmt = await db.prepareAsync(cleaned);
//           try {
//             const res = await stmt.executeAsync();
//             const all = await res.getAllAsync();

//             let columns = [];
//             try {
//               if (typeof stmt.getColumnNamesAsync === 'function') {
//                 columns = await stmt.getColumnNamesAsync();
//               }
//             } catch (e) {
//               columns = [];
//             }
//             if (!columns.length && all.length) columns = Object.keys(all[0]);

//             setResult({
//               kind: 'rows',
//               columns,
//               rows: all.slice(0, MAX_ROWS),
//               truncated: all.length > MAX_ROWS,
//               ms: Date.now() - start,
//             });
//           } finally {
//             await stmt.finalizeAsync();
//           }
//         } else if (multi) {
//           await db.execAsync(cleaned + ';');
//           setResult({ kind: 'ok', message: 'Statements executed successfully.', ms: Date.now() - start });
//         } else {
//           const r = await db.runAsync(cleaned);
//           setResult({
//             kind: 'ok',
//             message:
//               r.changes > 0
//                 ? `Query OK, ${r.changes} row${r.changes === 1 ? '' : 's'} affected.`
//                 : 'Query executed successfully.',
//             ms: Date.now() - start,
//           });
//         }
//       } catch (e) {
//         setResult({ kind: 'error', message: String((e && e.message) || e).replace(/^Error:\s*/, '') });
//       } finally {
//         setRunning(false);
//       }
//     },
//     [sql]
//   );

//   /* ---- open + seed the database, then run the default query ---- */
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const db = await SQLite.openDatabaseAsync('playground.db');
//         await setupDatabase(db);
//         if (cancelled) return;
//         dbRef.current = db;
//         setReady(true);
//         runQuery(DEFAULT_QUERY);
//       } catch (e) {
//         if (!cancelled) {
//           setResult({ kind: 'error', message: `Could not open the database: ${(e && e.message) || e}` });
//         }
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ---- helpers ---- */
//   const openTables = async () => {
//     const db = dbRef.current;
//     if (!db) return;
//     try {
//       const list = await db.getAllAsync(
//         "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
//       );
//       const withCounts = [];
//       for (const t of list) {
//         const c = await db.getFirstAsync(`SELECT COUNT(*) AS c FROM "${t.name}"`);
//         withCounts.push({ name: t.name, count: c ? c.c : 0 });
//       }
//       setTables(withCounts);
//     } catch (e) {
//       setTables([]);
//     }
//     setShowTables(true);
//   };

//   const confirmReset = () => {
//     Alert.alert(
//       'Reset playground database?',
//       'This deletes every table (including ones you created) and restores the original sample data.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Reset',
//           style: 'destructive',
//           onPress: async () => {
//             const db = dbRef.current;
//             if (!db) return;
//             try {
//               await resetDatabase(db);
//               setShowTables(false);
//               setSql(DEFAULT_QUERY);
//               runQuery(DEFAULT_QUERY);
//             } catch (e) {
//               setResult({ kind: 'error', message: String((e && e.message) || e) });
//             }
//           },
//         },
//       ]
//     );
//   };

//   /* ---- results header badge ---- */
//   const badge =
//     result && result.kind === 'rows'
//       ? `${result.rows.length}${result.truncated ? '+' : ''} row${result.rows.length === 1 ? '' : 's'}`
//       : result && result.kind === 'ok'
//       ? 'Done'
//       : result && result.kind === 'error'
//       ? 'Error'
//       : '';
//   const isError = result && result.kind === 'error';

//   return (
//     <LinearGradient colors={C.bg} style={{ flex: 1 }}>
//       <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

//       {/* --- HEADER --- */}
//       <View
//         className="flex-row items-center justify-between px-4 pb-3"
//         style={{ paddingTop: insets.top + 8 }}
//       >
//         <TouchableOpacity
//           className="w-10 h-10 rounded-xl items-center justify-center"
//           style={glassBox}
//           onPress={() => setShowExamples(true)}
//           accessibilityLabel="Example queries"
//         >
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>

//         <Text className="text-white text-lg font-extrabold tracking-wide">SQL Playground</Text>

//         <TouchableOpacity
//           className="w-10 h-10 rounded-xl items-center justify-center"
//           style={glassBox}
//           onPress={openTables}
//           accessibilityLabel="Database tables"
//         >
//           <Ionicons name="server-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <View className="flex-1 px-4 pb-3">
//           {/* --- EDITOR --- */}
//           <View
//             className="rounded-2xl overflow-hidden"
//             style={{ height: 210, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border }}
//           >
//             <ScrollView
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ padding: 12, paddingRight: 44 }}
//             >
//               <View className="flex-row">
//                 {/* Line numbers */}
//                 <View style={{ width: 28, marginRight: 10 }}>
//                   {Array.from({ length: Math.max(lineCount, MIN_LINES) }).map((_, i) => (
//                     <Text key={i} style={[codeFont, { color: '#4B5F8F', textAlign: 'right' }]}>
//                       {i + 1}
//                     </Text>
//                   ))}
//                 </View>

//                 {/* Highlighted text sits under a transparent TextInput */}
//                 <View className="flex-1" style={{ height: editorH }}>
//                   <View style={StyleSheet.absoluteFill} pointerEvents="none">
//                     <Highlighted code={sql} />
//                   </View>
//                   <TextInput
//                     value={sql}
//                     onChangeText={setSql}
//                     onContentSizeChange={(e) => setInputH(e.nativeEvent.contentSize.height)}
//                     multiline
//                     scrollEnabled={false}
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                     spellCheck={false}
//                     textAlignVertical="top"
//                     selectionColor={C.cyan}
//                     cursorColor={C.cyan}
//                     underlineColorAndroid="transparent"
//                     placeholder="Write your SQL here..."
//                     placeholderTextColor={C.muted}
//                     style={[codeFont, { color: 'transparent', backgroundColor: 'transparent', height: editorH }]}
//                   />
//                 </View>
//               </View>
//             </ScrollView>

//             {/* Clear button */}
//             {sql.length > 0 && (
//               <TouchableOpacity
//                 className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-lg items-center justify-center"
//                 style={{ backgroundColor: 'rgba(2,10,42,0.6)' }}
//                 onPress={() => setSql('')}
//                 accessibilityLabel="Clear query"
//                 hitSlop={8}
//               >
//                 <Ionicons name="close-circle-outline" size={18} color={C.muted} />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* --- RUN BUTTON --- */}
//           <TouchableOpacity
//             activeOpacity={0.85}
//             onPress={() => runQuery()}
//             disabled={!ready || running}
//             accessibilityRole="button"
//             accessibilityLabel="Run query"
//             className="mt-3"
//             style={{ opacity: !ready || running ? 0.7 : 1 }}
//           >
//             <LinearGradient
//               colors={['#0EA5E9', '#2563EB']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               className="h-[52px] rounded-2xl flex-row items-center justify-center"
//               style={{
//                 height: 52,
//                 borderRadius: 16,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 shadowColor: '#0EA5E9',
//                 shadowOffset: { width: 0, height: 6 },
//                 shadowOpacity: 0.35,
//                 shadowRadius: 12,
//                 elevation: 8,
//               }}
//             >
//               {running || !ready ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="play" size={18} color="#fff" />
//                   <Text className="text-white text-base font-bold ml-2">Run Query</Text>
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* --- RESULTS --- */}
//           <View className="flex-1 mt-3 rounded-2xl p-2.5" style={[glassBox, { minHeight: 160 }]}>
//             <View className="flex-row items-center justify-between px-1 pb-2.5">
//               <Text className="text-white text-[15px] font-bold">Results</Text>
//               <View className="flex-row items-center">
//                 {result && result.kind !== 'error' && (
//                   <Text className="text-[11px] mr-2" style={{ color: C.muted }}>
//                     {result.ms} ms
//                   </Text>
//                 )}
//                 {!!badge && (
//                   <View
//                     className="px-2.5 py-0.5 rounded-full"
//                     style={{
//                       backgroundColor: isError ? 'rgba(248,113,113,0.15)' : 'rgba(34,211,238,0.12)',
//                       borderWidth: 1,
//                       borderColor: isError ? 'rgba(248,113,113,0.5)' : 'rgba(34,211,238,0.4)',
//                     }}
//                   >
//                     <Text className="text-[11px] font-bold" style={{ color: isError ? C.red : '#BFD3FF' }}>
//                       {badge}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             <View className="flex-1">
//               {!result && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="terminal-outline" size={28} color={C.muted} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
//                     Run a query to see results here
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'error' && (
//                 <ScrollView contentContainerStyle={{ padding: 4 }}>
//                   <View
//                     className="flex-row p-3 rounded-xl"
//                     style={{
//                       backgroundColor: 'rgba(248,113,113,0.10)',
//                       borderWidth: 1,
//                       borderColor: 'rgba(248,113,113,0.4)',
//                     }}
//                   >
//                     <Ionicons name="alert-circle" size={18} color={C.red} style={{ marginRight: 8, marginTop: 1 }} />
//                     <Text className="flex-1 text-[13px] leading-[19px]" style={{ color: '#FCA5A5' }}>
//                       {result.message}
//                     </Text>
//                   </View>
//                 </ScrollView>
//               )}

//               {result && result.kind === 'ok' && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="checkmark-circle" size={30} color={C.green} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.text }}>
//                     {result.message}
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'rows' && result.columns.length === 0 && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="file-tray-outline" size={28} color={C.muted} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
//                     No rows returned
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'rows' && result.columns.length > 0 && (
//                 <>
//                   <ResultsTable columns={result.columns} rows={result.rows} />
//                   {result.truncated && (
//                     <Text className="text-[11px] text-center pt-1.5" style={{ color: C.muted }}>
//                       Showing the first {MAX_ROWS} rows
//                     </Text>
//                   )}
//                 </>
//               )}
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>

//       {/* --- EXAMPLES SHEET --- */}
//       <Sheet visible={showExamples} title="Example queries" onClose={() => setShowExamples(false)}>
//         <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
//           {EXAMPLES.map((ex) => (
//             <TouchableOpacity
//               key={ex.title}
//               activeOpacity={0.8}
//               className="flex-row items-center p-3.5 mb-2 rounded-2xl"
//               style={glassBox}
//               onPress={() => {
//                 setSql(ex.query);
//                 setShowExamples(false);
//               }}
//             >
//               <View className="flex-1">
//                 <Text className="text-white text-sm font-bold">{ex.title}</Text>
//                 <Text numberOfLines={1} className="text-xs mt-0.5" style={{ color: C.muted }}>
//                   {ex.query.replace(/\n/g, ' ')}
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={18} color={C.muted} />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </Sheet>

//       {/* --- TABLES SHEET --- */}
//       <Sheet visible={showTables} title="Database tables" onClose={() => setShowTables(false)}>
//         <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
//           {tables.length === 0 && (
//             <Text className="text-[13px] text-center p-4" style={{ color: C.muted }}>
//               No tables yet
//             </Text>
//           )}
//           {tables.map((t) => (
//             <TouchableOpacity
//               key={t.name}
//               activeOpacity={0.8}
//               className="flex-row items-center p-3.5 mb-2 rounded-2xl"
//               style={glassBox}
//               onPress={() => {
//                 setSql(`SELECT * FROM ${t.name};`);
//                 setShowTables(false);
//               }}
//             >
//               <View
//                 className="w-[38px] h-[38px] rounded-[10px] items-center justify-center mr-3"
//                 style={{
//                   backgroundColor: 'rgba(34,211,238,0.12)',
//                   borderWidth: 1,
//                   borderColor: 'rgba(34,211,238,0.4)',
//                 }}
//               >
//                 <Ionicons name="grid-outline" size={18} color={C.cyan} />
//               </View>
//               <View className="flex-1">
//                 <Text className="text-white text-sm font-bold">{t.name}</Text>
//                 <Text className="text-xs mt-0.5" style={{ color: C.muted }}>
//                   {t.count} row{t.count === 1 ? '' : 's'}
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={18} color={C.muted} />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={confirmReset}
//           className="mt-1.5 h-[46px] rounded-2xl flex-row items-center justify-center"
//           style={{
//             backgroundColor: 'rgba(248,113,113,0.10)',
//             borderWidth: 1,
//             borderColor: 'rgba(248,113,113,0.45)',
//           }}
//         >
//           <Ionicons name="refresh" size={16} color={C.red} />
//           <Text className="text-sm font-bold ml-2" style={{ color: C.red }}>
//             Reset database
//           </Text>
//         </TouchableOpacity>
//       </Sheet>
//     </LinearGradient>
//   );
// }






// // app/(tabs)/playground.jsx
// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   Keyboard,
//   KeyboardAvoidingView,
//   Modal,
//   Platform,
//   Pressable,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import * as SQLite from 'expo-sqlite';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// /* -------------------------------------------------------------------------- */
// /*  Theme (same as the rest of the app)                                        */
// /* -------------------------------------------------------------------------- */
// const C = {
//   bg: ['#020A2A', '#031445', '#020A2A'],
//   border: 'rgba(59,130,246,0.45)',
//   glass: 'rgba(30,64,175,0.22)',
//   panel: '#061552',
//   cyan: '#22D3EE',
//   blue: '#3B82F6',
//   muted: '#93A4C7',
//   text: '#E2E8F0',
//   red: '#F87171',
//   green: '#22C55E',
// };

// const SYNTAX = {
//   clause: '#22D3EE', // SELECT, FROM, WHERE...
//   keyword: '#C084FC', // ORDER, BY, JOIN...
//   number: '#FBBF24',
//   string: '#4ADE80',
//   comment: '#64748B',
//   plain: '#E2E8F0',
// };

// const glassBox = { backgroundColor: C.glass, borderWidth: 1, borderColor: C.border };

// const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
// const FONT_SIZE = 14;
// const LINE_H = 22;
// const MIN_LINES = 5;
// const ROW_H = 40;
// const MAX_ROWS = 1000; // max rows drawn in the results table

// // The editor text and the highlighted text underneath MUST share this exact style
// const codeFont = {
//   fontFamily: MONO,
//   fontSize: FONT_SIZE,
//   lineHeight: LINE_H,
//   padding: 0,
//   margin: 0,
//   includeFontPadding: false,
// };

// /* -------------------------------------------------------------------------- */
// /*  Sample data (seeded the first time the playground opens)                   */
// /* -------------------------------------------------------------------------- */
// const COURSES = ['CS', 'IT', 'IS', 'SE', 'EE'];

// const FIRST_STUDENTS = [
//   ['John', 22, 'CS'],
//   ['Mary', 23, 'IT'],
//   ['Ibrahim', 21, 'CS'],
//   ['Fatima', 24, 'IS'],
//   ['Yusuf', 22, 'SE'],
// ];

// const MORE_NAMES = [
//   'Aisha', 'Chidi', 'Amara', 'Tunde', 'Zainab', 'Emeka', 'Hauwa', 'Samuel', 'Grace', 'Musa',
//   'Blessing', 'Daniel', 'Halima', 'Peter', 'Ngozi', 'Abdul', 'Ruth', 'Kelvin', 'Sadiya', 'David',
//   'Esther', 'Bello', 'Joy', 'Ahmed', 'Faith', 'Victor', 'Maryam', 'Paul', 'Linda', 'Usman',
//   'Precious', 'Isaac', 'Khadija', 'James', 'Rita',
// ];

// const COURSE_INFO = [
//   ['CS', 'Computer Science', 4],
//   ['IT', 'Information Technology', 3],
//   ['IS', 'Information Systems', 3],
//   ['SE', 'Software Engineering', 4],
//   ['EE', 'Electrical Engineering', 4],
// ];

// async function setupDatabase(db) {
//   await db.execAsync(`
//     CREATE TABLE IF NOT EXISTS students (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       name TEXT,
//       age INTEGER,
//       course TEXT
//     );
//     CREATE TABLE IF NOT EXISTS courses (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       code TEXT,
//       title TEXT,
//       credits INTEGER
//     );
//     CREATE TABLE IF NOT EXISTS results (
//       id INTEGER PRIMARY KEY AUTOINCREMENT,
//       student_id INTEGER,
//       course_code TEXT,
//       score INTEGER
//     );
//   `);

//   // Only seed once (so rows the user deletes stay deleted)
//   const v = await db.getFirstAsync('PRAGMA user_version');
//   if (v && v.user_version >= 1) return;

//   await db.withTransactionAsync(async () => {
//     const students = [...FIRST_STUDENTS];
//     MORE_NAMES.forEach((name, i) => {
//       students.push([name, 18 + ((i * 5 + 3) % 9), COURSES[(i * 3 + 1) % COURSES.length]]);
//     });

//     for (const [name, age, course] of students) {
//       await db.runAsync('INSERT INTO students (name, age, course) VALUES (?, ?, ?)', [name, age, course]);
//     }
//     for (const [code, title, credits] of COURSE_INFO) {
//       await db.runAsync('INSERT INTO courses (code, title, credits) VALUES (?, ?, ?)', [code, title, credits]);
//     }
//     for (let id = 1; id <= students.length; id++) {
//       for (let k = 0; k < 2; k++) {
//         await db.runAsync('INSERT INTO results (student_id, course_code, score) VALUES (?, ?, ?)', [
//           id,
//           COURSES[(id + k) % COURSES.length],
//           40 + ((id * 17 + k * 31) % 60),
//         ]);
//       }
//     }
//   });
//   await db.execAsync('PRAGMA user_version = 1;');
// }

// async function resetDatabase(db) {
//   const tables = await db.getAllAsync(
//     "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
//   );
//   for (const t of tables) {
//     await db.execAsync(`DROP TABLE IF EXISTS "${t.name}"`);
//   }
//   await db.execAsync('PRAGMA user_version = 0;');
//   await setupDatabase(db);
// }

// /* -------------------------------------------------------------------------- */
// /*  Syntax highlighting                                                        */
// /* -------------------------------------------------------------------------- */
// const CLAUSE_WORDS = new Set([
//   'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
//   'CREATE', 'TABLE', 'DROP', 'ALTER',
// ]);
// const KEYWORDS = new Set([
//   'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
//   'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'DISTINCT', 'NULL', 'IS', 'COUNT',
//   'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'AUTOINCREMENT', 'INTEGER',
//   'TEXT', 'REAL', 'UNIQUE', 'DEFAULT', 'EXISTS', 'IF', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE',
//   'END', 'WITH', 'PRAGMA',
// ]);

// function tokenize(code) {
//   const re = /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g;
//   const out = [];
//   let m;
//   while ((m = re.exec(code)) !== null) {
//     let color = SYNTAX.plain;
//     if (m[1]) color = SYNTAX.comment;
//     else if (m[2]) color = SYNTAX.string;
//     else if (m[3]) color = SYNTAX.number;
//     else if (m[4]) {
//       const up = m[4].toUpperCase();
//       if (CLAUSE_WORDS.has(up)) color = SYNTAX.clause;
//       else if (KEYWORDS.has(up)) color = SYNTAX.keyword;
//     }
//     const last = out[out.length - 1];
//     if (last && last.color === color) last.text += m[0]; // merge neighbours to keep the tree small
//     else out.push({ text: m[0], color });
//   }
//   return out;
// }

// function Highlighted({ code }) {
//   const tokens = useMemo(() => tokenize(code), [code]);
//   return (
//     <Text style={[codeFont, { color: SYNTAX.plain }]}>
//       {tokens.map((t, i) => (
//         <Text key={i} style={{ color: t.color }}>
//           {t.text}
//         </Text>
//       ))}
//     </Text>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Dynamic results table                                                      */
// /*  Columns, widths and rows are all built from whatever the query returns.    */
// /*  Scrolls vertically AND horizontally, header stays fixed.                   */
// /* -------------------------------------------------------------------------- */
// function ResultsTable({ columns, rows }) {
//   const { width } = useWindowDimensions();
//   const available = width - 32 - 20; // screen padding + card padding

//   const widths = useMemo(() => {
//     const sample = rows.slice(0, 50);
//     const base = columns.map((col) => {
//       let maxLen = String(col).length;
//       sample.forEach((r) => {
//         const v = r[col];
//         const len = v === null || v === undefined ? 4 : String(v).length;
//         if (len > maxLen) maxLen = len;
//       });
//       return Math.min(220, Math.max(72, maxLen * 9 + 28));
//     });
//     const total = base.reduce((a, b) => a + b, 0);
//     // If the table is narrower than the card, stretch the columns to fill it
//     return total < available ? base.map((w) => (w / total) * available) : base;
//   }, [columns, rows, available]);

//   const totalWidth = widths.reduce((a, b) => a + b, 0);

//   const renderRow = useCallback(
//     ({ item, index }) => (
//       <View
//         className="flex-row items-center"
//         style={{
//           height: ROW_H,
//           width: totalWidth,
//           backgroundColor: index % 2 === 0 ? 'rgba(30,64,175,0.10)' : 'transparent',
//         }}
//       >
//         {columns.map((col, i) => {
//           const v = item[col];
//           const isNull = v === null || v === undefined;
//           return (
//             <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
//               <Text
//                 numberOfLines={1}
//                 className="text-[13px]"
//                 style={[
//                   { color: C.text },
//                   typeof v === 'number' && { color: '#BFD3FF' },
//                   isNull && { color: C.muted, fontStyle: 'italic' },
//                 ]}
//               >
//                 {isNull ? 'NULL' : String(v)}
//               </Text>
//             </View>
//           );
//         })}
//       </View>
//     ),
//     [columns, widths, totalWidth]
//   );

//   return (
//     <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
//       <View style={{ width: totalWidth }}>
//         {/* Header stays fixed while rows scroll */}
//         <View
//           className="flex-row items-center rounded-t-xl"
//           style={{ height: ROW_H, width: totalWidth, backgroundColor: 'rgba(59,130,246,0.22)' }}
//         >
//           {columns.map((col, i) => (
//             <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
//               <Text numberOfLines={1} className="text-xs font-extrabold" style={{ color: '#BFD3FF' }}>
//                 {String(col).toLowerCase()}
//               </Text>
//             </View>
//           ))}
//         </View>

//         <FlatList
//           data={rows}
//           renderItem={renderRow}
//           keyExtractor={(_, i) => String(i)}
//           getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
//           initialNumToRender={20}
//           maxToRenderPerBatch={20}
//           windowSize={10}
//           showsVerticalScrollIndicator
//           persistentScrollbar
//           style={{ flex: 1 }}
//           ListEmptyComponent={
//             <Text className="text-[13px] text-center py-6" style={{ color: C.muted, width: available }}>
//               No rows returned
//             </Text>
//           }
//         />
//       </View>
//     </ScrollView>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Bottom sheet                                                               */
// /* -------------------------------------------------------------------------- */
// function Sheet({ visible, title, onClose, children }) {
//   const insets = useSafeAreaInsets();
//   return (
//     <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
//       <Pressable className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={onClose} />
//       <View
//         className="px-4 pt-2.5 rounded-t-[28px]"
//         style={{
//           backgroundColor: '#04123A',
//           borderWidth: 1,
//           borderBottomWidth: 0,
//           borderColor: C.border,
//           paddingBottom: insets.bottom + 16,
//         }}
//       >
//         <View
//           className="self-center w-10 h-1 rounded-full mb-3"
//           style={{ backgroundColor: 'rgba(147,164,199,0.4)' }}
//         />
//         <View className="flex-row items-center justify-between mb-3">
//           <Text className="text-white text-base font-extrabold">{title}</Text>
//           <TouchableOpacity onPress={onClose} hitSlop={10}>
//             <Ionicons name="close" size={22} color={C.muted} />
//           </TouchableOpacity>
//         </View>
//         {children}
//       </View>
//     </Modal>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  Examples                                                                   */
// /* -------------------------------------------------------------------------- */
// const EXAMPLES = [
//   { title: 'Select everything', query: 'SELECT * FROM students;' },
//   {
//     title: 'Filter with WHERE',
//     query: 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;',
//   },
//   {
//     title: 'Count students per course',
//     query: 'SELECT course, COUNT(*) AS total\nFROM students\nGROUP BY course\nORDER BY total DESC;',
//   },
//   {
//     title: 'JOIN two tables',
//     query:
//       'SELECT s.name, r.course_code, r.score\nFROM students s\nJOIN results r ON r.student_id = s.id\nORDER BY r.score DESC;',
//   },
//   {
//     title: 'Average score per course',
//     query: 'SELECT course_code, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY course_code;',
//   },
//   {
//     title: 'Insert a row',
//     query: "INSERT INTO students (name, age, course)\nVALUES ('Aisha', 20, 'CS');",
//   },
//   {
//     title: 'Update a row',
//     query: "UPDATE students\nSET age = 25\nWHERE name = 'John';",
//   },
//   {
//     title: 'Create your own table',
//     query: 'CREATE TABLE books (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT,\n  price REAL\n);',
//   },
// ];

// const DEFAULT_QUERY = 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;';

// /* -------------------------------------------------------------------------- */
// /*  Screen                                                                     */
// /* -------------------------------------------------------------------------- */
// export default function PlaygroundScreen() {
//   const insets = useSafeAreaInsets();
//   const dbRef = useRef(null);

//   const [ready, setReady] = useState(false);
//   const [running, setRunning] = useState(false);
//   const [sql, setSql] = useState(DEFAULT_QUERY);
//   const [inputH, setInputH] = useState(0);
//   const [result, setResult] = useState(null);

//   const [showExamples, setShowExamples] = useState(false);
//   const [showTables, setShowTables] = useState(false);
//   const [tables, setTables] = useState([]);

//   const lineCount = sql.split('\n').length;
//   const editorH = Math.max(MIN_LINES * LINE_H, lineCount * LINE_H, inputH);

//   /* ---- run a query ---- */
//   const runQuery = useCallback(
//     async (override) => {
//       const db = dbRef.current;
//       if (!db) return;

//       const text = (override ?? sql).trim();
//       if (!text) {
//         setResult({ kind: 'error', message: 'Write a query first.' });
//         return;
//       }

//       Keyboard.dismiss();
//       setRunning(true);
//       const start = Date.now();

//       try {
//         const cleaned = text.replace(/;+\s*$/, '');
//         const stripped = cleaned.replace(/--[^\n]*/g, '').trim();
//         const isRead = /^(select|with|pragma|explain)\b/i.test(stripped);
//         const multi = stripped.includes(';');

//         if (isRead && !multi) {
//           // Prepared statement so we can read the column names even when 0 rows come back
//           const stmt = await db.prepareAsync(cleaned);
//           try {
//             const res = await stmt.executeAsync();
//             const all = await res.getAllAsync();

//             let columns = [];
//             try {
//               if (typeof stmt.getColumnNamesAsync === 'function') {
//                 columns = await stmt.getColumnNamesAsync();
//               }
//             } catch (e) {
//               columns = [];
//             }
//             if (!columns.length && all.length) columns = Object.keys(all[0]);

//             setResult({
//               kind: 'rows',
//               columns,
//               rows: all.slice(0, MAX_ROWS),
//               truncated: all.length > MAX_ROWS,
//               ms: Date.now() - start,
//             });
//           } finally {
//             await stmt.finalizeAsync();
//           }
//         } else if (multi) {
//           await db.execAsync(cleaned + ';');
//           setResult({ kind: 'ok', message: 'Statements executed successfully.', ms: Date.now() - start });
//         } else {
//           const r = await db.runAsync(cleaned);
//           setResult({
//             kind: 'ok',
//             message:
//               r.changes > 0
//                 ? `Query OK, ${r.changes} row${r.changes === 1 ? '' : 's'} affected.`
//                 : 'Query executed successfully.',
//             ms: Date.now() - start,
//           });
//         }
//       } catch (e) {
//         setResult({ kind: 'error', message: String((e && e.message) || e).replace(/^Error:\s*/, '') });
//       } finally {
//         setRunning(false);
//       }
//     },
//     [sql]
//   );

//   /* ---- open + seed the database, then run the default query ---- */
//   useEffect(() => {
//     let cancelled = false;
//     (async () => {
//       try {
//         const db = await SQLite.openDatabaseAsync('playground.db');
//         await setupDatabase(db);
//         if (cancelled) return;
//         dbRef.current = db;
//         setReady(true);
//         runQuery(DEFAULT_QUERY);
//       } catch (e) {
//         if (!cancelled) {
//           setResult({ kind: 'error', message: `Could not open the database: ${(e && e.message) || e}` });
//         }
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /* ---- helpers ---- */
//   const openTables = async () => {
//     const db = dbRef.current;
//     if (!db) return;
//     try {
//       const list = await db.getAllAsync(
//         "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
//       );
//       const withCounts = [];
//       for (const t of list) {
//         const c = await db.getFirstAsync(`SELECT COUNT(*) AS c FROM "${t.name}"`);
//         withCounts.push({ name: t.name, count: c ? c.c : 0 });
//       }
//       setTables(withCounts);
//     } catch (e) {
//       setTables([]);
//     }
//     setShowTables(true);
//   };

//   const confirmReset = () => {
//     Alert.alert(
//       'Reset playground database?',
//       'This deletes every table (including ones you created) and restores the original sample data.',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Reset',
//           style: 'destructive',
//           onPress: async () => {
//             const db = dbRef.current;
//             if (!db) return;
//             try {
//               await resetDatabase(db);
//               setShowTables(false);
//               setSql(DEFAULT_QUERY);
//               runQuery(DEFAULT_QUERY);
//             } catch (e) {
//               setResult({ kind: 'error', message: String((e && e.message) || e) });
//             }
//           },
//         },
//       ]
//     );
//   };

//   /* ---- results header badge ---- */
//   const badge =
//     result && result.kind === 'rows'
//       ? `${result.rows.length}${result.truncated ? '+' : ''} row${result.rows.length === 1 ? '' : 's'}`
//       : result && result.kind === 'ok'
//       ? 'Done'
//       : result && result.kind === 'error'
//       ? 'Error'
//       : '';
//   const isError = result && result.kind === 'error';

//   return (
//     <LinearGradient colors={C.bg} style={{ flex: 1 }}>
//       <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

//       {/* --- HEADER --- */}
//       <View
//         className="flex-row items-center justify-between px-4 pb-3"
//         style={{ paddingTop: insets.top + 8 }}
//       >
//         <TouchableOpacity
//           className="w-10 h-10 rounded-xl items-center justify-center"
//           style={glassBox}
//           onPress={() => setShowExamples(true)}
//           accessibilityLabel="Example queries"
//         >
//           <Ionicons name="menu" size={22} color="#fff" />
//         </TouchableOpacity>

//         <Text className="text-white text-lg font-extrabold tracking-wide">SQL Playground</Text>

//         <TouchableOpacity
//           className="w-10 h-10 rounded-xl items-center justify-center"
//           style={glassBox}
//           onPress={openTables}
//           accessibilityLabel="Database tables"
//         >
//           <Ionicons name="server-outline" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
//         <View className="flex-1 px-4 pb-3">
//           {/* --- EDITOR --- */}
//           <View
//             className="rounded-2xl overflow-hidden"
//             style={{ height: 210, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border }}
//           >
//             <ScrollView
//               keyboardShouldPersistTaps="handled"
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={{ padding: 12, paddingRight: 44 }}
//             >
//               <View className="flex-row">
//                 {/* Line numbers */}
//                 <View style={{ width: 28, marginRight: 10 }}>
//                   {Array.from({ length: Math.max(lineCount, MIN_LINES) }).map((_, i) => (
//                     <Text key={i} style={[codeFont, { color: '#4B5F8F', textAlign: 'right' }]}>
//                       {i + 1}
//                     </Text>
//                   ))}
//                 </View>

//                 {/* Plain, directly visible TextInput — no highlight layer behind it */}
//                 <View className="flex-1" style={{ height: editorH }}>
//                   <TextInput
//                     value={sql}
//                     onChangeText={setSql}
//                     onContentSizeChange={(e) => setInputH(e.nativeEvent.contentSize.height)}
//                     multiline
//                     scrollEnabled={false}
//                     autoCapitalize="none"
//                     autoCorrect={false}
//                     spellCheck={false}
//                     textAlignVertical="top"
//                     selectionColor={C.cyan}
//                     cursorColor={C.cyan}
//                     underlineColorAndroid="transparent"
//                     placeholder="Write your SQL here..."
//                     placeholderTextColor={C.muted}
//                     style={[
//                       codeFont,
//                       {
//                         color: C.text,
//                         backgroundColor: 'transparent',
//                         height: editorH,
//                       },
//                     ]}
//                   />
//                 </View>
//               </View>
//             </ScrollView>

//             {/* Clear button */}
//             {sql.length > 0 && (
//               <TouchableOpacity
//                 className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-lg items-center justify-center"
//                 style={{ backgroundColor: 'rgba(2,10,42,0.6)' }}
//                 onPress={() => setSql('')}
//                 accessibilityLabel="Clear query"
//                 hitSlop={8}
//               >
//                 <Ionicons name="close-circle-outline" size={18} color={C.muted} />
//               </TouchableOpacity>
//             )}
//           </View>

//           {/* --- RUN BUTTON --- */}
//           <TouchableOpacity
//             activeOpacity={0.85}
//             onPress={() => runQuery()}
//             disabled={!ready || running}
//             accessibilityRole="button"
//             accessibilityLabel="Run query"
//             className="mt-3"
//             style={{ opacity: !ready || running ? 0.7 : 1 }}
//           >
//             <LinearGradient
//               colors={['#0EA5E9', '#2563EB']}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               className="h-[52px] rounded-2xl flex-row items-center justify-center"
//               style={{
//                 height: 52,
//                 borderRadius: 16,
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 shadowColor: '#0EA5E9',
//                 shadowOffset: { width: 0, height: 6 },
//                 shadowOpacity: 0.35,
//                 shadowRadius: 12,
//                 elevation: 8,
//               }}
//             >
//               {running || !ready ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <>
//                   <Ionicons name="play" size={18} color="#fff" />
//                   <Text className="text-white text-base font-bold ml-2">Run Query</Text>
//                 </>
//               )}
//             </LinearGradient>
//           </TouchableOpacity>

//           {/* --- RESULTS --- */}
//           <View className="flex-1 mt-3 rounded-2xl p-2.5" style={[glassBox, { minHeight: 160 }]}>
//             <View className="flex-row items-center justify-between px-1 pb-2.5">
//               <Text className="text-white text-[15px] font-bold">Results</Text>
//               <View className="flex-row items-center">
//                 {result && result.kind !== 'error' && (
//                   <Text className="text-[11px] mr-2" style={{ color: C.muted }}>
//                     {result.ms} ms
//                   </Text>
//                 )}
//                 {!!badge && (
//                   <View
//                     className="px-2.5 py-0.5 rounded-full"
//                     style={{
//                       backgroundColor: isError ? 'rgba(248,113,113,0.15)' : 'rgba(34,211,238,0.12)',
//                       borderWidth: 1,
//                       borderColor: isError ? 'rgba(248,113,113,0.5)' : 'rgba(34,211,238,0.4)',
//                     }}
//                   >
//                     <Text className="text-[11px] font-bold" style={{ color: isError ? C.red : '#BFD3FF' }}>
//                       {badge}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </View>

//             <View className="flex-1">
//               {!result && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="terminal-outline" size={28} color={C.muted} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
//                     Run a query to see results here
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'error' && (
//                 <ScrollView contentContainerStyle={{ padding: 4 }}>
//                   <View
//                     className="flex-row p-3 rounded-xl"
//                     style={{
//                       backgroundColor: 'rgba(248,113,113,0.10)',
//                       borderWidth: 1,
//                       borderColor: 'rgba(248,113,113,0.4)',
//                     }}
//                   >
//                     <Ionicons name="alert-circle" size={18} color={C.red} style={{ marginRight: 8, marginTop: 1 }} />
//                     <Text className="flex-1 text-[13px] leading-[19px]" style={{ color: '#FCA5A5' }}>
//                       {result.message}
//                     </Text>
//                   </View>
//                 </ScrollView>
//               )}

//               {result && result.kind === 'ok' && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="checkmark-circle" size={30} color={C.green} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.text }}>
//                     {result.message}
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'rows' && result.columns.length === 0 && (
//                 <View className="flex-1 items-center justify-center px-3">
//                   <Ionicons name="file-tray-outline" size={28} color={C.muted} />
//                   <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
//                     No rows returned
//                   </Text>
//                 </View>
//               )}

//               {result && result.kind === 'rows' && result.columns.length > 0 && (
//                 <>
//                   <ResultsTable columns={result.columns} rows={result.rows} />
//                   {result.truncated && (
//                     <Text className="text-[11px] text-center pt-1.5" style={{ color: C.muted }}>
//                       Showing the first {MAX_ROWS} rows
//                     </Text>
//                   )}
//                 </>
//               )}
//             </View>
//           </View>
//         </View>
//       </KeyboardAvoidingView>

//       {/* --- EXAMPLES SHEET --- */}
//       <Sheet visible={showExamples} title="Example queries" onClose={() => setShowExamples(false)}>
//         <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
//           {EXAMPLES.map((ex) => (
//             <TouchableOpacity
//               key={ex.title}
//               activeOpacity={0.8}
//               className="flex-row items-center p-3.5 mb-2 rounded-2xl"
//               style={glassBox}
//               onPress={() => {
//                 setSql(ex.query);
//                 setShowExamples(false);
//               }}
//             >
//               <View className="flex-1">
//                 <Text className="text-white text-sm font-bold">{ex.title}</Text>
//                 <Text numberOfLines={1} className="text-xs mt-0.5" style={{ color: C.muted }}>
//                   {ex.query.replace(/\n/g, ' ')}
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={18} color={C.muted} />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>
//       </Sheet>

//       {/* --- TABLES SHEET --- */}
//       <Sheet visible={showTables} title="Database tables" onClose={() => setShowTables(false)}>
//         <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
//           {tables.length === 0 && (
//             <Text className="text-[13px] text-center p-4" style={{ color: C.muted }}>
//               No tables yet
//             </Text>
//           )}
//           {tables.map((t) => (
//             <TouchableOpacity
//               key={t.name}
//               activeOpacity={0.8}
//               className="flex-row items-center p-3.5 mb-2 rounded-2xl"
//               style={glassBox}
//               onPress={() => {
//                 setSql(`SELECT * FROM ${t.name};`);
//                 setShowTables(false);
//               }}
//             >
//               <View
//                 className="w-[38px] h-[38px] rounded-[10px] items-center justify-center mr-3"
//                 style={{
//                   backgroundColor: 'rgba(34,211,238,0.12)',
//                   borderWidth: 1,
//                   borderColor: 'rgba(34,211,238,0.4)',
//                 }}
//               >
//                 <Ionicons name="grid-outline" size={18} color={C.cyan} />
//               </View>
//               <View className="flex-1">
//                 <Text className="text-white text-sm font-bold">{t.name}</Text>
//                 <Text className="text-xs mt-0.5" style={{ color: C.muted }}>
//                   {t.count} row{t.count === 1 ? '' : 's'}
//                 </Text>
//               </View>
//               <Ionicons name="chevron-forward" size={18} color={C.muted} />
//             </TouchableOpacity>
//           ))}
//         </ScrollView>

//         <TouchableOpacity
//           activeOpacity={0.85}
//           onPress={confirmReset}
//           className="mt-1.5 h-[46px] rounded-2xl flex-row items-center justify-center"
//           style={{
//             backgroundColor: 'rgba(248,113,113,0.10)',
//             borderWidth: 1,
//             borderColor: 'rgba(248,113,113,0.45)',
//           }}
//         >
//           <Ionicons name="refresh" size={16} color={C.red} />
//           <Text className="text-sm font-bold ml-2" style={{ color: C.red }}>
//             Reset database
//           </Text>
//         </TouchableOpacity>
//       </Sheet>
//     </LinearGradient>
//   );
// }














// app/(tabs)/playground.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/* -------------------------------------------------------------------------- */
/*  Theme (same as the rest of the app)                                        */
/* -------------------------------------------------------------------------- */
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  panel: '#061552',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
  text: '#E2E8F0',
  red: '#F87171',
  green: '#22C55E',
};

const SYNTAX = {
  clause: '#22D3EE', // SELECT, FROM, WHERE...
  keyword: '#C084FC', // ORDER, BY, JOIN...
  number: '#FBBF24',
  string: '#4ADE80',
  comment: '#64748B',
  plain: '#E2E8F0',
};

const glassBox = { backgroundColor: C.glass, borderWidth: 1, borderColor: C.border };

const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });
const FONT_SIZE = 14;
const LINE_H = 22;
const MIN_LINES = 5;
const ROW_H = 40;
const MAX_ROWS = 1000; // max rows drawn in the results table

// The editor text and the highlighted text underneath MUST share this exact style
const codeFont = {
  fontFamily: MONO,
  fontSize: FONT_SIZE,
  lineHeight: LINE_H,
  padding: 0,
  margin: 0,
  includeFontPadding: false,
};

/* -------------------------------------------------------------------------- */
/*  Sample data (seeded the first time the playground opens)                   */
/* -------------------------------------------------------------------------- */
const COURSES = ['CS', 'IT', 'IS', 'SE', 'EE'];

const FIRST_STUDENTS = [
  ['John', 22, 'CS'],
  ['Mary', 23, 'IT'],
  ['Ibrahim', 21, 'CS'],
  ['Fatima', 24, 'IS'],
  ['Yusuf', 22, 'SE'],
];

const MORE_NAMES = [
  'Aisha', 'Chidi', 'Amara', 'Tunde', 'Zainab', 'Emeka', 'Hauwa', 'Samuel', 'Grace', 'Musa',
  'Blessing', 'Daniel', 'Halima', 'Peter', 'Ngozi', 'Abdul', 'Ruth', 'Kelvin', 'Sadiya', 'David',
  'Esther', 'Bello', 'Joy', 'Ahmed', 'Faith', 'Victor', 'Maryam', 'Paul', 'Linda', 'Usman',
  'Precious', 'Isaac', 'Khadija', 'James', 'Rita',
];

const COURSE_INFO = [
  ['CS', 'Computer Science', 4],
  ['IT', 'Information Technology', 3],
  ['IS', 'Information Systems', 3],
  ['SE', 'Software Engineering', 4],
  ['EE', 'Electrical Engineering', 4],
];

async function setupDatabase(db) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      age INTEGER,
      course TEXT
    );
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT,
      title TEXT,
      credits INTEGER
    );
    CREATE TABLE IF NOT EXISTS results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      course_code TEXT,
      score INTEGER
    );
  `);

  // Only seed once (so rows the user deletes stay deleted)
  const v = await db.getFirstAsync('PRAGMA user_version');
  if (v && v.user_version >= 1) return;

  await db.withTransactionAsync(async () => {
    const students = [...FIRST_STUDENTS];
    MORE_NAMES.forEach((name, i) => {
      students.push([name, 18 + ((i * 5 + 3) % 9), COURSES[(i * 3 + 1) % COURSES.length]]);
    });

    for (const [name, age, course] of students) {
      await db.runAsync('INSERT INTO students (name, age, course) VALUES (?, ?, ?)', [name, age, course]);
    }
    for (const [code, title, credits] of COURSE_INFO) {
      await db.runAsync('INSERT INTO courses (code, title, credits) VALUES (?, ?, ?)', [code, title, credits]);
    }
    for (let id = 1; id <= students.length; id++) {
      for (let k = 0; k < 2; k++) {
        await db.runAsync('INSERT INTO results (student_id, course_code, score) VALUES (?, ?, ?)', [
          id,
          COURSES[(id + k) % COURSES.length],
          40 + ((id * 17 + k * 31) % 60),
        ]);
      }
    }
  });
  await db.execAsync('PRAGMA user_version = 1;');
}

async function resetDatabase(db) {
  const tables = await db.getAllAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
  );
  for (const t of tables) {
    await db.execAsync(`DROP TABLE IF EXISTS "${t.name}"`);
  }
  await db.execAsync('PRAGMA user_version = 0;');
  await setupDatabase(db);
}

/* -------------------------------------------------------------------------- */
/*  Syntax highlighting                                                        */
/* -------------------------------------------------------------------------- */
const CLAUSE_WORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'DROP', 'ALTER',
]);
const KEYWORDS = new Set([
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
  'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'DISTINCT', 'NULL', 'IS', 'COUNT',
  'SUM', 'AVG', 'MIN', 'MAX', 'ASC', 'DESC', 'PRIMARY', 'KEY', 'AUTOINCREMENT', 'INTEGER',
  'TEXT', 'REAL', 'UNIQUE', 'DEFAULT', 'EXISTS', 'IF', 'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE',
  'END', 'WITH', 'PRAGMA',
]);

function tokenize(code) {
  const re = /(--[^\n]*)|('(?:[^']|'')*'?)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_][A-Za-z0-9_]*\b)|([\s\S])/g;
  const out = [];
  let m;
  while ((m = re.exec(code)) !== null) {
    let color = SYNTAX.plain;
    if (m[1]) color = SYNTAX.comment;
    else if (m[2]) color = SYNTAX.string;
    else if (m[3]) color = SYNTAX.number;
    else if (m[4]) {
      const up = m[4].toUpperCase();
      if (CLAUSE_WORDS.has(up)) color = SYNTAX.clause;
      else if (KEYWORDS.has(up)) color = SYNTAX.keyword;
    }
    const last = out[out.length - 1];
    if (last && last.color === color) last.text += m[0]; // merge neighbours to keep the tree small
    else out.push({ text: m[0], color });
  }
  return out;
}

function Highlighted({ code }) {
  const tokens = useMemo(() => tokenize(code), [code]);
  return (
    <Text style={[codeFont, { color: SYNTAX.plain }]}>
      {tokens.map((t, i) => (
        <Text key={i} style={{ color: t.color }}>
          {t.text}
        </Text>
      ))}
    </Text>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dynamic results table                                                      */
/*  Columns, widths and rows are all built from whatever the query returns.    */
/*  Scrolls vertically AND horizontally, header stays fixed.                   */
/* -------------------------------------------------------------------------- */
function ResultsTable({ columns, rows }) {
  const { width } = useWindowDimensions();
  const available = width - 32 - 20; // screen padding + card padding

  const widths = useMemo(() => {
    const sample = rows.slice(0, 50);
    const base = columns.map((col) => {
      let maxLen = String(col).length;
      sample.forEach((r) => {
        const v = r[col];
        const len = v === null || v === undefined ? 4 : String(v).length;
        if (len > maxLen) maxLen = len;
      });
      return Math.min(220, Math.max(72, maxLen * 9 + 28));
    });
    const total = base.reduce((a, b) => a + b, 0);
    // If the table is narrower than the card, stretch the columns to fill it
    return total < available ? base.map((w) => (w / total) * available) : base;
  }, [columns, rows, available]);

  const totalWidth = widths.reduce((a, b) => a + b, 0);

  const renderRow = useCallback(
    ({ item, index }) => (
      <View
        className="flex-row items-center"
        style={{
          height: ROW_H,
          width: totalWidth,
          backgroundColor: index % 2 === 0 ? 'rgba(30,64,175,0.10)' : 'transparent',
        }}
      >
        {columns.map((col, i) => {
          const v = item[col];
          const isNull = v === null || v === undefined;
          return (
            <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
              <Text
                numberOfLines={1}
                className="text-[13px]"
                style={[
                  { color: C.text },
                  typeof v === 'number' && { color: '#BFD3FF' },
                  isNull && { color: C.muted, fontStyle: 'italic' },
                ]}
              >
                {isNull ? 'NULL' : String(v)}
              </Text>
            </View>
          );
        })}
      </View>
    ),
    [columns, widths, totalWidth]
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator style={{ flex: 1 }}>
      <View style={{ width: totalWidth }}>
        {/* Header stays fixed while rows scroll */}
        <View
          className="flex-row items-center rounded-t-xl"
          style={{ height: ROW_H, width: totalWidth, backgroundColor: 'rgba(59,130,246,0.22)' }}
        >
          {columns.map((col, i) => (
            <View key={i} className="px-3 justify-center" style={{ width: widths[i] }}>
              <Text numberOfLines={1} className="text-xs font-extrabold" style={{ color: '#BFD3FF' }}>
                {String(col).toLowerCase()}
              </Text>
            </View>
          ))}
        </View>

        <FlatList
          data={rows}
          renderItem={renderRow}
          keyExtractor={(_, i) => String(i)}
          getItemLayout={(_, index) => ({ length: ROW_H, offset: ROW_H * index, index })}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
          showsVerticalScrollIndicator
          persistentScrollbar
          style={{ flex: 1 }}
          ListEmptyComponent={
            <Text className="text-[13px] text-center py-6" style={{ color: C.muted, width: available }}>
              No rows returned
            </Text>
          }
        />
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/*  Bottom sheet                                                               */
/* -------------------------------------------------------------------------- */
function Sheet({ visible, title, onClose, children }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onPress={onClose} />
      <View
        className="px-4 pt-2.5 rounded-t-[28px]"
        style={{
          backgroundColor: '#04123A',
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: C.border,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <View
          className="self-center w-10 h-1 rounded-full mb-3"
          style={{ backgroundColor: 'rgba(147,164,199,0.4)' }}
        />
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-base font-extrabold">{title}</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color={C.muted} />
          </TouchableOpacity>
        </View>
        {children}
      </View>
    </Modal>
  );
}

/* -------------------------------------------------------------------------- */
/*  Examples                                                                   */
/* -------------------------------------------------------------------------- */
const EXAMPLES = [
  { title: 'Select everything', query: 'SELECT * FROM students;' },
  {
    title: 'Filter with WHERE',
    query: 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;',
  },
  {
    title: 'Count students per course',
    query: 'SELECT course, COUNT(*) AS total\nFROM students\nGROUP BY course\nORDER BY total DESC;',
  },
  {
    title: 'JOIN two tables',
    query:
      'SELECT s.name, r.course_code, r.score\nFROM students s\nJOIN results r ON r.student_id = s.id\nORDER BY r.score DESC;',
  },
  {
    title: 'Average score per course',
    query: 'SELECT course_code, ROUND(AVG(score), 1) AS average\nFROM results\nGROUP BY course_code;',
  },
  {
    title: 'Insert a row',
    query: "INSERT INTO students (name, age, course)\nVALUES ('Aisha', 20, 'CS');",
  },
  {
    title: 'Update a row',
    query: "UPDATE students\nSET age = 25\nWHERE name = 'John';",
  },
  {
    title: 'Create your own table',
    query: 'CREATE TABLE books (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  title TEXT,\n  price REAL\n);',
  },
];

const DEFAULT_QUERY = 'SELECT id, name, age, course\nFROM students\nWHERE age > 20\nORDER BY name;';

/* -------------------------------------------------------------------------- */
/*  Turn raw SQLite error text into something a learner can understand         */
/* -------------------------------------------------------------------------- */
function friendlyError(raw) {
  const msg = String(raw || '').replace(/^Error:\s*/, '');

  let match = msg.match(/table\s+["']?(\w+)["']?\s+already exists/i);
  if (match) {
    return `A table named "${match[1]}" already exists. Choose a different name, or use CREATE TABLE IF NOT EXISTS ${match[1]} (...) to skip the error when it's already there.`;
  }

  match = msg.match(/no such table:?\s*["']?(\w+)["']?/i);
  if (match) {
    return `There's no table named "${match[1]}". Check the spelling, or open "Database tables" to see which tables exist.`;
  }

  match = msg.match(/no such column:?\s*["']?([\w.]+)["']?/i);
  if (match) {
    return `There's no column named "${match[1]}". Check the spelling against the table's actual columns.`;
  }

  match = msg.match(/UNIQUE constraint failed:\s*([\w.]+)/i);
  if (match) {
    return `That value already exists in ${match[1]}, and this column only allows unique values.`;
  }

  if (/NOT NULL constraint failed:\s*([\w.]+)/i.test(msg)) {
    const col = msg.match(/NOT NULL constraint failed:\s*([\w.]+)/i)[1];
    return `${col} can't be left empty. Give it a value and try again.`;
  }

  if (/syntax error/i.test(msg)) {
    return `There's a syntax error in that query. Check for a missing comma, quote, or keyword. (${msg})`;
  }

  // Fall back to the original message when none of the common cases match
  return msg;
}

/* -------------------------------------------------------------------------- */
/*  Screen                                                                     */
/* -------------------------------------------------------------------------- */
export default function PlaygroundScreen() {
  const insets = useSafeAreaInsets();
  const dbRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [sql, setSql] = useState(DEFAULT_QUERY);
  const [inputH, setInputH] = useState(0);
  const [result, setResult] = useState(null);

  const [showExamples, setShowExamples] = useState(false);
  const [showTables, setShowTables] = useState(false);
  const [tables, setTables] = useState([]);

  const lineCount = sql.split('\n').length;
  const editorH = Math.max(MIN_LINES * LINE_H, lineCount * LINE_H, inputH);

  /* ---- run a query ---- */
  const runQuery = useCallback(
    async (override) => {
      const db = dbRef.current;
      if (!db) return;

      const text = (override ?? sql).trim();
      if (!text) {
        setResult({ kind: 'error', message: 'Write a query first.' });
        return;
      }

      Keyboard.dismiss();
      setRunning(true);
      const start = Date.now();

      try {
        const cleaned = text.replace(/;+\s*$/, '');
        const stripped = cleaned.replace(/--[^\n]*/g, '').trim();
        const isRead = /^(select|with|pragma|explain)\b/i.test(stripped);
        const multi = stripped.includes(';');

        if (isRead && !multi) {
          // Prepared statement so we can read the column names even when 0 rows come back
          const stmt = await db.prepareAsync(cleaned);
          try {
            const res = await stmt.executeAsync();
            const all = await res.getAllAsync();

            let columns = [];
            try {
              if (typeof stmt.getColumnNamesAsync === 'function') {
                columns = await stmt.getColumnNamesAsync();
              }
            } catch (e) {
              columns = [];
            }
            if (!columns.length && all.length) columns = Object.keys(all[0]);

            setResult({
              kind: 'rows',
              columns,
              rows: all.slice(0, MAX_ROWS),
              truncated: all.length > MAX_ROWS,
              ms: Date.now() - start,
            });
          } finally {
            await stmt.finalizeAsync();
          }
        } else if (multi) {
          await db.execAsync(cleaned + ';');
          setResult({ kind: 'ok', message: 'Statements executed successfully.', ms: Date.now() - start });
        } else {
          const r = await db.runAsync(cleaned);
          setResult({
            kind: 'ok',
            message:
              r.changes > 0
                ? `Query OK, ${r.changes} row${r.changes === 1 ? '' : 's'} affected.`
                : 'Query executed successfully.',
            ms: Date.now() - start,
          });
        }
      } catch (e) {
        setResult({ kind: 'error', message: friendlyError((e && e.message) || e) });
      } finally {
        setRunning(false);
      }
    },
    [sql]
  );

  /* ---- open + seed the database, then run the default query ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const db = await SQLite.openDatabaseAsync('playground.db');
        await setupDatabase(db);
        if (cancelled) return;
        dbRef.current = db;
        setReady(true);
        runQuery(DEFAULT_QUERY);
      } catch (e) {
        if (!cancelled) {
          setResult({ kind: 'error', message: `Could not open the database: ${friendlyError((e && e.message) || e)}` });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- helpers ---- */
  const openTables = async () => {
    const db = dbRef.current;
    if (!db) return;
    try {
      const list = await db.getAllAsync(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
      );
      const withCounts = [];
      for (const t of list) {
        const c = await db.getFirstAsync(`SELECT COUNT(*) AS c FROM "${t.name}"`);
        withCounts.push({ name: t.name, count: c ? c.c : 0 });
      }
      setTables(withCounts);
    } catch (e) {
      setTables([]);
    }
    setShowTables(true);
  };

  const confirmReset = () => {
    Alert.alert(
      'Reset playground database?',
      'This deletes every table (including ones you created) and restores the original sample data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const db = dbRef.current;
            if (!db) return;
            try {
              await resetDatabase(db);
              setShowTables(false);
              setSql(DEFAULT_QUERY);
              runQuery(DEFAULT_QUERY);
            } catch (e) {
              setResult({ kind: 'error', message: friendlyError((e && e.message) || e) });
            }
          },
        },
      ]
    );
  };

  /* ---- results header badge ---- */
  const badge =
    result && result.kind === 'rows'
      ? `${result.rows.length}${result.truncated ? '+' : ''} row${result.rows.length === 1 ? '' : 's'}`
      : result && result.kind === 'ok'
      ? 'Done'
      : result && result.kind === 'error'
      ? 'Error'
      : '';
  const isError = result && result.kind === 'error';

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#020A2A" />

      {/* --- HEADER --- */}
      <View
        className="flex-row items-center justify-between px-4 pb-3"
        style={{ paddingTop: insets.top + 8 }}
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={glassBox}
          onPress={() => setShowExamples(true)}
          accessibilityLabel="Example queries"
        >
          <Ionicons name="menu" size={22} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-extrabold tracking-wide">SQL Playground</Text>

        <TouchableOpacity
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={glassBox}
          onPress={openTables}
          accessibilityLabel="Database tables"
        >
          <Ionicons name="server-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View className="flex-1 px-4 pb-3">
          {/* --- EDITOR --- */}
          <View
            className="rounded-2xl overflow-hidden"
            style={{ height: 210, backgroundColor: C.panel, borderWidth: 1, borderColor: C.border }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingRight: 44 }}
            >
              <View className="flex-row">
                {/* Line numbers */}
                <View style={{ width: 28, marginRight: 10 }}>
                  {Array.from({ length: Math.max(lineCount, MIN_LINES) }).map((_, i) => (
                    <Text key={i} style={[codeFont, { color: '#4B5F8F', textAlign: 'right' }]}>
                      {i + 1}
                    </Text>
                  ))}
                </View>

                {/* Plain, directly visible TextInput — no highlight layer behind it */}
                <View className="flex-1" style={{ height: editorH }}>
                  <TextInput
                    value={sql}
                    onChangeText={setSql}
                    onContentSizeChange={(e) => setInputH(e.nativeEvent.contentSize.height)}
                    multiline
                    scrollEnabled={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textAlignVertical="top"
                    selectionColor={C.cyan}
                    cursorColor={C.cyan}
                    underlineColorAndroid="transparent"
                    placeholder="Write your SQL here..."
                    placeholderTextColor={C.muted}
                    style={[
                      codeFont,
                      {
                        color: C.text,
                        backgroundColor: 'transparent',
                        height: editorH,
                      },
                    ]}
                  />
                </View>
              </View>
            </ScrollView>

            {/* Clear button */}
            {sql.length > 0 && (
              <TouchableOpacity
                className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-lg items-center justify-center"
                style={{ backgroundColor: 'rgba(2,10,42,0.6)' }}
                onPress={() => setSql('')}
                accessibilityLabel="Clear query"
                hitSlop={8}
              >
                <Ionicons name="close-circle-outline" size={18} color={C.muted} />
              </TouchableOpacity>
            )}
          </View>

          {/* --- RUN BUTTON --- */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => runQuery()}
            disabled={!ready || running}
            accessibilityRole="button"
            accessibilityLabel="Run query"
            className="mt-3"
            style={{ opacity: !ready || running ? 0.7 : 1 }}
          >
            <LinearGradient
              colors={['#0EA5E9', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="h-[52px] rounded-2xl flex-row items-center justify-center"
              style={{
                height: 52,
                borderRadius: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#0EA5E9',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.35,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {running || !ready ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="play" size={18} color="#fff" />
                  <Text className="text-white text-base font-bold ml-2">Run Query</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* --- RESULTS --- */}
          <View className="flex-1 mt-3 rounded-2xl p-2.5" style={[glassBox, { minHeight: 160 }]}>
            <View className="flex-row items-center justify-between px-1 pb-2.5">
              <Text className="text-white text-[15px] font-bold">Results</Text>
              <View className="flex-row items-center">
                {result && result.kind !== 'error' && (
                  <Text className="text-[11px] mr-2" style={{ color: C.muted }}>
                    {result.ms} ms
                  </Text>
                )}
                {!!badge && (
                  <View
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: isError ? 'rgba(248,113,113,0.15)' : 'rgba(34,211,238,0.12)',
                      borderWidth: 1,
                      borderColor: isError ? 'rgba(248,113,113,0.5)' : 'rgba(34,211,238,0.4)',
                    }}
                  >
                    <Text className="text-[11px] font-bold" style={{ color: isError ? C.red : '#BFD3FF' }}>
                      {badge}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View className="flex-1">
              {!result && (
                <View className="flex-1 items-center justify-center px-3">
                  <Ionicons name="terminal-outline" size={28} color={C.muted} />
                  <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
                    Run a query to see results here
                  </Text>
                </View>
              )}

              {result && result.kind === 'error' && (
                <ScrollView contentContainerStyle={{ padding: 4 }}>
                  <View
                    className="flex-row p-3 rounded-xl"
                    style={{
                      backgroundColor: 'rgba(248,113,113,0.10)',
                      borderWidth: 1,
                      borderColor: 'rgba(248,113,113,0.4)',
                    }}
                  >
                    <Ionicons name="alert-circle" size={18} color={C.red} style={{ marginRight: 8, marginTop: 1 }} />
                    <Text className="flex-1 text-[13px] leading-[19px]" style={{ color: '#FCA5A5' }}>
                      {result.message}
                    </Text>
                  </View>
                </ScrollView>
              )}

              {result && result.kind === 'ok' && (
                <View className="flex-1 items-center justify-center px-3">
                  <Ionicons name="checkmark-circle" size={30} color={C.green} />
                  <Text className="text-[13px] mt-2 text-center" style={{ color: C.text }}>
                    {result.message}
                  </Text>
                </View>
              )}

              {result && result.kind === 'rows' && result.columns.length === 0 && (
                <View className="flex-1 items-center justify-center px-3">
                  <Ionicons name="file-tray-outline" size={28} color={C.muted} />
                  <Text className="text-[13px] mt-2 text-center" style={{ color: C.muted }}>
                    No rows returned
                  </Text>
                </View>
              )}

              {result && result.kind === 'rows' && result.columns.length > 0 && (
                <>
                  <ResultsTable columns={result.columns} rows={result.rows} />
                  {result.truncated && (
                    <Text className="text-[11px] text-center pt-1.5" style={{ color: C.muted }}>
                      Showing the first {MAX_ROWS} rows
                    </Text>
                  )}
                </>
              )}
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* --- EXAMPLES SHEET --- */}
      <Sheet visible={showExamples} title="Example queries" onClose={() => setShowExamples(false)}>
        <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
          {EXAMPLES.map((ex) => (
            <TouchableOpacity
              key={ex.title}
              activeOpacity={0.8}
              className="flex-row items-center p-3.5 mb-2 rounded-2xl"
              style={glassBox}
              onPress={() => {
                setSql(ex.query);
                setShowExamples(false);
              }}
            >
              <View className="flex-1">
                <Text className="text-white text-sm font-bold">{ex.title}</Text>
                <Text numberOfLines={1} className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {ex.query.replace(/\n/g, ' ')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Sheet>

      {/* --- TABLES SHEET --- */}
      <Sheet visible={showTables} title="Database tables" onClose={() => setShowTables(false)}>
        <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
          {tables.length === 0 && (
            <Text className="text-[13px] text-center p-4" style={{ color: C.muted }}>
              No tables yet
            </Text>
          )}
          {tables.map((t) => (
            <TouchableOpacity
              key={t.name}
              activeOpacity={0.8}
              className="flex-row items-center p-3.5 mb-2 rounded-2xl"
              style={glassBox}
              onPress={() => {
                setSql(`SELECT * FROM ${t.name};`);
                setShowTables(false);
              }}
            >
              <View
                className="w-[38px] h-[38px] rounded-[10px] items-center justify-center mr-3"
                style={{
                  backgroundColor: 'rgba(34,211,238,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(34,211,238,0.4)',
                }}
              >
                <Ionicons name="grid-outline" size={18} color={C.cyan} />
              </View>
              <View className="flex-1">
                <Text className="text-white text-sm font-bold">{t.name}</Text>
                <Text className="text-xs mt-0.5" style={{ color: C.muted }}>
                  {t.count} row{t.count === 1 ? '' : 's'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={C.muted} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={confirmReset}
          className="mt-1.5 h-[46px] rounded-2xl flex-row items-center justify-center"
          style={{
            backgroundColor: 'rgba(248,113,113,0.10)',
            borderWidth: 1,
            borderColor: 'rgba(248,113,113,0.45)',
          }}
        >
          <Ionicons name="refresh" size={16} color={C.red} />
          <Text className="text-sm font-bold ml-2" style={{ color: C.red }}>
            Reset database
          </Text>
        </TouchableOpacity>
      </Sheet>
    </LinearGradient>
  );
}