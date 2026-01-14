import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { FileText } from 'lucide-react-native';
import { Invoice } from '../types';
import { Router } from 'expo-router';
import {
  sharedStyles,
  financeStyles,
  overviewStyles,
} from '../styles';

interface FinanceSectionProps {
  invoices: Invoice[];
  formatCurrency: (amount: number) => string;
  router: Router;
}

export default function FinanceSection({
  invoices,
  formatCurrency,
  router,
}: FinanceSectionProps) {
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <View style={sharedStyles.section}>
      <View style={sharedStyles.sectionHeader}>
        <Text style={sharedStyles.sectionTitle}>Finance</Text>
        <Text style={sharedStyles.sectionSubtitle}>
          {invoices.length} invoice(s) • {formatCurrency(totalAmount)} total
        </Text>
      </View>
      
      {invoices.length > 0 ? (
        <>
          {/* Summary Stats */}
          <View style={overviewStyles.statsGrid}>
            <View style={[overviewStyles.statCard, { backgroundColor: '#10b981' }]}>
              <Text style={overviewStyles.statNumber}>
                {formatCurrency(paidAmount)}
              </Text>
              <Text style={overviewStyles.statLabel}>Paid</Text>
            </View>
            <View style={[overviewStyles.statCard, { backgroundColor: '#f59e0b' }]}>
              <Text style={overviewStyles.statNumber}>
                {formatCurrency(pendingAmount)}
              </Text>
              <Text style={overviewStyles.statLabel}>Pending</Text>
            </View>
            <View style={[overviewStyles.statCard, { backgroundColor: '#ef4444' }]}>
              <Text style={overviewStyles.statNumber}>
                {formatCurrency(overdueAmount)}
              </Text>
              <Text style={overviewStyles.statLabel}>Overdue</Text>
            </View>
          </View>

          {/* Invoices List */}
          {invoices.map((invoice) => (
            <Pressable 
              key={invoice.id} 
              style={financeStyles.invoiceCard}
              onPress={() => router.push(`/invoices/${invoice.id}`)}
            >
              <View style={financeStyles.invoiceHeader}>
                <Text style={financeStyles.invoiceTitle}>{invoice.title}</Text>
                <View style={[
                  financeStyles.invoiceStatusBadge,
                  { backgroundColor: 
                    invoice.status === 'paid' ? '#d1fae5' :
                    invoice.status === 'pending' ? '#fef3c7' :
                    '#fee2e2'
                  }
                ]}>
                  <Text style={[
                    financeStyles.invoiceStatusText,
                    { color: 
                      invoice.status === 'paid' ? '#065f46' :
                      invoice.status === 'pending' ? '#92400e' :
                      '#991b1b'
                    }
                  ]}>
                    {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={financeStyles.invoiceDate}>
                {new Date(invoice.created_at).toLocaleDateString()}
              </Text>
              <Text style={financeStyles.invoiceAmount}>
                {formatCurrency(invoice.total_amount || 0)}
              </Text>
              {invoice.creches?.name && (
                <Text style={financeStyles.invoiceCreche}>
                  {invoice.creches.name}
                </Text>
              )}
            </Pressable>
          ))}
        </>
      ) : (
        <View style={sharedStyles.emptyState}>
          <FileText size={48} color="#d1d5db" />
          <Text style={sharedStyles.emptyText}>No invoices found</Text>
        </View>
      )}
    </View>
  );
}