// import React from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StatusBar,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// // Preserved exact theme colors
// const C = {
//   bg: ['#020A2A', '#031445', '#020A2A'],
//   border: 'rgba(59,130,246,0.45)',
//   glass: 'rgba(30,64,175,0.22)',
//   cyan: '#22D3EE',
//   blue: '#3B82F6',
//   muted: '#93A4C7',
// };

// const H_PADDING = 20;

// export default function HomeScreen() {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();

//   return (
//     <LinearGradient colors={C.bg} style={{ flex: 1 }}>
//       <StatusBar barStyle="light-content" backgroundColor="rgba(59,130,246,0.45)" />

//       <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
//         {/* --- HERO HEADER --- */}
//         <View
//           style={{
//             paddingTop: insets.top + 12,
//             paddingHorizontal: H_PADDING,
//             paddingBottom: 56,
//             borderBottomLeftRadius: 40,
//             borderBottomRightRadius: 40,
//             borderBottomWidth: 1,
//             borderLeftWidth: 1,
//             borderRightWidth: 1,
//             borderColor: C.border,
//             backgroundColor: 'rgba(30,64,175,0.28)',
//             shadowColor: C.blue,
//             shadowOpacity: 0.35,
//             shadowRadius: 16,
//             shadowOffset: { width: 0, height: 6 },
//             elevation: 10,
//             overflow: 'hidden',
//           }}
//         >
//           <View
//             className="absolute rounded-full"
//             style={{ width: 220, height: 220, top: -80, right: -60, backgroundColor: 'rgba(34,211,238,0.10)' }}
//           />

//           <View className="flex-row items-center">
//             <View
//               className="p-2.5 rounded-2xl mr-3"
//               style={{
//                 backgroundColor: 'rgba(34,211,238,0.12)',
//                 borderWidth: 1,
//                 borderColor: 'rgba(34,211,238,0.4)',
//               }}
//             >
//               <Image
//                 source={require('../../assets/images/icon.png')}
//                 className="w-10 h-10"
//                 resizeMode="contain"
//               />
//             </View>
//             <View className="flex-1">
//               <Text className="text-xs font-medium" style={{ color: C.muted }}>Welcome back 👋</Text>
//               <Text className="text-white text-lg font-extrabold tracking-wide">
//                 Learn SQL <Text style={{ color: C.cyan }}>Offline</Text>
//               </Text>
//             </View>
//             <View
//               className="flex-row items-center px-3 py-1.5 rounded-full"
//               style={{
//                 backgroundColor: 'rgba(34,211,238,0.12)',
//                 borderWidth: 1,
//                 borderColor: 'rgba(34,211,238,0.4)',
//               }}
//             >
//               <Ionicons name="cloud-offline-outline" size={13} color={C.cyan} />
//               <Text className="text-[10px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>Offline</Text>
//             </View>
//           </View>

//           <Text className="text-white text-2xl font-extrabold mt-6">
//             Ready to write your{'\n'}
//             <Text style={{ color: C.cyan }}>next query?</Text>
//           </Text>
//           <Text className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>
//             Pick up where you left off or jump into something new.
//           </Text>
//         </View>

//         {/* --- WRITE-UP CONTENT --- */}
//         <View style={{ paddingHorizontal: H_PADDING, marginTop: -32 }}>
//           {/* Main App Overview */}
//           <View
//             className="rounded-3xl p-6 mb-6"
//             style={{
//               backgroundColor: '#061552',
//               borderWidth: 1,
//               borderColor: C.border,
//               shadowColor: C.blue,
//               shadowOpacity: 0.3,
//               shadowRadius: 12,
//               shadowOffset: { width: 0, height: 4 },
//               elevation: 6,
//             }}
//           >
//             <Text className="text-white text-xl font-bold mb-3">
//               Master SQL Data Queries Offline
//             </Text>

//             <Text className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
//               Welcome to <Text className="font-semibold text-white">Learn SQL Offline</Text>—your personal reference and guide to mastering database management and relational query design. Whether you are learning basic table queries or writing complex joins and transactions, this app gives you everything you need without requiring an active internet connection.
//             </Text>

