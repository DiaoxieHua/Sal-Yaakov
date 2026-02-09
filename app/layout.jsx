import './globals.css';

export const metadata = {
  title: 'iPhone 18 Pro | 宣傳網站',
  description: 'iPhone 18 Pro 宣傳網站，呈現設計、效能與影像的全新突破。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        {children}
      </body>
    </html>
  );
}
