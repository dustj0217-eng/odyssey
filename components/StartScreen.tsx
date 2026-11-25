'use client';
import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Role } from '@/lib/types';

interface Props {onStart:(company:string,game:string,role:Role)=>void}
export function StartScreen({onStart}:Props){
  const [company,setCompany]=useState('작은별 스튜디오');
  const [game,setGame]=useState('별을 건너는 밤');
  const [role,setRole]=useState<Role>('programmer');
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();onStart(company,game,role);}
  return <main className="container"><div className="prologue">
    <div className="eyebrow">Prologue · 출항</div>
    <h1>모든 항해에는<br/>목적지가 있다.</h1>
    <p>트로이 전쟁이 끝나고, 오디세우스가 이타카로 돌아가는 데에는 십 년이 걸렸다고 합니다.</p>
    <p>당신에게는 배도, 선원도, 신들의 축복도 없습니다.</p>
    <p>대신 낡은 노트북과 얼마 되지 않는 저축, 그리고 오래전부터 만들고 싶었던 게임이 있습니다.</p>
    <p>당신은 작은 인디게임 개발사를 차리기로 했습니다.</p>
    <p className="intro-quote">그 결정이 얼마나 긴 항해가 될지는 아직 아무도 모릅니다.</p>
    <div className="shimmer"/>
    <form onSubmit={submit}>
      <label className="form-field"><span>당신의 스튜디오 이름</span><input className="input" maxLength={28} value={company} onChange={e=>setCompany(e.target.value)} required /></label>
      <label className="form-field"><span>처음 만들 게임의 제목</span><input className="input" maxLength={28} value={game} onChange={e=>setGame(e.target.value)} required /></label>
      <label className="form-field"><span>대표의 주력 능력</span><select className="select" value={role} onChange={e=>setRole(e.target.value as Role)}>
        <option value="programmer">프로그래밍</option><option value="artist">아트 / 연출</option><option value="planner">기획 / 운영</option>
      </select></label>
      <button type="submit" className="button primary full">첫 번째 항해 시작하기</button>
    </form>
    <p className="hint" style={{marginTop:14}}>선택과 대사가 일지에 저장됩니다. 자동 저장은 이 브라우저에서만 유지됩니다.</p>
  </div></main>
}
