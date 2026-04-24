export const consentShortForm = {
  title: "Before we begin, a quick word on your data",
  intro:
    "NeuroCare is built to protect your privacy. Your health information is processed in line with HIPAA standards and is never shared without your explicit permission.",
  sections: [
    {
      heading: "What we collect",
      body: "What you enter (diaries, logs, medications), how you use the app, and audio from voice features.",
    },
    {
      heading: "What we never do",
      body: "Sell your data, share without permission, or use your health data to train AI models outside your care.",
    },
    {
      heading: "Sharing with your provider",
      body: "Sharing is off by default. To send your diary or reports to your doctor or caregiver, you explicitly turn on sharing from Settings — any transfer is encrypted and HIPAA-compliant, and you can revoke access at any time.",
    },
  ],
  footer:
    "You can review the full Core Patient Consent and Terms & Conditions anytime in Settings, and you can withdraw consent whenever you choose.",
};

// Extracted from hippa docs/NeuroDiscovery Patient App – Core Patient Consent - 2-9-26 - DRAFT.docx
export const consentFullForm = `NeuroDiscovery Patient App – Core Patient Consent

Last Updated: [Month Day, Year]

This Core Patient Consent ("Consent") explains how NeuroDiscovery AI, Inc. ("NeuroDiscovery," "we," "us," or "our") will collect, use, and process your information in order to provide the NeuroDiscovery patient-facing mobile application (the "App") and related services. Please read this Consent carefully.

By selecting "I Consent" (or an equivalent action), you acknowledge that you have read and understood this Consent and that you voluntarily authorize NeuroDiscovery to process your information as described below and in the Privacy Policy.

1. Purpose of This Consent
This Consent is required to use the App because the App's core features depend on processing information that you choose to provide and information generated through your use of the App. This Consent is intended to provide clear, informed permission for NeuroDiscovery to process your information for engagement, organizational, and informational purposes, including features that involve automated processing and digital avatar interactions.

2. Information Covered by This Consent
Depending on how you use the App and which features you enable, this Consent covers NeuroDiscovery's processing of the following categories of information:
• Information you enter directly (diaries, questionnaires, logs, notes, medication and appointment information)
• Audio content, including audio notes and avatar-based conversations
• App usage and technical information (device info, interactions, diagnostic data)
• Onboarding identifiers used to activate and link your App account to a clinic or partner workflow

Separate authorization applies if you choose to connect your electronic health record (EHR) data or enable optional features that require additional consent.

3. Audio Processing and Digital Avatar Interactions
If you use features that allow you to submit audio notes or interact with a digital avatar, you authorize NeuroDiscovery to collect, store, and process your audio content to provide those features. You understand that:
• Avatar- or AI-generated outputs may be inaccurate, incomplete, or inappropriate for your circumstances
• The App does not provide medical advice, diagnosis, or treatment
• The App is not intended for emergency use
• You are responsible for how you use information provided through the App

NeuroDiscovery does not use your identifiable health information or audio content to train general-purpose AI models for use outside of providing the App's services to you.

4. How Your Information Is Used
You authorize NeuroDiscovery to use your information to:
• Provide, operate, and personalize the App and its features
• Support engagement tools, summaries, reminders, and avatar-based interactions
• Maintain, secure, and improve the App
• Prevent fraud, misuse, and unauthorized access
• Comply with applicable law
• Carry out internal analytics and performance measurement

5. Sharing and Disclosures
• Sharing is off by default — you must affirmatively enable any sharing features
• Disclosures to service providers are under contractual confidentiality and security obligations
• NeuroDiscovery may disclose information where required by law or to protect rights, safety, and security

6. Voluntary Participation and Withdrawal of Consent
Your participation is voluntary. You may withdraw this Consent at any time through the App settings or by contacting support. Withdrawal does not affect processing that occurred before withdrawal or processing permitted/required by law.

7. Data Retention
NeuroDiscovery may retain information as long as reasonably necessary to provide the App, comply with legal obligations, resolve disputes, and support safety, security, and audit needs.

8. Acknowledgment and Authorization
By selecting "I Consent", you confirm that:
• You have read and understood this Consent
• You have had the opportunity to review the Privacy Policy and Terms & Conditions
• You voluntarily authorize NeuroDiscovery to process your information as described
• You understand that you may withdraw consent at any time`;

export const termsShortForm = `By using NeuroCare, you agree to our Terms & Conditions. The app is provided for engagement and informational purposes — not medical advice, diagnosis, or treatment. Not for emergencies; call 911 for urgent situations. AI and avatar outputs may be inaccurate. Verify important information with a qualified healthcare professional.`;
