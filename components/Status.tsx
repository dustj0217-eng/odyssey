import { Icon, type IconName } from './GameUI';
import { DATA } from '@/lib/data';
import type { GameState, EventId } from '@/lib/types';

interface Props {
  game:GameState;
  debug:boolean;
  onTransfer:()=>void;onRecruit:()=>void;onRelease:()=>void;onNewProject:()=>void;
  onLeaveCalypso:()=>void;onReset:()=>void;onExport:()=>void;onDebug:(id:EventId)=>void;
}
function Stat({label,value,icon,tone}:{label:string;value:number;icon:IconName;tone:string}){
  return <div className={`stat-item tone-${tone}`}><div className="stat-name"><Icon name={icon}/>{label}</div>
    <div className="bar"><span style={{width:`${Math.max(0,Math.min(100,value))}%`}} /></div>
    <strong>{Math.round(value).toLocaleString('ko-KR')}</strong>
  </div>;
}
export function Status({game,debug,onTransfer,onRecruit,onRelease,onNewProject,onLeaveCalypso,onReset,onExport,onDebug}:Props){
  const p=game.player,c=game.companyState,q=game.project,team=c.team.filter(t=>t.active);
  const unlocked=!game.ending && !game.pending;
  return <main className="container">
    <div className="page-intro"><h1 className="section-title">대표와 스튜디오</h1>
      <p className="hint">회사가 잘되는 것과 당신이 무사한 것은 서로 다른 일입니다. 능력치는 장기적으로 쌓이고, 관계는 선택을 기억합니다.</p></div>
    <h2 className="group-title"><Icon name="person"/>대표의 생활</h2>
    <Stat label="건강" icon="heart" tone="health" value={p.health}/><Stat label="스트레스" icon="stress" tone="stress" value={p.stress}/>
    <Stat label="개발 실력" icon="code" tone="info" value={p.skill}/><Stat label="인간관계" icon="team" tone="team" value={p.bonds}/>
    <div className="panel"><div className="money-line"><span><Icon name="wallet"/>개인 저축</span><strong>{Math.round(p.savings).toLocaleString('ko-KR')}만 원</strong></div><p>매달 생활비 약 {DATA.MONTHLY_PERSONAL_COST}만 원</p>
      <p>외주 성공률은 개발 실력에 영향을 받지만, 피로가 심하면 어려운 작업을 실수할 수 있습니다.</p></div>
    <h2 className="group-title"><Icon name="work"/>회사와 게임</h2>
    <div className="panel"><div className="money-line"><span><Icon name="wallet"/>회사 자금</span><strong>{Math.round(c.cash).toLocaleString('ko-KR')}만 원</strong></div><p>평판 {c.reputation}</p>
      <p>직원 {team.length}명 · 월 고정비 약 {team.length?DATA.MONTHLY_COMPANY_OVERHEAD:65}만 원</p>
      <p>함께 일하는 사람: {team.map(t=>`${t.name} (사기 ${t.morale})`).join(', ')||'아무도 없습니다'}</p></div>
    <Stat label="개발 진척" icon="code" tone="info" value={q.progress}/><Stat label="작품 품질" icon="star" tone="money" value={q.quality}/>
    <Stat label="인지도" icon="star" tone="team" value={q.buzz}/><Stat label="버그 위험" icon="bug" tone="stress" value={q.bugs}/>
    <p className="hint">{q.released?'게임은 출시되었습니다. 하지만 매출과 지출, 다음 작품의 문제는 계속됩니다.':'개발 진척 100%는 출시가 가능하다는 뜻이지, 상업적 성공을 보장하지 않습니다.'}</p>
    <h2 className="group-title">경영 선택</h2>
    {unlocked?(game.phase==='voyage'?<div className="stacked-actions">
      <button className="button secondary full" onClick={onTransfer} disabled={p.savings<100}>개인 저축 100만 원을 회사에 투입</button>
      {team.length===0&&<button className="button secondary full" onClick={onRecruit} disabled={c.cash<220}>새 직원 채용 · 비용 100만 원</button>}
      {!q.released?<button className="button primary full" onClick={onRelease} disabled={q.progress<100}>게임 출시하기 {q.progress<100?`(개발 ${q.progress}%)`:''}</button>:
        <button className="button primary full" onClick={onNewProject}>다음 작품 시작하기</button>}
    </div>:<button className="button primary full" onClick={onLeaveCalypso}>이 직장을 떠나겠다고 말하기</button>):
      <p className="notice">선택 이벤트를 먼저 해결해 주세요.</p>}
    <hr className="divider"/>
    <h2 className="group-title">기록 관리</h2>
    <div className="button-row"><button className="button secondary" onClick={onExport}>일지 텍스트 저장</button><button className="button ghost" onClick={onReset}>새 게임</button></div>
    <p className="hint">자동 저장은 이 브라우저에만 남습니다. 다른 기기로 옮기거나 브라우저 데이터를 지우면 사라질 수 있습니다.</p>
    {debug && !game.ending && <div className="dev-tool"><b>제작자 테스트 (?debug=1)</b><br/>
      {(['poseidon','illness','shipwreck','calypso'] as EventId[]).map(id=><button key={id} disabled={!!game.pending} className="button tiny ghost" onClick={()=>onDebug(id)}>{({poseidon:'포세이돈',illness:'질병',shipwreck:'파괴된 배',calypso:'칼립소'} as Record<string,string>)[id]}</button>)}
    </div>}
  </main>;
}
