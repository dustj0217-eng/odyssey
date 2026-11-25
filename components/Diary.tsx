import { Icon } from './GameUI';
import { Story } from '@/lib/story';
import type { GameState, DiaryEntry } from '@/lib/types';

interface Props {
  game: GameState;
  onChoice:(choice:string)=>void;
  onAdvance:()=>void;
  onNextMonth:()=>void;
  onExport:()=>void;
  onReset:()=>void;
}
function Entry({entry}: {entry:DiaryEntry}) {
  return <article className={`chapter ${entry.kind==='note'?'note':''}`} id={`entry-${entry.id}`}>
    <div className="chapter-marker">{entry.when}</div>
    {entry.title && <h2>{entry.title}</h2>}
    {entry.kind==='dialogue'?<div className="dialogue">
      <div className="speaker">{entry.speaker??'대화'}</div>
      {entry.body.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
    </div>:entry.body.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
    {entry.delta && <div className="delta">{entry.delta}</div>}
  </article>
}
export function Diary({game,onChoice,onAdvance,onNextMonth,onExport,onReset}:Props){
  const pending=game.pending?Story.events[game.pending]:null;
  // 같은 날짜의 연속 기록을 한 페이지처럼 보여 주고, 이전 기록은 접습니다.
  let start=game.log.length;
  const last=game.log[game.log.length-1];
  while(start>0 && game.log[start-1].when===last?.when)start--;
  const past=game.log.slice(0,start), current=game.log.slice(start);
  return <main className="container diary-screen">
    <div className="page-intro">
      <h1 className="section-title">{game.company}의 기록</h1>
      <div className="hint">{game.game} · {game.phase==='calypso'?'칼립소의 섬에서 머무는 중':game.ending?'항해 종료':'당신의 항해는 진행 중'}</div>
    </div>
    {past.length>0 && <details className="archive" key={game.log.length}><summary><Icon name="book"/>이전 기록 <span>{past.length}개</span></summary><div>{past.map(entry=><Entry key={entry.id} entry={entry}/>)}</div></details>}
    <div id="current-chapter"><div id="diary-entries">{current.map(entry=><Entry key={entry.id} entry={entry}/>)}</div>
    {game.ending?<div className="end-screen"><div className="eyebrow">결말 · 익사</div>
      <h2>이 항해는 여기까지입니다.</h2>
      <p>처음 바라던 곳에 도착하지는 못했습니다. 다만 그동안 남긴 기록은 사라지지 않습니다.</p>
      <button className="button secondary full" onClick={onExport}>항해 일지 저장하기</button>
      <button className="button ghost full"  onClick={onReset}>새 항해 시작하기</button>
    </div>: pending?.kind==='normal'?<section className="pending" id="current-choice">
      <div className="eyebrow">선택</div><h3>{pending.title}</h3><p>{pending.body}</p>
      {pending.choices.map((choice,i)=><button className="choice-button" key={choice.id} onClick={()=>onChoice(choice.id)}><span className="choice-number">{String(i+1).padStart(2,'0')}</span><span>{choice.text}</span><Icon name="arrow"/></button>)}
    </section>:pending?.kind==='myth'?<p className="notice">신화 사건이 진행 중입니다. 나타난 카드에서 선택해 주세요.</p>:
    game.week===4 && game.flags.monthSettled?<div className="choice-dock"><button className="button primary full" onClick={onNextMonth}>다음 달 일정 짜기 →</button></div>:
    <div className="choice-dock"><button className="button primary full" onClick={onAdvance}>{game.week===0?'이번 달 항해 시작':'다음 주 기록 읽기'} →</button>
      <p className="hint center-note">{game.week}/4주 진행 · 계획은 일정표에서 바꿀 수 있습니다.</p>
    </div>}
    </div>
    {game.log.length>0 && <div className="page-number">— {game.log.length} —</div>}
  </main>;
}
