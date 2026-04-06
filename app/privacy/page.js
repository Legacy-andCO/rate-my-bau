export const metadata = {
  title: "Privacy Policy | BauPOS",
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", lineHeight: 1.7 }}>
      <h1>Privacy Policy – BauPOS</h1>
      <p><strong>Last updated:</strong> April 6, 2026</p>

      <p>
        BauPOS (&quot;we&quot;, &quot;our&quot;, &quot;the platform&quot;) respects your privacy. This policy explains how data is used inside the POS and reporting system.
      </p>

      <h2>1. Operational Data</h2>
      <p>We store business data required for restaurant operations, including orders, payments, attendance logs, inventory records, and audit trails.</p>

      <h2>2. Authentication Data</h2>
      <p>Authentication is managed through Supabase Auth. Access to sensitive operations is role-based and permission-controlled.</p>

      <h2>3. Security</h2>
      <p>We use standard safeguards, but no software system can guarantee absolute security in every scenario.</p>

      <h2>4. Changes</h2>
      <p>Policy updates may occur as the platform evolves.</p>

      <h2>5. Contact</h2>
      <p>For questions, contact: support@baupos.local</p>
    </main>
  );
}
