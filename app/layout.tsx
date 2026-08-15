import type {Metadata} from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import Image from 'next/image';
import logo from './logo.png';
import StarField from '@/components/StarField';

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GitDeep — AI GitHub Profile Assessor',
  description: 'Brutal, honest AI analysis of any developer\'s GitHub profile.',
  icons: {
    icon: '/icon.svg',
  },
};

export const viewport = {
  themeColor: '#050505',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`} style={{ colorScheme: 'dark' }} suppressHydrationWarning>
      <body className="font-display bg-[#050505] text-[#C9D1D9] min-h-[100dvh] flex flex-col antialiased">
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <StarField />
        </div>
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#58A6FF]/[0.02] blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#8957E5]/[0.015] blur-[120px]" />
          <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] rounded-full bg-[#1F6FEB]/[0.02] blur-[100px]" />
        </div>
        <StoreProvider>
          {children}
        </StoreProvider>
        <footer className="relative z-10 border-t border-white/[0.06] bg-[#0A0A0F]/80 backdrop-blur-xl py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-white/40 mb-2">Built with ❤️ by <a href="https://github.com/Yuvraj-Sarathe" target="_blank" rel="noopener noreferrer" className="text-[#58A6FF] hover:underline font-medium">Yuvraj Sarathe</a></p>
            <div className="flex items-center justify-center gap-4 text-[10px] text-white/30">
              <a href="https://github.com/Yuvraj-Sarathe" target="_blank" rel="noopener noreferrer" className="hover:text-[#58A6FF] transition-colors">GitHub</a>
              <span>•</span>
              <a href="https://yuvraj-sarathe.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" className="hover:text-[#58A6FF] transition-colors">Portfolio</a>
              <span>•</span>
              <a href="https://www.linkedin.com/in/yuvraj-sarathe" target="_blank" rel="noopener noreferrer" className="hover:text-[#58A6FF] transition-colors">LinkedIn</a>
              <span>•</span>
              <a href="https://leetcode.com/u/Yuvraj_Sarathe/" target="_blank" rel="noopener noreferrer" className="hover:text-[#58A6FF] transition-colors">LeetCode</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
