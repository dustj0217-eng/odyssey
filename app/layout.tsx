import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata:Metadata={
  title:'21세기 오디세이 — 항해 일지',
  description:'모바일 텍스트 게임: 인디게임 개발사의 항해 기록'
};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#171f2b'};
export default function RootLayout({children}:{children:ReactNode}){
  return <html lang="ko"><body>{children}</body></html>;
}
