import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Dashboard() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("Permission to access gallery is required for Kavach.ai to scan content!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      console.log("Image URI captured on frontend:", result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🛡️ KAVACH.AI</Text>
      <Text style={styles.tagline}>On-Device Content Threat Shield</Text>

      <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.innerCard}>
            <Text style={styles.uploadIcon}>📸</Text>
            <Text style={styles.uploadText}>Select Draft or Media to Scan</Text>
            <Text style={styles.subText}>Processes 100% Offline</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 24, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 28, fontWeight: '900', color: '#F8FAFC', letterSpacing: 1 },
  tagline: { fontSize: 13, color: '#6366F1', fontWeight: '600', textTransform: 'uppercase', marginBottom: 40, marginTop: 4 },
  uploadCard: { width: '100%', height: 280, backgroundColor: '#1E293B', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155', overflow: 'hidden' },
  innerCard: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  uploadIcon: { fontSize: 42, marginBottom: 12 },
  uploadText: { color: '#F8FAFC', fontSize: 16, fontWeight: '600' },
  subText: { color: '#64748b', fontSize: 12, marginTop: 4 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' }
});