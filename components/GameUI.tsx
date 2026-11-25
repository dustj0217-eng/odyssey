import type { ReactNode } from 'react';

export type IconName = 'book'|'calendar'|'person'|'heart'|'stress'|'wallet'|'team'|'sun'|'moon'|'code'|'art'|'plan'|'rest'|'study'|'work'|'arrow'|'check'|'star'|'bug';
const paths: Record<IconName, ReactNode> = {
  book: <><path d="M12 5v15M3 4h5a4 4 0 0 1 4 3 4 4 0 0 1 4-3h5v15h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/><path d="M6 9h3m-3 4h3m6-4h3m-3 4h3"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M7 3v4m10-4v4M3 10h18m-13 4h1m6 0h1m-8 3h1m6 0h1"/></>,
  person: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3z"/></>,
  heart: <path d="M12 21 3.8 12.8A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 8.2 6.8z"/>,
  stress: <><path d="M10 4a4 4 0 0 0-6 4 4 4 0 0 0-1 7 5 5 0 0 0 7 5m4-16a4 4 0 0 1 6 4 4 4 0 0 1 1 7 5 5 0 0 1-7 5M12 3v18M7 9l2 2m8-2-2 2M6 16h3m6 0h3"/></>,
  wallet: <><path d="M3 6 17 3v4M3 7h18v14H3z"/><path d="M21 12h-7v5h7m-4-2.5h.1"/></>,
  team: <><circle cx="9" cy="7" r="3"/><path d="M2 20v-3a7 7 0 0 1 14 0v3zM16 4a3 3 0 0 1 0 6m3 3a5 5 0 0 1 3 5v2h-3"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/></>,
  moon: <path d="M21 14A9 9 0 0 1 10 3a9 9 0 1 0 11 11z"/>,
  code: <><rect x="2" y="4" width="20" height="14" rx="1"/><path d="m8 8-3 3 3 3m8-6 3 3-3 3m-3-7-2 8m1 3v3m-5 0h10"/></>,
  art: <><path d="m14 5 5-3 3 3-3 5-8 8-5 1 1-5zM14 5l5 5M3 21h18"/></>,
  plan: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8m-8 4h8m-8 4h5"/></>,
  rest: <><path d="M3 6v15m18-7v7M3 17h18M3 10h6v7m0-5h9a3 3 0 0 1 3 3v2"/></>,
  study: <><path d="m2 8 10-5 10 5-10 5zM6 10v7l6 4 6-4v-7m4-2v9"/></>,
  work: <><rect x="3" y="7" width="18" height="14" rx="1"/><path d="M8 7V3h8v4M3 13h18m-11-2h4v4h-4z"/></>,
  arrow: <path d="m9 5 7 7-7 7"/>,
  check: <path d="m4 12 5 5L20 6"/>,
  star: <path d="m12 2 3 7 7 .5-5.5 5 2 7.5-6.5-4-6.5 4 2-7.5L2 9.5 9 9z"/>,
  bug: <><rect x="7" y="7" width="10" height="14" rx="5"/><path d="M9 7 6 3m9 4 3-4M3 9l4 2m-4 6h4m-3 5 4-4m13-9-4 2m4 6h-4m3 5-4-4M12 7v14"/></>,
};
export function Icon({name,className=''}:{name:IconName;className?:string}) {
  return <svg className={`game-icon ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}
export function actionIcon(id:string):IconName {
  if(id==='develop')return 'code'; if(id==='study')return 'study'; if(id==='rest')return 'rest';
  if(id==='job'||id==='freelance'||id==='outsource')return 'work';
  if(id==='social')return 'team'; return 'plan';
}
