'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StartScreen } from './StartScreen';
import { Diary } from './Diary';
import { Planner } from './Planner';
import { Status } from './Status';
import { MythOverlay } from './MythOverlay';
import { createGame, clone, loadGame, resetGame, saveGame } from '@/lib/state';
import { Rules } from '@/lib/rules';
import { Story } from '@/lib/story';
import { DATA } from '@/lib/data';
import type { GameState, Role, Tab, Slot, ActionId, EventId } from '@/lib/types';

export default function GameShell(){
  const [game,setGame]=useState<GameState|null>(null);
  const [tab,setTab]=useState<Tab>('diary');
  const [ready,setReady]=useState(false);
  const [debug,setDebug]=useState(false);
  const lastLogCount=useRef(0);
  const scrollWanted=useRef(false);

  useEffect(()=>{
    const saved=loadGame();
    setGame(saved);
    lastLogCount.current=saved?.log.length??0;
    setDebug(new URLSearchParams(window.location.search).has('debug'));
    setReady(true);
  },[]);
  useEffect(()=>{
    if(!scrollWanted.current || tab!=='diary'||!game)return;
    scrollWanted.current=false;
    window.requestAnimationFrame(()=>window.scrollTo({top:document.documentElement.scrollHeight,behavior:'smooth'}));
  },[game,tab]);

  const change=useCallback((fn:(s:GameState)=>boolean, nextTab?:Tab, scroll=true)=>{
    if(!game)return;
    const draft=clone(game);
    if(!fn(draft))return;
    saveGame(draft);
    if(scroll)scrollWanted.current=true;
    lastLogCount.current=draft.log.length;
    setGame(draft);
    if(nextTab)setTab(nextTab);
  },[game]);

  function start(company:string,title:string,role:Role){
    const fresh=createGame(company,title,role);
    Story.addPrologue(fresh);
    saveGame(fresh);
    setGame(fresh);setTab('diary');
    window.scrollTo({top:0});
  }
  function setSchedule(week:number,slot:Slot,action:ActionId){
    change(s=>{
      if(week<s.week||week>=4||s.pending||s.ending||!DATA.ACTIONS[action]?.slots.includes(slot))return false;
      if(s.phase==='calypso' && slot==='day')return false;
      s.schedule[week][slot]=action;return true;
    },undefined,false);
  }
  function reset(){
    if(!window.confirm('현재 항해 기록을 삭제하고 새로 시작할까요? 필요한 경우 일지를 먼저 저장해 주세요.'))return;
    resetGame();setGame(null);setTab('diary');window.scrollTo({top:0});
  }
  function exportText(){
    if(!game)return;
    const lines=[`21세기 오디세이 — ${game.company}`,`처음 바라던 게임: ${game.history.projects[0]?.title||game.game}`,''];
    game.log.forEach(entry=>{
      lines.push(`[${entry.when}] ${entry.title||''}`);
      if(entry.speaker)lines.push(`${entry.speaker}:`);
      lines.push(...entry.body);
      if(entry.delta)lines.push(`(${entry.delta})`);
      lines.push('');
    });
    const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const anchor=document.createElement('a');
    anchor.href=url;anchor.download='나의_항해일지.txt';document.body.appendChild(anchor);anchor.click();anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function newProject(){
    const name=window.prompt('다음에 만들 게임의 이름을 정해 주세요.','두 번째 항해');
    if(name!==null)change(s=>Rules.newProject(s,name),'diary');
  }
  function changeTab(next:Tab){setTab(next);window.scrollTo({top:0});}
  if(!ready)return <div className="loading-screen">항해 일지를 펼치는 중…</div>;
  if(!game)return <div className="app-shell"><StartScreen onStart={start}/></div>;
  const active=game.companyState.team.filter(t=>t.active).length;
  return <div className="app-shell">
    <header className="header"><div className="eyebrow">21st century odyssey · Where is your Ithaca</div>
      <div className="header-row"><div className="brand">항해 일지</div>
      <div className="header-right">{Story.date(game)}{game.week?` · ${game.week}주차`:''}</div></div>
      <div className="mini-stats"><span>회사 <b>{Math.round(game.companyState.cash).toLocaleString('ko-KR')}만</b></span>
      <span>건강 <b>{game.player.health}</b></span><span>스트레스 <b>{game.player.stress}</b></span><span>동료 <b>{active}명</b></span></div>
    </header>
    {tab==='diary'?<Diary game={game} onChoice={choice=>change(s=>Rules.choose(s,choice),'diary')}
      onAdvance={()=>change(Rules.advanceWeek,'diary')} onNextMonth={()=>change(Rules.nextMonth,'planner',false)}
      onExport={exportText} onReset={reset}/>:
    tab==='planner'?<Planner game={game} onSchedule={setSchedule}
      onAdvance={()=>change(Rules.advanceWeek,'diary')} onNextMonth={()=>change(Rules.nextMonth,'planner',false)}
      onShowDiary={()=>changeTab('diary')}/>:
    <Status game={game} debug={debug} onTransfer={()=>change(Rules.transfer,'diary')}
      onRecruit={()=>change(Rules.recruit,'diary')} onRelease={()=>change(Rules.release,'diary')}
      onNewProject={newProject} onLeaveCalypso={()=>change(Rules.leaveCalypso,'diary')}
      onReset={reset} onExport={exportText} onDebug={(id:EventId)=>change(s=>Rules.openEvent(s,id),'diary')}/>}
    <nav className="bottom-nav" aria-label="게임 메뉴">
      {([['diary','▤','항해 일지'],['planner','▦','일정표'],['status','◇','상태 / 경영']] as [Tab,string,string][]).map(([id,icon,label])=><button
        key={id} className={`nav-btn ${tab===id?'active':''}`} onClick={()=>changeTab(id)} aria-current={tab===id?'page':undefined}>
        <span className="nav-icon" aria-hidden>{icon}</span><span>{label}</span>
      </button>)}
    </nav>
    <MythOverlay eventId={game.pending} onChoose={choice=>change(s=>Rules.choose(s,choice),'diary')}/>
  </div>;
}
