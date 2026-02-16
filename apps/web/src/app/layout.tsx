import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parcel Link Finder",
  description: "Find the official property-search link for any US address."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
