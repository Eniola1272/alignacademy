/**
 * Certificate PDF template — rendered with @react-pdf/renderer.
 * Landscape A4, single page.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const NAVY = "#1a2744";
const GOLD = "#c9a84c";
const LIGHT = "#f8f6f0";

const styles = StyleSheet.create({
  page: {
    backgroundColor: LIGHT,
    paddingHorizontal: 48,
    paddingVertical: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  outerBorder: {
    borderWidth: 3,
    borderColor: NAVY,
    width: "100%",
    height: "100%",
    padding: 6,
  },
  innerBorder: {
    borderWidth: 1.5,
    borderColor: GOLD,
    width: "100%",
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    paddingVertical: 32,
  },
  logo: {
    fontSize: 10,
    letterSpacing: 3,
    color: GOLD,
    textTransform: "uppercase",
    marginBottom: 20,
  },
  dividerTop: {
    width: 60,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginBottom: 16,
    textAlign: "center",
  },
  subtext: {
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
    textAlign: "center",
  },
  name: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginTop: 4,
    marginBottom: 4,
    textAlign: "center",
  },
  course: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: NAVY,
    marginTop: 4,
    marginBottom: 20,
    textAlign: "center",
  },
  dividerBottom: {
    width: 60,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
    marginBottom: 20,
  },
  meta: {
    flexDirection: "row",
    gap: 40,
    marginTop: 8,
  },
  metaItem: {
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 8,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    color: NAVY,
    fontFamily: "Helvetica-Bold",
  },
});

interface CertificatePDFProps {
  recipientName: string;
  entityTitle: string;         // course or track title
  entityType: "course" | "track";
  issuedAt: string;            // formatted date string
  verificationCode: string;
}

export function CertificatePDF({
  recipientName,
  entityTitle,
  entityType,
  issuedAt,
  verificationCode,
}: CertificatePDFProps) {
  return (
    <Document
      title={`Certificate of Completion — ${entityTitle}`}
      author="Align Academy"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.outerBorder}>
          <View style={styles.innerBorder}>
            {/* Issuer */}
            <Text style={styles.logo}>Align Academy</Text>
            <View style={styles.dividerTop} />

            {/* Title */}
            <Text style={styles.heading}>Certificate of Completion</Text>

            {/* Recipient */}
            <Text style={styles.subtext}>This certifies that</Text>
            <Text style={styles.name}>{recipientName}</Text>
            <Text style={styles.subtext}>
              has successfully completed the {entityType}
            </Text>
            <Text style={styles.course}>{entityTitle}</Text>

            <View style={styles.dividerBottom} />

            {/* Footer metadata */}
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Issued on</Text>
                <Text style={styles.metaValue}>{issuedAt}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Verification code</Text>
                <Text style={styles.metaValue}>{verificationCode}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
