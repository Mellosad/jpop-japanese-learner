import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { VocabularyProvider } from '@/contexts/VocabularyContext';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata = {
  title: "J-Pop으로 일본어 배우기",
  description: "좋아하는 J-Pop으로 즐겁게 일본어를 공부하세요",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <VocabularyProvider>
          {children}
        </VocabularyProvider>
      </body>
    </html>
  );
}
