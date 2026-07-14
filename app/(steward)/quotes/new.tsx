import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSession } from '@/features/auth';
import { useCreateQuote } from '@/features/quote';
import { useUpdateLeadStatus } from '@/features/lead';

export default function NewQuoteScreen() {
  const { leadId, name, phone, service } = useLocalSearchParams<{
    leadId: string;
    name: string;
    phone: string;
    service: string;
  }>();
  const router = useRouter();
  const { selectedBusiness } = useSession();

  // ─── Form state (local UI state — not server state) ───────────────────────
  const [labour, setLabour] = useState('');
  const [materials, setMaterials] = useState('');
  const [travel, setTravel] = useState('');
  const [other, setOther] = useState('');
  const [addVat, setAddVat] = useState(false);

  // ─── Commands ─────────────────────────────────────────────────────────────
  const createQuote = useCreateQuote();
  const advanceLeadToQuoted = useUpdateLeadStatus();

  // ─── Derived totals ───────────────────────────────────────────────────────
  const parseNum = (val: string) => parseFloat(val) || 0;
  const subtotal = parseNum(labour) + parseNum(materials) + parseNum(travel) + parseNum(other);
  const vat = addVat ? subtotal * 0.15 : 0;
  const total = subtotal + vat;

  const isSubmitting = createQuote.isPending || advanceLeadToQuoted.isPending;

  // ─── Handler ──────────────────────────────────────────────────────────────
  const handleGenerateQuote = async () => {
    if (total <= 0) {
      Alert.alert('Invalid Quote', 'The total amount must be greater than zero.');
      return;
    }

    if (!selectedBusiness?.id) {
      Alert.alert('Error', 'No active business selected. Please select a business and try again.');
      return;
    }

    try {
      await createQuote.mutateAsync({
        business_owner_id: selectedBusiness.id,
        customer_request_id: leadId || undefined,
        customer_name: name || 'Unknown',
        customer_phone: phone || undefined,
        service_description: service || '',
        description: service || 'Service quote',
        subtotal: String(subtotal.toFixed(2)),
        vat: String(vat.toFixed(2)),
        amount: String(total.toFixed(2)),
        total: String(total.toFixed(2)),
        currency: 'ZAR',
        line_items: [
          ...(parseNum(labour) > 0   ? [{ description: 'Labour / Service Fee', total: parseNum(labour) }]   : []),
          ...(parseNum(materials) > 0 ? [{ description: 'Materials / Parts',    total: parseNum(materials) }] : []),
          ...(parseNum(travel) > 0    ? [{ description: 'Travel / Call-out Fee', total: parseNum(travel) }]  : []),
          ...(parseNum(other) > 0     ? [{ description: 'Other Expenses',        total: parseNum(other) }]   : []),
        ],
      });

      // Advance the originating lead status to "Quoted" if this quote came from a lead
      if (leadId) {
        await advanceLeadToQuoted.mutateAsync({ leadId, status: 'Quoted' });
      }

      Alert.alert(
        'Quote Created',
        `Quote saved for ${name || 'the customer'}.\nTotal: R ${total.toFixed(2)}`,
        [{ text: 'Back to Leads', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'Could not generate the quote at this time.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Estimator</Text>
        <Text style={styles.title}>Create Quote</Text>
        <Text style={styles.subtitle}>Draft a professional quote instantly.</Text>
      </View>

      <View style={styles.content}>
        {/* Lead Context Pre-fill */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <TextInput style={styles.inputReadOnly} value={name} editable={false} placeholder="Customer Name" />
          <TextInput style={styles.inputReadOnly} value={phone} editable={false} placeholder="Phone Number" />
          <TextInput style={styles.inputReadOnly} value={service} editable={false} placeholder="Service Needed" multiline />
        </View>

        {/* Calculator Inputs */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cost Breakdown (ZAR)</Text>

          <Text style={styles.label}>Labour / Service Fee</Text>
          <TextInput style={styles.input} value={labour} onChangeText={setLabour} keyboardType="numeric" placeholder="R 0.00" />

          <Text style={styles.label}>Materials / Parts</Text>
          <TextInput style={styles.input} value={materials} onChangeText={setMaterials} keyboardType="numeric" placeholder="R 0.00" />

          <Text style={styles.label}>Travel / Call-out Fee</Text>
          <TextInput style={styles.input} value={travel} onChangeText={setTravel} keyboardType="numeric" placeholder="R 0.00" />

          <Text style={styles.label}>Other Expenses</Text>
          <TextInput style={styles.input} value={other} onChangeText={setOther} keyboardType="numeric" placeholder="R 0.00" />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Include 15% VAT</Text>
            <Switch value={addVat} onValueChange={setAddVat} />
          </View>
        </View>

        {/* Live Receipt / Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Quote Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal</Text>
            <Text style={styles.summaryValue}>R {subtotal.toFixed(2)}</Text>
          </View>
          {addVat && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryText}>VAT (15%)</Text>
              <Text style={styles.summaryValue}>R {vat.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalValue}>R {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action */}
        <TouchableOpacity
          style={[styles.primaryButton, (isSubmitting || total <= 0) && styles.buttonDisabled]}
          onPress={handleGenerateQuote}
          disabled={isSubmitting || total <= 0}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Generate Quote</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 48, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  kicker: { fontSize: 14, fontWeight: '700', color: '#6B7280', marginBottom: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#6B7280' },
  content: { padding: 24, gap: 16, paddingBottom: 60 },
  card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 16, color: '#111827' },
  inputReadOnly: { backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 14, fontSize: 16, color: '#6B7280', marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  summaryCard: { backgroundColor: '#111827', padding: 24, borderRadius: 12, marginTop: 8 },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#9CA3AF', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryText: { fontSize: 16, color: '#D1D5DB' },
  summaryValue: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#374151', marginVertical: 12 },
  totalText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  totalValue: { fontSize: 24, fontWeight: '800', color: '#10B981' },
  primaryButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  buttonDisabled: { opacity: 0.6 },
});
