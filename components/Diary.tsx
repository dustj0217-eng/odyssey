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
  return <main className="container">
    <div className="page-intro"><div className="eyebrow">voyage chronicle</div>
      <h1 className="section-title">{game.company}의 기록</h1>
      <div className="hint">{game.game} · {game.phase==='calypso'?'칼립소의 섬에서 머무는 중':game.ending?'항해 종료':'당신의 항해는 진행 중'}</div>
    </div>
    <div id="diary-entries">{game.log.map(entry=><Entry key={entry.id} entry={entry}/>)}</div>
    {game.log.length>0 && <div className="app-footer">— 여기에 기록된 말은 다음 항해에도 남습니다 —</div>}
    {game.ending?<div className="end-screen"><div className="eyebrow">The end · 익사</div>
      <h2>이 항해는 여기까지입니다.</h2>
      <p>처음 바라던 곳에 도착하지는 못했습니다. 다만 그동안 남긴 기록은 사라지지 않습니다.</p>
      <button className="button secondary full" onClick={onExport}>항해 일지 저장하기</button>
      <button className="button ghost full" style={{marginTop:9}} onClick={onReset}>새 항해 시작하기</button>
    </div>: pending?.kind==='normal'?<section className="pending" id="current-choice">
      <div className="eyebrow">choice event</div><h3>{pending.title}</h3><p>{pending.body}</p>
      {pending.choices.map(choice=><button className="button" key={choice.id} onClick={()=>onChoice(choice.id)}>{choice.text}</button>)}
    </section>:pending?.kind==='myth'?<p className="notice">신화 사건이 진행 중입니다. 나타난 카드에서 선택해 주세요.</p>:
    game.week===4 && game.flags.monthSettled?<div className="choice-dock"><button className="button primary full" onClick={onNextMonth}>다음 달 일정 짜기 →</button></div>:
    <div className="choice-dock"><button className="button primary full" onClick={onAdvance}>{game.week===0?'이번 달 항해 시작':'다음 주 기록 읽기'} →</button>
      <p className="hint" style={{textAlign:'center',marginBottom:0}}>{game.week}/4주 진행 · 계획은 일정표에서 바꿀 수 있습니다.</p>
    </div>}
  </main>;
}