//             <Text className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
//               Learn essential relational concepts including <Text style={{ color: C.cyan }}>SELECT</Text>, <Text style={{ color: C.cyan }}>WHERE</Text>, <Text style={{ color: C.cyan }}>JOINs</Text>, aggregations, subqueries, indexing, and data security—all structured for fast offline reference.
//             </Text>

//             {/* Offline Highlight Box */}
//             <View
//               className="p-4 rounded-2xl flex-row items-center"
//               style={{
//                 backgroundColor: 'rgba(34,211,238,0.10)',
//                 borderWidth: 1,
//                 borderColor: 'rgba(34,211,238,0.3)',
//               }}
//             >
//               <View
//                 className="w-10 h-10 rounded-xl items-center justify-center mr-3"
//                 style={{ backgroundColor: 'rgba(34,211,238,0.15)' }}
//               >
//                 <Ionicons name="wifi-outline" size={20} color={C.cyan} />
//               </View>
//               <View className="flex-1">
//                 <Text className="text-white font-bold text-sm">100% Offline Access</Text>
//                 <Text className="text-xs mt-0.5" style={{ color: C.muted }}>
//                   Study SQL anywhere without using data or needing Wi-Fi.
//                 </Text>
//               </View>
//             </View>
//           </View>

//           {/* Tip Card */}
//           <View
//             className="flex-row items-start p-4 mb-6 rounded-2xl"
//             style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
//           >
//             <View
//               className="w-10 h-10 rounded-xl items-center justify-center mr-3"
//               style={{ backgroundColor: '#F59E0B33', borderWidth: 1, borderColor: '#F59E0B88' }}
//             >
//               <Ionicons name="bulb" size={18} color="#F59E0B" />
//             </View>
//             <View className="flex-1">
//               <Text className="text-white font-bold text-sm">Tip of the day</Text>
//               <Text className="text-xs mt-1 leading-relaxed" style={{ color: C.muted }}>
//                 Always use a WHERE clause with UPDATE and DELETE, otherwise you'll change every row in the table.
//               </Text>
//             </View>
//           </View>

//           {/* CTA Button */}
//           <TouchableOpacity
//             activeOpacity={0.85}
//             onPress={() => router.push('/lessons')}
//             accessibilityRole="button"
//             accessibilityLabel="Start learning"
//             className="py-4 rounded-2xl flex-row justify-center items-center"
//             style={{
//               backgroundColor: C.blue,
//               shadowColor: C.blue,
//               shadowOffset: { width: 0, height: 6 },
//               shadowOpacity: 0.4,
//               shadowRadius: 10,
//               elevation: 8,
//             }}
//           >
//             <Text className="text-white text-base font-bold mr-2">Start Learning</Text>
//             <Ionicons name="arrow-forward" size={20} color="white" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// }






import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Installed packages
import * as Application from 'expo-application';
import * as Linking from 'expo-linking';

// Preserved theme colors
const C = {
  bg: ['#020A2A', '#031445', '#020A2A'],
  border: 'rgba(59,130,246,0.45)',
  glass: 'rgba(30,64,175,0.22)',
  cyan: '#22D3EE',
  blue: '#3B82F6',
  muted: '#93A4C7',
};

const H_PADDING = 20;

// -------------------------------------------------------------------------
// 1. CONFIGURATION: REPLACE WITH YOUR SETTINGS
// -------------------------------------------------------------------------
// Your Android package name defined in app.json (e.g. com.yourname.learnsql)
const PLAY_STORE_PACKAGE_NAME = 'com.yourcompany.learnsqloffline';

// Hosted JSON link containing the latest version metadata.
// Example JSON shape: { "latestVersion": "1.1.0", "isMandatory": false }
const UPDATE_MANIFEST_URL = 'https://gist.githubusercontent.com/your-username/raw/version.json';

