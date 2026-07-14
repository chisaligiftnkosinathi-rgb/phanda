import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth, useSession } from "@/features/auth";

export default function Index() {
  const router = useRouter();
  const { identity, loading: isLoading, authenticated } = useSession();

  useEffect(() => {
    if (isLoading) return;
    if (identity) {
      // Authenticated stewards land on their dashboard — the operating system
      // of their business. From there they reach Capture, Timeline, Wallet, etc.
      router.replace("/(steward)/dashboard" as const);
    }
  }, [authenticated, isLoading, router]);

  if (isLoading || authenticated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a1a2e" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <Text style={styles.brandName}>iPhande</Text>
        <View style={styles.pillars}>
          <Text style={styles.pillarText}>Visibility.</Text>
          <Text style={styles.pillarText}>Opportunity.</Text>
          <Text style={styles.pillarText}>Continuity.</Text>
        </View>
      </View>

      {/* Identity CTAs */}
      <View style={styles.actions}>
        <TouchableOpacity
          id="btn-sign-in"
          style={styles.primaryBtn}
          onPress={() => router.push("/(auth)/auth/login" as const)}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Sign In</Text>
          <Text style={styles.primaryBtnArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          id="btn-create-account"
          style={styles.secondaryBtn}
          onPress={() => router.push("/(auth)/auth/register" as const)}
          activeOpacity={0.85}
        >
          <Text style={styles.secondaryBtnText}>Create Account</Text>
          <Text style={styles.secondaryBtnArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Guest access */}
      <View style={styles.guestSection}>
        <TouchableOpacity
          id="btn-guest"
          onPress={() => router.push("/(public)/work" as const)}
        >
          <Text style={styles.guestLink}>Continue as Guest</Text>
          <Text style={styles.guestSub}>View public business listings only</Text>
        </TouchableOpacity>
      </View>

      {/* Dev-only sandbox link */}
      {__DEV__ && (
        <TouchableOpacity
          id="btn-sandbox"
          style={styles.devLink}
          onPress={() => router.push("/sandbox" as const)}
        >
          <Text style={styles.devLinkText}>🧪 Dev Sandbox</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0d0d1a",
  },
  container: {
    flex: 1,
    backgroundColor: "#0d0d1a",
    paddingHorizontal: 32,
    justifyContent: "center",
    gap: 48,
  },

  // Brand
  brand: {
    alignItems: "flex-start",
  },
  brandName: {
    fontSize: 52,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -2,
    marginBottom: 16,
  },
  pillars: {
    gap: 4,
  },
  pillarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7c7c99",
    letterSpacing: 0.5,
  },

  // Primary CTAs
  actions: {
    gap: 14,
  },
  primaryBtn: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  primaryBtnText: {
    color: "#0d0d1a",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  primaryBtnArrow: {
    color: "#0d0d1a",
    fontSize: 20,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2a2a45",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  secondaryBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  secondaryBtnArrow: {
    color: "#7c7c99",
    fontSize: 20,
    fontWeight: "600",
  },

  // Guest
  guestSection: {
    alignItems: "center",
  },
  guestLink: {
    fontSize: 15,
    color: "#7c7c99",
    fontWeight: "700",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  guestSub: {
    fontSize: 12,
    color: "#4a4a5e",
    textAlign: "center",
    marginTop: 4,
    fontWeight: "500",
  },

  // Dev footer
  devLink: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1a2a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a4a2a",
  },
  devLinkText: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "600",
  },
});
