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
      {/* Branded header — matches your शील्ड logo */}
      <View style={styles.header}>
        <Text style={styles.shieldIcon}>🛡️</Text>
        <View>
          <Text style={styles.brandTitle}>
            कवच<Text style={styles.brandAccent}>.ai</Text>
          </Text>
          <Text style={styles.brandSubtitle}>Scan before you post</Text>
        </View>
      </View>

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
        style={[styles.uploadBox, isScanning && styles.uploadBoxScanning]}
        onPress={triggerFileSelection}
        disabled={isScanning}
      >
        {isScanning ? (
          <View style={{ alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={[styles.uploadText, { marginTop: 10, color: '#3B82F6' }]}>{loadingStatus}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.uploadIcon}>+</Text>
            <Text style={styles.uploadText}>Click to upload and scan an image</Text>
          </>
        )}
      </TouchableOpacity>

      {scanMetrics && imagePreview && (
        <View style={styles.resultsWorkspace}>
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>SCANNED IMAGE</Text>
            <Image
              source={{ uri: imagePreview }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          </View>

          <View style={[styles.resultBanner, scanMetrics.label && styles.resultBannerRisk]}>
            <Text style={styles.resultTitle}>{scanMetrics.status}</Text>
            <Text style={styles.resultSub}>
              Detected: <Text style={styles.resultSubBold}>{scanMetrics.label}</Text> ({scanMetrics.score}% confidence)
            </Text>

            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>RISK BREAKDOWN</Text>
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
    backgroundColor: '#0B1220',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  shieldIcon: { fontSize: 32 },
  brandTitle: { color: '#F8FAFC', fontSize: 24, fontWeight: '800', letterSpacing: 0.3 },
  brandAccent: { color: '#3B82F6' },
  brandSubtitle: { color: '#64748B', fontSize: 12, marginTop: 2 },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 36,
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#111827',
  },
  uploadBoxScanning: {
    borderColor: '#1E293B',
  },
  uploadIcon: { color: '#3B82F6', fontSize: 28, fontWeight: '300', marginBottom: 6 },
  uploadText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultsWorkspace: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 4,
    width: '100%',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    minWidth: 300,
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    backgroundColor: '#0B1220',
  },
  resultBanner: {
    flex: 1.5,
    minWidth: 350,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  resultBannerRisk: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  resultTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 17,
  },
  resultSub: {
    color: '#94A3B8',
    marginTop: 6,
    fontSize: 14,
  },
  resultSubBold: {
    color: '#E2E8F0',
    fontWeight: '700',
  },
  explanationBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#1F2937',
  },
  explanationTitle: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 1,
    marginBottom: 6,
  },
  explanationText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
});