// Simple version comparison function ("1.0.1" vs "1.1.0")
function isVersionOutdated(currentVer, latestVer) {
  if (!currentVer || !latestVer) return false;
  const currentParts = currentVer.split('.').map(Number);
  const latestParts = latestVer.split('.').map(Number);

  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const current = currentParts[i] || 0;
    const latest = latestParts[i] || 0;
    if (latest > current) return true;
    if (latest < current) return false;
  }
  return false;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Update check states
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ latestVersion: '', isMandatory: false });
  const [isUpdating, setIsUpdating] = useState(false);

  // Get current installed app version from device
  const installedVersion = Application.nativeApplicationVersion || '1.0.0';

  // -------------------------------------------------------------------------
  // 2. CHECK FOR UPDATE ON MOUNT
  // -------------------------------------------------------------------------
  useEffect(() => {
    async function checkForAppUpdate() {
      try {
        const response = await fetch(UPDATE_MANIFEST_URL);
        if (!response.ok) return;

        const data = await response.json();
        
        // If Play Store version is higher than installed version, prompt user
        if (isVersionOutdated(installedVersion, data.latestVersion)) {
          setUpdateInfo({
            latestVersion: data.latestVersion,
            isMandatory: !!data.isMandatory,
          });
          setShowUpdateModal(true);
        }
      } catch (err) {
        // Silently catch errors so offline users aren't disrupted
        console.log('Update check skipped or offline:', err.message);
      }
    }

    checkForAppUpdate();
  }, [installedVersion]);

  // Redirect to Google Play Store
  const handleOpenPlayStore = async () => {
    setIsUpdating(true);
    const storeUrl = `market://details?id=${PLAY_STORE_PACKAGE_NAME}`;
    const webUrl = `https://play.google.com/store/apps/details?id=${PLAY_STORE_PACKAGE_NAME}`;

    try {
      const canOpen = await Linking.canOpenURL(storeUrl);
      if (canOpen) {
        await Linking.openURL(storeUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      await Linking.openURL(webUrl);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <LinearGradient colors={C.bg} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(59,130,246,0.45)" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- HERO HEADER --- */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingHorizontal: H_PADDING,
            paddingBottom: 56,
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
          <View
            className="absolute rounded-full"
            style={{ width: 220, height: 220, top: -80, right: -60, backgroundColor: 'rgba(34,211,238,0.10)' }}
          />

          <View className="flex-row items-center">
            <View
              className="p-2.5 rounded-2xl mr-3"
              style={{
                backgroundColor: 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.4)',
              }}
            >
              <Image
                source={require('../../assets/images/icon.png')}
                className="w-10 h-10"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-medium" style={{ color: C.muted }}>Welcome back 👋</Text>
              <Text className="text-white text-lg font-extrabold tracking-wide">
                Learn SQL <Text style={{ color: C.cyan }}>Offline</Text>
              </Text>
            </View>
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: 'rgba(34,211,238,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.4)',
              }}
            >
              <Ionicons name="cloud-offline-outline" size={13} color={C.cyan} />
              <Text className="text-[10px] font-semibold ml-1" style={{ color: '#BFD3FF' }}>
                v{installedVersion}
              </Text>
            </View>
          </View>

          <Text className="text-white text-2xl font-extrabold mt-6">
            Ready to write your{'\n'}
            <Text style={{ color: C.cyan }}>next query?</Text>
          </Text>
          <Text className="text-sm mt-2 leading-relaxed" style={{ color: C.muted }}>
            Pick up where you left off or jump into something new.
          </Text>
        </View>

        {/* --- WRITE-UP CONTENT --- */}
        <View style={{ paddingHorizontal: H_PADDING, marginTop: -32 }}>
          {/* Main App Overview */}
          <View
            className="rounded-3xl p-6 mb-6"
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
            <Text className="text-white text-xl font-bold mb-3">
              Master SQL Data Queries Offline
            </Text>

            <Text className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
              Welcome to <Text className="font-semibold text-white">Learn SQL Offline</Text>—your personal reference and guide to mastering database management and relational query design. Whether you are learning basic table queries or writing complex joins and transactions, this app gives you everything you need without requiring an active internet connection.
            </Text>

            <Text className="text-sm leading-relaxed mb-4" style={{ color: C.muted }}>
              Learn essential relational concepts including <Text style={{ color: C.cyan }}>SELECT</Text>, <Text style={{ color: C.cyan }}>WHERE</Text>, <Text style={{ color: C.cyan }}>JOINs</Text>, aggregations, subqueries, indexing, and data security—all structured for fast offline reference.
            </Text>

            {/* Offline Highlight Box */}
            <View
              className="p-4 rounded-2xl flex-row items-center"
              style={{
                backgroundColor: 'rgba(34,211,238,0.10)',
                borderWidth: 1,
                borderColor: 'rgba(34,211,238,0.3)',
              }}
            >
              <View
                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: 'rgba(34,211,238,0.15)' }}
              >
                <Ionicons name="wifi-outline" size={20} color={C.cyan} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">100% Offline Access</Text>
                <Text className="text-xs mt-0.5" style={{ color: C.muted }}>
                  Study SQL anywhere without using data or needing Wi-Fi.
                </Text>
              </View>
            </View>
          </View>

          {/* Tip Card */}
          <View
            className="flex-row items-start p-4 mb-6 rounded-2xl"
            style={{ backgroundColor: C.glass, borderWidth: 1, borderColor: C.border }}
          >
            <View
              className="w-10 h-10 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: '#F59E0B33', borderWidth: 1, borderColor: '#F59E0B88' }}
            >
              <Ionicons name="bulb" size={18} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-sm">Tip of the day</Text>
              <Text className="text-xs mt-1 leading-relaxed" style={{ color: C.muted }}>
                Always use a WHERE clause with UPDATE and DELETE, otherwise you'll change every row in the table.
              </Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/lessons')}
            accessibilityRole="button"
            accessibilityLabel="Start learning"
            className="py-4 rounded-2xl flex-row justify-center items-center"
            style={{
              backgroundColor: C.blue,
              shadowColor: C.blue,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 8,
            }}
          >
            <Text className="text-white text-base font-bold mr-2">Start Learning</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ------------------------------------------------------------------------- */}
      {/* 3. PLAY STORE UPDATE MODAL                                                 */}
      {/* ------------------------------------------------------------------------- */}
      <Modal
        visible={showUpdateModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!updateInfo.isMandatory) setShowUpdateModal(false);
        }}
      >
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          <View
            className="w-full rounded-3xl p-6 items-center"
            style={{
              backgroundColor: '#031445',
              borderWidth: 1,
              borderColor: C.border,
              shadowColor: C.blue,
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            {/* Download/Update Icon */}
            <View
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(34,211,238,0.15)',
                borderWidth: 1,
                borderColor: C.cyan,
              }}
            >
              <Ionicons name="cloud-download-outline" size={32} color={C.cyan} />
            </View>

            {/* Title & Version */}
            <Text className="text-white text-xl font-bold text-center mb-2">
              New Update Available!
            </Text>
            <Text className="text-xs text-center mb-4" style={{ color: C.muted }}>
              Version <Text className="text-white font-semibold">{updateInfo.latestVersion}</Text> is now available on the Play Store. Update now to get the latest features and query improvements.
            </Text>

            {/* Update Action Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleOpenPlayStore}
              disabled={isUpdating}
              className="w-full py-3.5 rounded-2xl flex-row items-center justify-center mb-3"
              style={{ backgroundColor: C.blue }}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google-playstore" size={18} color="white" className="mr-2" />
                  <Text className="text-white font-bold text-sm ml-2">Update on Play Store</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Dismiss option (Hidden if mandatory update) */}
            {!updateInfo.isMandatory && (
              <TouchableOpacity
                onPress={() => setShowUpdateModal(false)}
                className="py-2"
              >
                <Text className="text-xs font-semibold text-center" style={{ color: C.muted }}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}







// {
//   "latestVersion": "1.1.0",
//   "isMandatory": false
// }