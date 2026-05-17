// src/MainApp.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function MainApp() {
  const { colors, theme, toggleTheme } = useTheme();

  // Calculator State
  const [volume, setVolume] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [dropFactor, setDropFactor] = useState<15 | 60>(15);
  const [result, setResult] = useState<number | null>(null);
  const [secondsPerDrop, setSecondsPerDrop] = useState<number | null>(null);
  const [mlPerHour, setMlPerHour] = useState<number | null>(null);

  const dropAnim = React.useRef(new Animated.Value(0)).current;

  const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');

  const startDropAnimation = (speed: number) => {
    dropAnim.setValue(0);
    Animated.loop(
      Animated.timing(dropAnim, {
        toValue: 1,
        duration: Math.max(500, speed * 1000),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const calculate = () => {
    const vol = parseFloat(volume);
    const hrs = parseFloat(hours) || 0;
    const mins = parseFloat(minutes) || 0;

    if (!vol || vol <= 0) {
      Alert.alert("Error", "Please enter valid fluid volume (ml)");
      return;
    }
    if (hrs === 0 && mins === 0) {
      Alert.alert("Error", "Please enter time duration");
      return;
    }

    const totalMinutes = hrs * 60 + mins;
    const exactDrops = (vol * dropFactor) / totalMinutes;
    const roundedDrops = Math.round(exactDrops);
    const secPerDrop = 60 / exactDrops;
    const mlHr = vol / (totalMinutes / 60);

    setResult(roundedDrops);
    setSecondsPerDrop(secPerDrop);
    setMlPerHour(Math.round(mlHr * 10) / 10);

    startDropAnimation(secPerDrop);
  };

  const reset = () => {
    setVolume('');
    setHours('');
    setMinutes('');
    setResult(null);
    setSecondsPerDrop(null);
    setMlPerHour(null);
    dropAnim.setValue(0);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top Navigation */}
      <View style={{ flexDirection: 'row', backgroundColor: '#0f172a', paddingTop: 10 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('calculator')}
          style={{ flex: 1, padding: 16, alignItems: 'center', borderBottomWidth: activeTab === 'calculator' ? 3 : 0, borderBottomColor: colors.primary }}
        >
          <Ionicons name="calculator" size={24} color={activeTab === 'calculator' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'calculator' ? colors.primary : colors.muted, fontWeight: '600' }}>Calculator</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setActiveTab('settings')}
          style={{ flex: 1, padding: 16, alignItems: 'center', borderBottomWidth: activeTab === 'settings' ? 3 : 0, borderBottomColor: colors.primary }}
        >
          <Ionicons name="settings" size={24} color={activeTab === 'settings' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'settings' ? colors.primary : colors.muted, fontWeight: '600' }}>Settings</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'calculator' ? (
        <ScrollView style={{ flex: 1 }}>
          <LinearGradient colors={theme === 'dark' ? ['#0f172a', '#1e2937'] : ['#f8fafc', '#e0f2fe']} style={{ flex: 1, padding: 20 }}>
            
            <View style={{ alignItems: 'center', marginVertical: 30 }}>
              <Ionicons name="water" size={60} color={colors.primary} />
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 10 }}>IV Fluid Calculator</Text>
            </View>

            {/* Input Form */}
            <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>

              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Total Volume</Text>
                <View style={{ flexDirection: 'row', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 }}>
                  <TextInput
                    style={{ flex: 1, color: colors.text, fontSize: 18, paddingVertical: 14 }}
                    placeholder="500"
                    keyboardType="numeric"
                    value={volume}
                    onChangeText={setVolume}
                  />
                  <Text style={{ color: colors.muted }}>ml</Text>
                </View>
              </View>

              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Duration</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 }}>
                      <TextInput style={{ flex: 1, color: colors.text, fontSize: 18, paddingVertical: 14 }} placeholder="0" keyboardType="numeric" value={hours} onChangeText={setHours} />
                      <Text style={{ color: colors.muted }}>hr</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 }}>
                      <TextInput style={{ flex: 1, color: colors.text, fontSize: 18, paddingVertical: 14 }} placeholder="30" keyboardType="numeric" value={minutes} onChangeText={setMinutes} maxLength={2} />
                      <Text style={{ color: colors.muted }}>min</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Drop Type */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 10 }}>Drop Factor</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setDropFactor(15)} style={{ flex: 1, padding: 16, backgroundColor: dropFactor === 15 ? colors.primary : colors.card, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: dropFactor === 15 ? colors.primary : colors.border }}>
                    <Text style={{ color: dropFactor === 15 ? '#0f172a' : colors.text, fontWeight: '600' }}>Macro (15)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDropFactor(60)} style={{ flex: 1, padding: 16, backgroundColor: dropFactor === 60 ? colors.primary : colors.card, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: dropFactor === 60 ? colors.primary : colors.border }}>
                    <Text style={{ color: dropFactor === 60 ? '#0f172a' : colors.text, fontWeight: '600' }}>Micro (60)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={calculate} style={{ backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '700' }}>Calculate Drop Rate</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={reset} style={{ marginTop: 12, padding: 12 }}>
                <Text style={{ textAlign: 'center', color: colors.muted }}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Result */}
            {result !== null && (
              <View style={{ marginTop: 20, backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ textAlign: 'center', color: colors.muted }}>Drops Per Minute</Text>
                <Text style={{ fontSize: 56, fontWeight: '800', color: colors.accent, textAlign: 'center' }}>{result}</Text>
                <Text style={{ textAlign: 'center', color: colors.muted }}>gtt/min</Text>

                {secondsPerDrop && <Text style={{ textAlign: 'center', marginTop: 10, color: colors.text }}>≈ 1 drop every {secondsPerDrop.toFixed(1)} sec</Text>}

                {/* Animation */}
                <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View style={{ transform: [{ translateY: dropAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 40] }) }] }}>
                    <Ionicons name="water" size={40} color={colors.primary} />
                  </Animated.View>
                </View>

                {mlPerHour && (
                  <Text style={{ textAlign: 'center', color: colors.accent, fontWeight: '600' }}>
                    Flow Rate: {mlPerHour} ml/hour
                  </Text>
                )}
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      ) : (
        /* Settings Screen */
        <ScrollView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
          <LinearGradient colors={theme === 'dark' ? ['#0f172a', '#1e2937'] : ['#f8fafc', '#e0f2fe']} style={{ flex: 1, borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 30 }}>Settings</Text>

            <TouchableOpacity onPress={toggleTheme} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 20, borderRadius: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon" size={28} color={colors.text} />
                <Text style={{ color: colors.text, fontSize: 18, marginLeft: 15 }}>Dark Mode</Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{theme === 'dark' ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 10 }}>About</Text>
              <Text style={{ color: colors.muted, lineHeight: 22 }}>
                IV Fluid Calculator{'\n\n'}
                Made by Salman Toha{'\n'}
                GitHub: TheLunatic1
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}