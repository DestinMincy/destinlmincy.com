import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { TemplateBlock, TemplateSnapshot } from "@/lib/contracts/types";

// Built-in PDF fonts don't need registration; this comment keeps the Font import
// available for custom fonts if added later.

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 70,
    color: "#1a1a1a",
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 36,
    borderBottomWidth: 2,
    borderBottomColor: "#2675e9",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#2675e9",
    marginBottom: 4,
  },
  heading: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
    color: "#111827",
  },
  paragraph: {
    marginBottom: 10,
  },
  clause: {
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#e5e7eb",
    paddingLeft: 12,
  },
  variable: {
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
  },
  signatureBlock: {
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#d1d5db",
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
    marginTop: 40,
    marginBottom: 6,
    width: 240,
  },
  signatureLabel: {
    fontSize: 9,
    color: "#6b7280",
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  metaFooter: {
    position: "absolute",
    bottom: 30,
    left: 70,
    right: 70,
    fontSize: 8,
    color: "#9ca3af",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

interface ContractPdfProps {
  templateName: string;
  snapshot: TemplateSnapshot;
  fieldValues: Record<string, string>;
  signerEmail: string;
  generatedAt: string;
}

function renderBlock(
  block: TemplateBlock,
  fieldValues: Record<string, string>,
  index: number,
) {
  const resolveVariables = (text: string) => {
    return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      return fieldValues[key] ?? `[${key}]`;
    });
  };

  switch (block.type) {
    case "heading":
      return (
        <Text key={block.id ?? index} style={styles.heading}>
          {resolveVariables(block.content)}
        </Text>
      );
    case "paragraph":
      return (
        <Text key={block.id ?? index} style={styles.paragraph}>
          {resolveVariables(block.content)}
        </Text>
      );
    case "clause":
      return (
        <View key={block.id ?? index} style={styles.clause}>
          <Text style={styles.paragraph}>
            {resolveVariables(block.content)}
          </Text>
        </View>
      );
    case "variable": {
      const value = fieldValues[block.content] ?? `[${block.content}]`;
      return (
        <Text key={block.id ?? index} style={styles.variable}>
          {value}
        </Text>
      );
    }
    case "signature":
      return (
        <View key={block.id ?? index} style={styles.signatureBlock}>
          <Text style={{ fontSize: 9, color: "#6b7280", marginBottom: 16 }}>
            {block.content || "Signature"}
          </Text>
          <View style={styles.signatureRow}>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client signature</Text>
            </View>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
          <View style={[styles.signatureRow, { marginTop: 24 }]}>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Admin signature</Text>
            </View>
            <View>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Date</Text>
            </View>
          </View>
        </View>
      );
    default:
      return null;
  }
}

export function ContractPdf({
  templateName,
  snapshot,
  fieldValues,
  signerEmail,
  generatedAt,
}: ContractPdfProps) {
  return (
    <Document
      title={templateName}
      author="ELATUM"
      subject={`Contract for ${signerEmail}`}
    >
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Contract</Text>
          <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold" }}>
            {templateName}
          </Text>
        </View>

        {snapshot.blocks.map((block, i) =>
          renderBlock(block, fieldValues, i),
        )}

        <View
          style={styles.metaFooter}
          fixed
        >
          <Text>Generated {generatedAt}</Text>
          <Text
            render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
