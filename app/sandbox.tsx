import React, { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePhandaStore, engine } from "../src/ui/store/usePhandaStore";

export default function RealitySandbox() {
  const { timeline, initialize, isLoading } = usePhandaStore();

  useEffect(() => {
    initialize();
  }, []);

  const handleCapture = async () => {
    // Request permission and launch camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // We pass the raw sensor data through the pure Facade
      await engine.captureFromSensor({
        type: "photo",
        tempUri: asset.uri,
        timestamp: new Date().toISOString(),
        mimeType: asset.mimeType || "image/jpeg"
      }, "Captured from physical reality");
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>{new Date(item.occurredAt).toLocaleString()}</Text>
        <Text style={[styles.badge, item.confidence.overall === 'VERIFIED' ? styles.badgeVerified : styles.badgePartial]}>
          {item.confidence.overall}
        </Text>
      </View>
      <Text style={styles.recordContent}>{item.content}</Text>
      
      {/* If evidence is present, we show the URI */}
      {item.media.length > 0 && item.media[0].isMissing === false && (
        <View style={styles.mediaContainer}>
          <Text style={styles.mediaUri} numberOfLines={1} ellipsizeMode="middle">
            {item.media[0].uri}
          </Text>
          <Text style={styles.mediaConfidence}>Media: {item.confidence.media}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reality Sandbox</Text>
        <Text style={styles.subtitle}>Phase II.1 — First Verified Observation</Text>
      </View>

      <TouchableOpacity style={styles.captureBtn} onPress={handleCapture}>
        <Text style={styles.captureBtnText}>📷 Observe Reality</Text>
      </TouchableOpacity>

      <Text style={styles.timelineTitle}>Ledger Timeline</Text>
      
      <FlatList
        data={timeline}
        keyExtractor={(item) => item.observationId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No observations yet. Reality awaits.</Text>}
        refreshing={isLoading}
        onRefresh={initialize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  captureBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  captureBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  recordCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: "800",
    overflow: "hidden"
  },
  badgeVerified: {
    backgroundColor: "#D1FAE5",
    color: "#065F46",
  },
  badgePartial: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  recordContent: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
  },
  mediaContainer: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  mediaUri: {
    fontSize: 10,
    color: "#6B7280",
    fontFamily: "monospace",
  },
  mediaConfidence: {
    fontSize: 10,
    color: "#059669",
    fontWeight: "700",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    marginTop: 40,
  }
});
