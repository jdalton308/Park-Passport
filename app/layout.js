import Providers from "@/components/Providers";
import "./globals.css";

export const metadata = {
  title: "Park Passport — Track Your National Parks",
  description:
    "Track every U.S. National Park you've visited and rank the ones still on your bucket list.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
