export const metadata = {
  title: "Community Guidelines | Rate My BAU",
};

export default function GuidelinesPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px", lineHeight: 1.7 }}>
      <h1>Community Guidelines – Rate My BAU</h1>
      <p><strong>Last updated:</strong> 28/3/2026</p>

      <p>To keep this platform useful and respectful, all users must follow these guidelines:</p>

      <h2>Allowed Content</h2>
      <ul>
        <li>Honest feedback about teaching quality</li>
        <li>Experiences with courses and grading</li>
        <li>Constructive criticism</li>
      </ul>

      <h2>Not Allowed</h2>
      <ul>
        <li>Personal attacks or insults</li>
        <li>Defamation or false accusations</li>
        <li>Hate speech or discrimination</li>
        <li>Sharing personal information about professors or students</li>
        <li>Spam or irrelevant content</li>
      </ul>

      <h2>Moderation</h2>
      <p>We reserve the right to:</p>
      <ul>
        <li>Remove any content that violates these guidelines</li>
        <li>Limit or block users abusing the platform</li>
      </ul>

      <h2>Goal</h2>
      <p>Our goal is to provide helpful, fair, and respectful insights for students.</p>
      <p>Keep it honest. Keep it respectful.</p>
    </main>
  );
}