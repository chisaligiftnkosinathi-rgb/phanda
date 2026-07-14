import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { useLedgerStore, Observation } from '@/state/useLedgerStore';
import { useSession } from '@/features/auth';
import { Ionicons } from '@expo/vector-icons';

/**
 * Capture Companion
 *
 * Responsibility: capture observations (text, photo, voice, GPS, attachments).
 * This is NOT the home screen â€” the Steward Dashboard is.
 * Companion is a focused capture tool reachable from the dashboard.
 *
 * Timeline doctrine:
 *   - getVisibleStream() drives the display (pinned first, then visible)
 *   - Hidden observations are excluded from view only â€” ledger is unchanged
 *   - getReplayStream() always returns the full immutable ledger
 */
export default function CaptureCompanion() {
  const [inputText, setInputText] = useState('');
  const [selectedObs, setSelectedObs] = useState<Observation | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  const { identity: user } = useSession();
  const stewardName = user?.displayName?.split(' ')[0] ?? user?.email?.split('@')[0] ?? null;

  const appendObservation = useLedgerStore((s) => s.appendObservation);
  const hideObservation   = useLedgerStore((s) => s.hideObservation);
  const unhideObservation = useLedgerStore((s) => s.unhideObservation);
  const pinObservation    = useLedgerStore((s) => s.pinObservation);
  const unpinObservation  = useLedgerStore((s) => s.unpinObservation);
  const getVisibleStream  = useLedgerStore((s) => s.getVisibleStream);
  const getReplayStream   = useLedgerStore((s) => s.getReplayStream);

  const visibleObs = getVisibleStream();
  const allObs     = getReplayStream();
  const hiddenCount = allObs.filter((o) => o.displayState === 'hidden').length;
  const hiddenObs   = allObs.filter((o) => o.displayState === 'hidden');

  const displayObs = showHidden ? hiddenObs : visibleObs;

  const handleCapture = () => {
    if (!inputText.trim()) return;
    appendObservation({ type: 'text', content: inputText.trim() });
    setInputText('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const time = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return stewardName ? `${time}, ${stewardName}.` : `${time}.`;
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderObservation = (obs: Observation) => {
    const isPinned = obs.displayState === 'pinned';
    return (
      <TouchableOpacity
        key={obs.id}
        style={[styles.observationCard, isPinned && styles.pinnedCard]}
        onLongPress={() => setSelectedObs(obs)}
        delayLongPress={400}
        activeOpacity={0.8}
      >
        <View style={styles.observationHeader}>
          <View style={styles.observationMeta}>
            {isPinned && (
              <View style={styles.pinnedBadge}>
                <Ionicons name="pin" size={11} color="#FFFFFF" />
                <Text style={styles.pinnedBadgeText}>Pinned</Text>
              </View>
            )}
            <Text style={styles.timestamp}>{formatTime(obs.timestamp)}</Text>
          </View>
          {obs.type === 'photo'    && <Ionicons name="camera"    size={16} color="#9CA3AF" />}
          {obs.type === 'voice'    && <Ionicons name="mic"       size={16} color="#9CA3AF" />}
          {obs.type === 'location' && <Ionicons name="location"  size={16} color="#9CA3AF" />}
        </View>
        <Text style={styles.content}>{obs.content}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.timeline} contentContainerStyle={styles.timelineContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{getGreeting()}</Text>
            <Text style={styles.headerSubtitle}>What happened?</Text>
          </View>

          {/* Capture input */}
          <View style={styles.captureArea}>
            <TextInput
              style={styles.input}
              placeholder="Observation..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <View style={styles.actions}>
              <View style={styles.iconGroup}>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="camera-outline"   size={22} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="mic-outline"      size={22} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="location-outline" size={22} color="#6B7280" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconBtn}>
                  <Ionicons name="attach-outline"   size={22} color="#6B7280" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.captureBtn, !inputText.trim() && styles.captureBtnDisabled]}
                onPress={handleCapture}
                disabled={!inputText.trim()}
              >
                <Text style={styles.captureBtnText}>Capture</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Timeline header + hidden toggle */}
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionHeader}>
              {showHidden ? `Hidden (${hiddenCount})` : 'Timeline'}
            </Text>
            {hiddenCount > 0 && (
              <TouchableOpacity onPress={() => setShowHidden((v) => !v)}>
                <Text style={styles.toggleHidden}>
                  {showHidden ? 'Show timeline' : `${hiddenCount} hidden`}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Observations */}
          <View style={styles.feed}>
            {displayObs.map(renderObservation)}
            {displayObs.length === 0 && !showHidden && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Nothing captured yet.</Text>
                <Text style={styles.emptySubtext}>Your timeline awaits reality.</Text>
              </View>
            )}
            {displayObs.length === 0 && showHidden && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No hidden observations.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Observation action sheet */}
      <Modal
        visible={selectedObs !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedObs(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedObs(null)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {selectedObs && (
                  <>
                    <Text style={styles.sheetPreview} numberOfLines={2}>
                      {selectedObs.content}
                    </Text>

                    {/* Pin / Unpin */}
                    {selectedObs.displayState === 'pinned' ? (
                      <Pressable
                        style={styles.sheetAction}
                        onPress={() => {
                          unpinObservation(selectedObs.id);
                          setSelectedObs(null);
                        }}
                      >
                        <Ionicons name="pin-outline" size={20} color="#374151" />
                        <Text style={styles.sheetActionText}>Unpin</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.sheetAction}
                        onPress={() => {
                          pinObservation(selectedObs.id);
                          setSelectedObs(null);
                        }}
                      >
                        <Ionicons name="pin" size={20} color="#374151" />
                        <Text style={styles.sheetActionText}>Pin to top</Text>
                      </Pressable>
                    )}

                    {/* Hide from Dashboard / Unhide */}
                    {selectedObs.displayState === 'hidden' ? (
                      <Pressable
                        style={styles.sheetAction}
                        onPress={() => {
                          unhideObservation(selectedObs.id);
                          setSelectedObs(null);
                        }}
                      >
                        <Ionicons name="eye-outline" size={20} color="#374151" />
                        <Text style={styles.sheetActionText}>Restore to dashboard</Text>
                      </Pressable>
                    ) : (
                      <Pressable
                        style={styles.sheetAction}
                        onPress={() => {
                          hideObservation(selectedObs.id);
                          setSelectedObs(null);
                        }}
                      >
                        <Ionicons name="eye-off-outline" size={20} color="#374151" />
                        <Text style={styles.sheetActionText}>Hide from Dashboard</Text>
                      </Pressable>
                    )}

                    <Pressable
                      style={[styles.sheetAction, styles.sheetCancel]}
                      onPress={() => setSelectedObs(null)}
                    >
                      <Text style={styles.sheetCancelText}>Cancel</Text>
                    </Pressable>

                    <Text style={styles.sheetDoctrine}>
                      This observation remains in your permanent ledger and replay.
                    </Text>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:          { flex: 1, backgroundColor: '#F9FAFB' },
  container:         { flex: 1 },
  timeline:          { flex: 1 },
  timelineContent:   { padding: 24, paddingBottom: 64 },

  header:            { marginBottom: 24 },
  headerTitle:       { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 12, letterSpacing: -0.5 },
  headerSubtitle:    { fontSize: 20, fontWeight: '600', color: '#4B5563', marginTop: 4 },

  captureArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 40,
  },
  input: {
    fontSize: 18,
    color: '#111827',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  iconGroup:          { flexDirection: 'row', gap: 8 },
  iconBtn:            { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
  captureBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  captureBtnDisabled: { opacity: 0.3 },
  captureBtnText:     { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  toggleHidden: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textDecorationLine: 'underline',
  },

  feed:              { gap: 12 },
  observationCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#111827',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pinnedCard: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  observationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  observationMeta:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pinnedBadgeText:   { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  timestamp:         { fontSize: 13, color: '#9CA3AF', fontWeight: '600' },
  content:           { fontSize: 17, color: '#1F2937', lineHeight: 26 },

  emptyState:        { alignItems: 'center', paddingVertical: 40 },
  emptyText:         { fontSize: 18, color: '#6B7280', fontWeight: '600' },
  emptySubtext:      { fontSize: 15, color: '#9CA3AF', marginTop: 4 },

  // Action sheet modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  sheetPreview: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetActionText:   { fontSize: 16, color: '#111827', fontWeight: '600' },
  sheetCancel: {
    justifyContent: 'center',
    marginTop: 8,
    borderBottomWidth: 0,
  },
  sheetCancelText:   { fontSize: 16, color: '#9CA3AF', fontWeight: '600', textAlign: 'center' },
  sheetDoctrine: {
    fontSize: 11,
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});
