// src/MainApp.tsx
import React, { useState, useEffect } from 'react';
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
  Clipboard,
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
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'settings'>('calculator');

  // Stop animation when switching tabs
  useEffect(() => {
    if (activeTab === 'settings' && animationRef.current) {
      animationRef.current.stop();
    }
  }, [activeTab]);

  const startDropAnimation = (speed: number) => {
    if (animationRef.current) animationRef.current.stop();
    
    dropAnim.setValue(0);
    animationRef.current = Animated.loop(
      Animated.timing(dropAnim, {
        toValue: 1,
        duration: Math.max(500, speed * 1000),
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animationRef.current.start();
  };

  const stopAnimation = () => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  };

  const validateInputs = (): boolean => {
    const vol = parseFloat(volume);
    const hrs = parseFloat(hours) || 0;
    const mins = parseFloat(minutes) || 0;

    if (!vol || vol <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid fluid volume (ml)");
      return false;
    }
    if (vol > 5000) {
      Alert.alert("Warning", "Volume seems very high. Please double-check.");
    }
    if (hrs === 0 && mins === 0) {
      Alert.alert("Invalid Input", "Please enter infusion duration");
      return false;
    }
    if (hrs > 48) {
      Alert.alert("Warning", "Duration is very long. Please confirm.");
    }
    return true;
  };

  const calculate = () => {
    if (!validateInputs()) return;

    const vol = parseFloat(volume);
    const hrs = parseFloat(hours) || 0;
    const mins = parseFloat(minutes) || 0;
    const totalMinutes = hrs * 60 + mins;

    const exactDrops = (vol * dropFactor) / totalMinutes;
    const rounded = Math.round(exactDrops);
    const secPerDrop = 60 / exactDrops;
    const mlHr = vol / (totalMinutes / 60);

    setResult(rounded);
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
    stopAnimation();
  };

  const copyResult = async () => {
    if (!result) return;
    
    const text = `${result} gtt/min (${dropFactor} drop factor)\n≈ ${secondsPerDrop?.toFixed(1)} sec per drop\n${mlPerHour} ml/hr`;
    
    await Clipboard.setString(text);
    Alert.alert("Copied!", "Result copied to clipboard");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Main Content */}
      {activeTab === 'calculator' ? (
        <ScrollView style={{ flex: 1 }}>
          <LinearGradient colors={theme === 'dark' ? ['#0f172a', '#1e2937'] : ['#f8fafc', '#e0f2fe']} style={{ flex: 1, padding: 20 }}>
            {/* Header */}
            <View style={{ alignItems: 'center', marginVertical: 30 }}>
              <Ionicons name="water" size={60} color={colors.primary} />
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginTop: 10 }}>IV Fluid Calculator</Text>
              <Text style={{ color: colors.muted }}>Clinical Tool by Salman Toha</Text>
            </View>

            {/* Form */}
            <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.border }}>
              {/* Volume, Time, Drop Factor inputs... (same as before) */}
              <View style={{ marginBottom: 18 }}>
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Total Fluid Volume</Text>
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
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 8 }}>Infusion Time</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 }}>
                      <TextInput style={{ flex: 1, color: colors.text, fontSize: 18 }} placeholder="0" keyboardType="numeric" value={hours} onChangeText={setHours} />
                      <Text style={{ color: colors.muted }}>hr</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', backgroundColor: theme === 'dark' ? '#334155' : '#f1f5f9', borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 }}>
                      <TextInput style={{ flex: 1, color: colors.text, fontSize: 18 }} placeholder="30" keyboardType="numeric" value={minutes} onChangeText={setMinutes} maxLength={2} />
                      <Text style={{ color: colors.muted }}>min</Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: colors.text, fontWeight: '600', marginBottom: 10 }}>Infusion Set</Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setDropFactor(15)} style={{ flex: 1, padding: 16, backgroundColor: dropFactor === 15 ? colors.primary : colors.card, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: dropFactor === 15 ? colors.primary : colors.border }}>
                    <Text style={{ color: dropFactor === 15 ? '#0f172a' : colors.text, fontWeight: '600' }}>Macro Drop (15)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDropFactor(60)} style={{ flex: 1, padding: 16, backgroundColor: dropFactor === 60 ? colors.primary : colors.card, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: dropFactor === 60 ? colors.primary : colors.border }}>
                    <Text style={{ color: dropFactor === 60 ? '#0f172a' : colors.text, fontWeight: '600' }}>Micro Drop (60)</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={calculate} style={{ backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center' }}>
                <Text style={{ color: '#0f172a', fontSize: 18, fontWeight: '700' }}>Calculate Drop Rate</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={reset} style={{ marginTop: 12 }}>
                <Text style={{ textAlign: 'center', color: colors.muted }}>Reset</Text>
              </TouchableOpacity>
            </View>

            {/* Result */}
            {result !== null && (
              <View style={{ marginTop: 24, backgroundColor: colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 16 }}>Drops Per Minute</Text>
                <Text style={{ fontSize: 62, fontWeight: '800', color: colors.accent, textAlign: 'center' }}>{result}</Text>
                <Text style={{ textAlign: 'center', color: colors.muted }}>gtt/min</Text>

                {secondsPerDrop && <Text style={{ textAlign: 'center', marginTop: 8, color: colors.text }}>1 drop every {secondsPerDrop.toFixed(1)} seconds</Text>}

                <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
                  <Animated.View style={{ transform: [{ translateY: dropAnim.interpolate({ inputRange: [0, 1], outputRange: [-15, 35] }) }] }}>
                    <Ionicons name="water" size={42} color={colors.primary} />
                  </Animated.View>
                </View>

                {mlPerHour && <Text style={{ textAlign: 'center', color: colors.accent, fontWeight: '600', marginBottom: 16 }}>≈ {mlPerHour} ml/hour</Text>}

                <TouchableOpacity onPress={copyResult} style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                  <Ionicons name="copy" size={20} color="#0f172a" />
                  <Text style={{ color: '#0f172a', fontWeight: '700' }}>Copy Result</Text>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </ScrollView>
      ) : (
        /* Settings Tab */
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
          <LinearGradient colors={theme === 'dark' ? ['#0f172a', '#1e2937'] : ['#f8fafc', '#e0f2fe']} style={{ flex: 1, borderRadius: 20, padding: 24 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 30 }}>Settings</Text>

            <TouchableOpacity onPress={toggleTheme} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, padding: 20, borderRadius: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="moon-outline" size={28} color={colors.text} />
                <Text style={{ marginLeft: 15, fontSize: 18, color: colors.text }}>Dark Mode</Text>
              </View>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{theme === 'dark' ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>

            <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 16 }}>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>About</Text>
              <Text style={{ color: colors.muted, lineHeight: 22 }}>
                IV Fluid Drop Calculator{'\n\n'}
                Made by Salman Toha{'\n'}
                GitHub: TheLunatic1
              </Text>
            </View>
          </LinearGradient>
        </ScrollView>
      )}

      {/* Bottom Tab Bar */}
      <View style={{ 
        flexDirection: 'row', 
        backgroundColor: colors.card, 
        borderTopWidth: 1, 
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
      }}>
        <TouchableOpacity onPress={() => setActiveTab('calculator')} style={{ flex: 1, alignItems: 'center', padding: 8 }}>
          <Ionicons name="calculator-outline" size={26} color={activeTab === 'calculator' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'calculator' ? colors.primary : colors.muted, fontSize: 12, marginTop: 4 }}>Calculator</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('settings')} style={{ flex: 1, alignItems: 'center', padding: 8 }}>
          <Ionicons name="settings-outline" size={26} color={activeTab === 'settings' ? colors.primary : colors.muted} />
          <Text style={{ color: activeTab === 'settings' ? colors.primary : colors.muted, fontSize: 12, marginTop: 4 }}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}