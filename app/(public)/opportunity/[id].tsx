import React from "react";
import { View, Text, Pressable, Image, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOpportunity } from "../../../src/hooks/useOpportunity";

export default function OpportunityDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data, loading, error, refresh } = useOpportunity(id as string);

  if (error) {
    return (
      <View style={{ padding: 20, alignItems: "center" }}>
        <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
        <Pressable onPress={refresh} style={{ padding: 10, backgroundColor: "#ddd", borderRadius: 5 }}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (loading || !data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
        {data.title}
      </Text>

      {/* TRUST LAYER */}
      <View style={{ marginTop: 20 }}>
        <Text>Trust Score: {data.creator_trust_score}</Text>
        <Text>Visibility: {data.visibility_state}</Text>
      </View>

      {/* PROOF LAYER */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold" }}>Proof</Text>

        {data.media_thumbnails && data.media_thumbnails.length > 0 ? (
          data.media_thumbnails.map((img: string, i: number) => (
            <Image
              key={i}
              source={{ uri: img }}
              style={{ width: "100%", height: 200, marginTop: 10 }}
            />
          ))
        ) : (
          <Text>No proof available</Text>
        )}
      </View>

      {/* CONTEXT */}
      <View style={{ marginTop: 20 }}>
        <Text>Feed Score: {data.feed_score}</Text>
        <Text>Proof Count: {data.proof_count}</Text>
      </View>

      {/* ACTION */}
      <Pressable
        onPress={() => router.push(`/opportunity/${id}/action`)}
        style={{
          marginTop: 30,
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Accept Opportunity
        </Text>
      </Pressable>
    </ScrollView>
  );
}
