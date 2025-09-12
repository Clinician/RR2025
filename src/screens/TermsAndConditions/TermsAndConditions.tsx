import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface TermsAndConditionsProps {
  onAccept?: () => void;
  onBack?: () => void;
  showAcceptButton?: boolean;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onAccept, onBack, showAcceptButton = true }) => {
  const BackIcon = () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M15 18L9 12L15 6"
        stroke="#4A90E2"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <BackIcon />
            <Text style={styles.backButtonText}>Privacy</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.title]}>Terms And Conditions</Text>
        {onBack && <View style={styles.headerSpacer} />}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.content}>
          The website located at www.riva.digital is a copyrighted work belonging to Riva Digital. Certain features of the Site may be subject to additional guidelines, terms, or rules, which will be posted on the Site in connection with such features. All such additional terms, guidelines, and rules are incorporated by reference into these Terms.
        </Text>

        <Text style={styles.content}>
          These Terms of Use describe the legally binding terms and conditions that govern your use of the Site. BY LOGGING INTO THE SITE, YOU ARE BEING COMPLIANT THAT THESE TERMS ARE ACCEPTABLE TO YOU. If you do not have the capacity to enter into these Terms, You SHOULD BE AT LEAST 18 YEARS OF AGE TO ACCESS THE SITE. IF YOU DISAGREE WITH ALL OR THE PROVISION OF THESE TERMS, DO NOT LOG INTO OR ENGAGE THE SITE.
        </Text>

        <Text style={styles.content}>
          These terms require the use of arbitration Section 10.2 on an individual basis to resolve disputes and also limit the remedies available to you in the event of a dispute.
        </Text>

        <Text style={styles.sectionTitle}>Access to the Site</Text>
        <Text style={styles.content}>
          Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited license to access and use the Site solely for your own personal, non-commercial use.
        </Text>

        <Text style={styles.sectionTitle}>Certain Restrictions</Text>
        <Text style={styles.content}>
          The rights approved to you in these Terms are subject to the following restrictions: (a) you shall not sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site; (b) you shall not change, make derivative works of, disassemble, reverse compile or reverse engineer any part of the Site; (c) you shall not access the Site in order to build a similar or competitive website; and (d) except as expressly stated herein, no part of the Site may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means unless otherwise indicated, any future release, update, or other addition to functionality of the Site shall be subject to these Terms. All copyright and other proprietary notices on the Site must be retained on all copies thereof.
        </Text>

        <Text style={styles.content}>
          Company reserves the right to change, suspend, or cease the Site with or without notice to you. You approved that Company will not be held liable to you or any third party for any change, interruption, or termination of the Site or any part.
        </Text>
        {showAcceptButton && onAccept && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By tapping "Agree", I agree the terms and conditions
            </Text>
          </View>
        )}
      </ScrollView>

      {showAcceptButton && onAccept && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButtonText: {
    fontSize: 17,
    color: '#4A90E2',
    marginLeft: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 100,
  },
  content: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'justify',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  acceptButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default TermsAndConditions;
