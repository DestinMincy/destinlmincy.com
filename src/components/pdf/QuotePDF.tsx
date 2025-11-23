import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottom: '2 solid #2776EA',
        paddingBottom: 10,
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2776EA',
        marginBottom: 5,
    },
    companyInfo: {
        fontSize: 10,
        color: '#666',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 20,
        color: '#333',
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#2776EA',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 5,
    },
    label: {
        width: '30%',
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        width: '70%',
        color: '#666',
    },
    table: {
        marginTop: 20,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2776EA',
        padding: 8,
        color: '#fff',
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottom: '1 solid #ddd',
        padding: 8,
    },
    col1: {
        width: '40%',
    },
    col2: {
        width: '30%',
        textAlign: 'right',
    },
    col3: {
        width: '30%',
        textAlign: 'right',
    },
    totalSection: {
        marginTop: 20,
        paddingTop: 10,
        borderTop: '2 solid #333',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 5,
    },
    totalLabel: {
        width: '20%',
        fontWeight: 'bold',
        textAlign: 'right',
        marginRight: 10,
    },
    totalValue: {
        width: '15%',
        textAlign: 'right',
        fontWeight: 'bold',
        fontSize: 14,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        color: '#999',
        fontSize: 9,
        borderTop: '1 solid #ddd',
        paddingTop: 10,
    },
    statusBadge: {
        padding: '5 10',
        backgroundColor: '#f0f0f0',
        borderRadius: 3,
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

interface QuoteItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface QuotePDFProps {
    quote: {
        id: string;
        quoteNumber: string;
        status: string;
        amount: string | number;
        description?: string;
        createdAt: string;
        expiresAt?: string;
        items?: QuoteItem[];
        customer?: {
            name: string;
            email: string;
        };
    };
}

const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
    const items: QuoteItem[] = quote.items || [
        {
            description: quote.description || 'Service',
            quantity: 1,
            rate: Number(quote.amount),
            amount: Number(quote.amount),
        },
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.companyName}>Destin L. Mincy</Text>
                    <Text style={styles.companyInfo}>Web Developer &amp; AI Engineer</Text>
                    <Text style={styles.companyInfo}>destinlmincy.com</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>QUOTE #{quote.quoteNumber}</Text>

                {/* Quote Info */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Text style={styles.label}>Status:</Text>
                        <Text style={[styles.value, styles.statusBadge]}>{quote.status}</Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Date:</Text>
                        <Text style={styles.value}>
                            {new Date(quote.createdAt).toLocaleDateString()}
                        </Text>
                    </View>
                    {quote.expiresAt && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Valid Until:</Text>
                            <Text style={styles.value}>
                                {new Date(quote.expiresAt).toLocaleDateString()}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bill To:</Text>
                    <Text style={styles.value}>{quote.customer?.name || 'Customer'}</Text>
                    <Text style={styles.value}>{quote.customer?.email}</Text>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.col1}>Description</Text>
                        <Text style={styles.col2}>Qty x Rate</Text>
                        <Text style={styles.col3}>Amount</Text>
                    </View>
                    {items.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.col1}>{item.description}</Text>
                            <Text style={styles.col2}>
                                {item.quantity} x ${item.rate.toFixed(2)}
                            </Text>
                            <Text style={styles.col3}>${item.amount.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View style={styles.totalSection}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalValue}>${Number(quote.amount).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Thank you for your business! • Questions? Contact: dlmincy@destinlmincy.com
                </Text>
            </Page>
        </Document>
    );
};

export default QuotePDF;
