export const metadata = {
  title: "Disclaimer | Rate My BAU",
};

export default function DisclaimerPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", lineHeight: 1.7 }}>
      <h1>Disclaimer – Rate My BAU</h1>
      <p><strong>Last updated:</strong> 28/3/2026</p>

      <p>All content on Rate My BAU is provided for informational purposes only.</p>

      <ul>
        <li>Reviews represent the personal opinions of students.</li>
        <li>They do NOT reflect the views of Bahçeşehir University.</li>
        <li>They do NOT represent verified facts.</li>
      </ul>

      <p>We do not guarantee:</p>
      <ul>
        <li>Accuracy</li>
        <li>Completeness</li>
        <li>Reliability of any review</li>
      </ul>

      <p>Users should not rely solely on this platform when making academic decisions.</p>

      <p>Rate My BAU is an independent platform and is not affiliated with or endorsed by Bahçeşehir University.</p>

      <p>If any content is found to be inappropriate or inaccurate, we reserve the right to remove it.</p>
    </main>
  );
}