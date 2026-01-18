import React, { useState, useEffect } from 'react';
import { 
  Text, View, StyleSheet, TouchableOpacity, Modal, 
  TextInput, StatusBar, SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';

export default function App() {
  // Keep the screen from dimming or sleeping
  useKeepAwake();

  // App States
  const [currentScreen, setCurrentScreen] = useState('Clock'); // 'Clock' or 'Message'
  const [time, setTime] = useState(new Date());
  const [securityCode, setSecurityCode] = useState('1234');
  const [displayMessage, setDisplayMessage] = useState('اجتماع');
  
  // Modal & Input States
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');
  const [newCodeInput, setNewCodeInput] = useState('');

  // 1. Clock Logic: Update every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    loadSettings(); // Load saved data on startup
    return () => clearInterval(timer);
  }, []);

  // 2. Persistence: Load and Save Data
  const loadSettings = async () => {
    try {
      const savedCode = await AsyncStorage.getItem('securityCode');
      const savedMsg = await AsyncStorage.getItem('displayMessage');
      if (savedCode) setSecurityCode(savedCode);
      if (savedMsg) setDisplayMessage(savedMsg);
    } catch (e) { console.log("Load Error", e); }
  };

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) { console.log("Save Error", e); }
  };

  // 3. Security Logic
  const handleUnlock = () => {
    if (enteredCode === securityCode) {
      setModalVisible(false);
      setEnteredCode('');
      setCurrentScreen(currentScreen === 'Clock' ? 'Message' : 'Clock');
    } else {
      alert("Incorrect Code");
      setEnteredCode('');
    }
  };

  // --- UI Components ---

  if (currentScreen === 'Clock') {
    return (
      <TouchableOpacity 
        style={styles.clockContainer} 
        activeOpacity={1} 
        onPress={() => setModalVisible(true)}
      >
        <StatusBar hidden />
        <Text style={styles.timeText}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
        </Text>
        <Text style={styles.dateText}>
          {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>

        {/* Security Modal */}
        <Modal visible={isModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter Security Code</Text>
              <TextInput
                style={styles.input}
                placeholder="****"
                secureTextEntry
                keyboardType="numeric"
                value={enteredCode}
                onChangeText={setEnteredCode}
              />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.button} onPress={handleUnlock}><Text style={{color: '#fff'}}>Unlock</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.button, {backgroundColor: '#555'}]} onPress={() => setModalVisible(false)}><Text style={{color: '#fff'}}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.messageContainer}>
      <StatusBar hidden />
      
      {/* Settings Gear Icon */}
      <TouchableOpacity style={styles.settingsIcon} onPress={() => setSettingsVisible(true)}>
        <Text style={{ fontSize: 30 }}>⚙️</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.messageText}
        value={displayMessage}
        multiline
        onChangeText={(val) => {
          setDisplayMessage(val);
          saveSettings('displayMessage', val);
        }}
      />

      <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('Clock')}>
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Back to Clock</Text>
      </TouchableOpacity>

      {/* Settings Modal (Change Code) */}
      <Modal visible={isSettingsVisible} transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Security Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter New Code"
              keyboardType="numeric"
              onChangeText={setNewCodeInput}
            />
            <TouchableOpacity style={styles.button} onPress={() => {
              setSecurityCode(newCodeInput);
              saveSettings('securityCode', newCodeInput);
              setSettingsVisible(false);
            }}>
              <Text style={{color: '#fff'}}>Save New Code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Clock Styles
  clockContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  timeText: { color: 'white', fontSize: 80, fontWeight: 'bold' },
  dateText: { color: '#888', fontSize: 20, marginTop: 10 },
  
  // Message Styles
  messageContainer: { flex: 1, backgroundColor: '#d32f2f', justifyContent: 'center', alignItems: 'center', padding: 20 },
  messageText: { color: 'white', fontSize: 60, fontWeight: 'bold', textAlign: 'center', width: '100%' },
  settingsIcon: { position: 'absolute', top: 40, right: 30 },
  backButton: { position: 'absolute', bottom: 40, padding: 15, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 18, marginBottom: 15, fontWeight: 'bold' },
  input: { borderBottomWidth: 1, width: '100%', marginBottom: 20, textAlign: 'center', fontSize: 24 },
  button: { backgroundColor: '#2196F3', padding: 12, borderRadius: 10, minWidth: 100, alignItems: 'center' }
});