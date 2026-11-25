import { DATA } from './data';
import type { GameState, Role } from './types';

export function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
export function createGame(company='작은별 스튜디오',game='별을 건너는 밤',role: Role='programmer'): GameState {
  const title=game.trim().slice(0,28)||'별을 건너는 밤';
  return {
    version:3, company:company.trim().slice(0,28)||'작은별 스튜디오', game:title, role,
    year:1, month:3, week:0, phase:'voyage', schedule:clone(DATA.DEFAULT_SCHEDULE),
    player:{health:88,stress:16,skill:role==='programmer'?55:role==='artist'?36:43,
      art:role==='artist'?60:34,business:30,savings:DATA.INITIAL_PERSONAL_CASH,bonds:65},
    companyState:{cash:DATA.INITIAL_COMPANY_CASH,reputation:15,trust:68,
      team:[{id:'doyun',name:'도윤',role:'프로그래머',morale:76,active:true}],releasedGames:0},
    project:{progress:8,quality:46,buzz:8,bugs:8,released:false,weeklySales:0,totalSales:0,monthsSinceRelease:0},
    flags:{},log:[],pending:null,myth:null,storyIndex:0,ending:null,
    history:{projects:[{title,released:false}],turns:0,rollCount:0},catalogue:[]
  };
}
export function loadGame(): GameState|null {
  try {
    const raw=window.localStorage.getItem(DATA.STORAGE_KEY);
    if(!raw)return null;
    const item:unknown=JSON.parse(raw);
    if(item && typeof item==='object' && 'version' in item && item.version===3 &&
       'log' in item && Array.isArray(item.log) && 'schedule' in item && Array.isArray(item.schedule))
      return item as GameState;
  } catch { /* 잘못된 저장 데이터는 무시합니다. */ }
  return null;
}
export function saveGame(state:GameState):void {try{window.localStorage.setItem(DATA.STORAGE_KEY,JSON.stringify(state));}catch{/* private mode */}}
export function resetGame():void {try{window.localStorage.removeItem(DATA.STORAGE_KEY);}catch{/* private mode */}}
