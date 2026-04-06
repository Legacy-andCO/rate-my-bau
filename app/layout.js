import "./globals.css";

export const metadata = {
  title: "BauPOS | Restaurant Platform",
  description: "Production-oriented restaurant POS and operations platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
