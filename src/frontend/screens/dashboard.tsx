import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { analyzeImageThreatsLocally, initializeAIModules } from '../utils/aiEngine';

export default function Dashboard() {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanMetrics, setScanMetrics] = useState<{ status: string; label: string; score: number; explanation: string } | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<any>(null);

  const triggerFileSelection = () => {
    if (isScanning) return;
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanMetrics(null);
    setImagePreview(null);

    // Dynamic verification polling loop
    let retries = 0;
    let modelsReady = false;

    while (!modelsReady && retries < 30) {
      setLoadingStatus("Warming local neural networks (ViT Engine)...");
      const checkEngines = await initializeAIModules();
      if (checkEngines) {
        modelsReady = true;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
        retries++;
      }
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64ImageString = reader.result as string;
        setImagePreview(base64ImageString);

        setLoadingStatus("Processing pixel tokens & generating security analysis...");
        const results = await analyzeImageThreatsLocally(base64ImageString);

        if (!results) {
          setLoadingStatus("AI Engine initialization delay. Retrying...");
          setIsScanning(false);
          return;
        }

        setScanMetrics(results);
      } catch (error: any) {
        console.error("Local processing error:", error);
        setLoadingStatus("Engine memory processing delay. Retry.");
      } finally {
        setIsScanning(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <View style={styles.container}>
      {typeof window !== 'undefined' && (
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      )}

      <TouchableOpacity 
        style={styles.uploadBox} 
        onPress={triggerFileSelection} 
        disabled={isScanning}
      >
        {isScanning ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00ffcc" />
            <Text style={[styles.uploadText, { marginTop: 10, color: '#00ffcc' }]}>{loadingStatus}</Text>
          </View>
        ) : (
          <Text style={styles.uploadText}>Click to Upload and Scan Media Pixels</Text>
        )}
      </TouchableOpacity>

      {/* Side-by-Side Results & Preview Showcase Container */}
      {scanMetrics && imagePreview && (
        <View style={styles.resultsWorkspace}>
          
          {/* Left Block: The Scanned Image Preview Frame */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>SCANNED MEDIA SOURCE:</Text>
            <Image 
              source={{ uri: imagePreview }} 
              style={styles.previewImage} 
              resizeMode="contain" 
            />
          </View>

          {/* Right Block: The Local Vulnerability Dashboard Details */}
          <View style={styles.resultBanner}>
            <Text style={styles.resultTitle}>{scanMetrics.status}</Text>
            <Text style={styles.resultSub}>
              Detected Object Element: {scanMetrics.label} ({scanMetrics.score}%)
            </Text>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>LOCAL RISK BREAKDOWN:</Text>
              <Text style={styles.explanationText}>{scanMetrics.explanation}</Text>
            </View>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121824', 
    padding: 20, 
    justifyContent: 'center' 
  },
  uploadBox: { 
    borderWidth: 2, 
    borderColor: '#00ffcc', 
    borderStyle: 'dashed', 
    padding: 30, 
    borderRadius: 8, 
    alignItems: 'center',
    marginBottom: 20
  },
  uploadText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '500' 
  },
  resultsWorkspace: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 10,
    width: '100%',
    justifyContent: 'center'
  },
  previewContainer: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#1c2d42',
    borderRadius: 6,
    padding: 15,
    borderWidth: 1,
    borderColor: '#34495e',
    alignItems: 'center',
    justifyContent: 'center'
  },
  previewTitle: {
    color: '#ff9900',
    fontWeight: '700',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginBottom: 10
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 4,
    backgroundColor: '#0f141c'
  },
  resultBanner: { 
    flex: 1.5,
    minWidth: 350,
    padding: 15, 
    borderRadius: 6, 
    backgroundColor: '#1c2d42', 
    borderWidth: 1, 
    borderColor: '#00ffcc' 
  },
  resultTitle: { 
    color: '#00ffcc', 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  resultSub: { 
    color: '#fff', 
    marginTop: 4, 
    fontSize: 14 
  },
  explanationBox: { 
    marginTop: 12, 
    paddingTop: 10, 
    borderTopWidth: 1, 
    borderColor: '#34495e' 
  },
  explanationTitle: { 
    color: '#ff9900', 
    fontWeight: '700', 
    fontSize: 12, 
    marginBottom: 4 
  },
  explanationText: { 
    color: '#e0e0e0', 
    fontSize: 14, 
    lineHeight: 20 
  }
});