export const metadata = {
  title: "Rate My BAU",
  description: "Anonymous professor reviews",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}