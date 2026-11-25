import { useState } from 'react';
import { Icon, actionIcon } from './GameUI';
import { DATA, ACTION_IDS } from '@/lib/data';
import { Story } from '@/lib/story';
import type { GameState, Slot, ActionId } from '@/lib/types';

interface Props {
  game:GameState;
  onSchedule:(week:number,slot:Slot,action:ActionId)=>void;
  onAdvance:()=>void;
  onNextMonth:()=>void;
  onShowDiary:()=>void;
}
export function Planner({game,onSchedule,onAdvance,onNextMonth,onShowDiary}:Props){
  const [editing,setEditing]=useState<{week:number;slot:Slot}|null>(null);
  const locked=!!game.pending||!!game.ending;
  const nights=game.schedule.slice(game.week).filter(w=>w.night!=='rest').length;
  const risk=nights>=3?'야간 작업이 많습니다. 당장의 성과가 늘어도 피로가 누적될 수 있습니다.':nights===0?'밤 시간을 모두 휴식에 배정했습니다. 회복에는 유리하지만 수입과 개발 시간이 줄어듭니다.':'일과 휴식을 병행하는 일정입니다. 결과는 능력치와 주사위에 따라 달라집니다.';
  function options(slot:Slot){
    return ACTION_IDS.filter(id=>{
      const allowedSlots: readonly Slot[] = DATA.ACTIONS[id].slots;
      return allowedSlots.includes(slot) &&
        (game.phase==='calypso'?id==='job'||id==='rest'||id==='study'||id==='develop':id!=='job');
    });
  }
  return <main className="container">
    <div className="page-intro">
      <h1 className="section-title">{Story.date(game)}의 일정</h1>
      <p className="hint">
        한 달은 4주로 단순화했습니다. 낮과 밤에 할 일을 정하고 한 주씩 결과를 읽습니다. 
        아직 진행하지 않은 주의 계획은 바꿀 수 있습니다.
      </p>
    </div>
    <div className="schedule-board">
      <div className="schedule-head">
        <span>주차</span><span><Icon name="sun"/>낮</span><span><Icon name="moon"/>밤</span>
      </div>
      {game.schedule.map((week,i)=><section className={`planner-week ${i<game.week?'is-done':''}`} key={i}>
        <div className="week-row"><div className="week-top"><b>{String(i+1).padStart(2,'0')}</b><span>{i<game.week?'완료':i===game.week?'다음':'주차'}</span></div>
          {(['day','night'] as Slot[]).map(slot=>{
            const action=game.phase==='calypso'&&slot==='day'?'job':week[slot];
            const disabled=locked||i<game.week||(game.phase==='calypso'&&slot==='day');
            const selected=editing?.week===i&&editing.slot===slot;
            return <button key={slot} type="button" className="schedule-tile" data-action={action} disabled={disabled} aria-expanded={selected&&!disabled} aria-label={`${i+1}주차 ${slot==='day'?'낮':'밤'}: ${DATA.ACTIONS[action].label}`} onClick={()=>setEditing(selected?null:{week:i,slot})}><Icon name={actionIcon(action)}/><span>{DATA.ACTIONS[action].label}</span>{!disabled&&<Icon name="arrow" className="tile-arrow"/>}</button>;
          })}
        </div>
        {editing?.week===i&&!locked&&i>=game.week&&!(game.phase==='calypso'&&editing.slot==='day')&&<div className="action-picker"><div className="picker-heading">{i+1}주차 · {editing.slot==='day'?'낮':'밤'} 행동 선택</div><div className="action-grid">
          {options(editing.slot).map(id=><button key={id} type="button" className="action-tile" data-action={id} aria-pressed={week[editing.slot]===id} onClick={()=>{onSchedule(i,editing.slot,id);setEditing(null);}}><Icon name={actionIcon(id)}/><span>{DATA.ACTIONS[id].label}</span>{week[editing.slot]===id&&<Icon name="check" className="selected-check"/>}</button>)}
        </div></div>}
      </section>)}
    </div>
    <div className="panel"><h3>이번 달의 여유</h3><p>{risk}</p><hr/>
      <p>
        <b>현재 개발 실력 {game.player.skill}</b> · 
        외주는 실력, 피로, 주사위의 영향을 받습니다. 돈이 필요하다고 무조건 성공하지는 않습니다.
      </p>
    </div>
    {game.pending?<p className="notice">
      진행 중인 사건을 먼저 선택해 주세요. 
      <button className="button tiny secondary" onClick={onShowDiary}>
        일지로 돌아가기
      </button></p>:
      game.ending?null:game.week===4&&game.flags.monthSettled?<button className="button primary full" onClick={onNextMonth}>다음 달 계획하기</button>:
      <button className="button primary full" onClick={onAdvance}>{game.week?'다음 주 항해 진행':'이 일정으로 한 달 시작'} →</button>}
  </main>;
}
