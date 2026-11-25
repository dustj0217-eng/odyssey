import {DATA} from "./data";
import {Story} from "./story";
import {clone} from "./state";
import type {GameState,EventId,ActionId,Slot,ActionResult} from "./types";

/* 판정/스탯 변화/사건 발생. 문장은 story.js에 두고, 수치와 조건만 여기서 처리합니다. */
export const Rules = (()=>{
  const T=Story, D=DATA;
  const clamp=(v:number,a=0,b=100)=>Math.max(a,Math.min(b,v));
  const rand=(a:number,b:number)=>Math.floor(Math.random()*(b-a+1))+a;
  function roll(s:GameState){s.history.rollCount++;return rand(1,20)}
  function livingTeam(s:GameState){return s.companyState.team.filter(t=>t.active)}
  function chg<T extends object,K extends keyof T>(_s:GameState,where:T,key:K,amount:number,min=0,max=100){
    const old=where[key]; if(typeof old==='number')where[key]=clamp(old+amount,min,max) as T[K];
  }
  function isReady(s:GameState){return !s.pending && !s.ending}
  function action(s:GameState,id:ActionId,slot:Slot):ActionResult{
    const p=s.player,c=s.companyState,q=s.project;
    const night=slot==='night',fatigue=p.stress>=65?3:p.health<=45?2:0;
    const die=roll(s),skillBonus=Math.floor(p.skill/15),difficulty=id==='freelance'?15:id==='develop'?12:id==='marketing'?14:11;
    const total=die+skillBonus-fatigue-(night?1:0);
    const success=die===20 || (die!==1 && total>=difficulty);
    const d:string[]=[];
    const add=(label:string,value:number)=>{if(value!==0)d.push(`${label} ${value>0?'+':''}${value}`)};
    const scale=night?.64:1;
    if(id==='develop'){
      const inc=q.released?(success?rand(2,5):0):(success?rand(6,11):rand(1,3));
      const progress=Math.round(inc*scale);
      if(!q.released)chg(s,q,'progress',progress);
      const qualityChange=success?rand(1,2):-rand(1,3);
      chg(s,q,'quality',qualityChange);
      chg(s,q,'bugs',success? -rand(0,2):rand(1,4));
      chg(s,p,'stress',night?8:6);chg(s,p,'health',night?-5:-3);
      if(!q.released)add('개발 진척',progress);add('품질',qualityChange);add('스트레스',night?8:6);
    }else if(id==='freelance'){
      const amt=success?Math.round((D.FREELANCE_BASE+Math.floor(p.skill/5)+rand(-8,12))*scale):rand(-8,6);
      p.savings+=amt;chg(s,p,'stress',night?11:7);chg(s,p,'health',night?-6:-3);
      chg(s,c,'reputation',success?1:-1);
      add('개인 저축(만원)',amt);add('스트레스',night?11:7);
    }else if(id==='marketing'){
      const cost=night?13:26;c.cash-=cost;
      const growth=success?rand(5,12):rand(0,2);chg(s,q,'buzz',growth);
      chg(s,p,'stress',3);add('회사 자금(만원)',-cost);add('인지도',growth);
    }else if(id==='study'){
      const gain=success?rand(2,4):1;chg(s,p,'skill',gain);chg(s,p,'stress',night?3:1);
      add('개발 실력',gain);
    }else if(id==='rest'){
      chg(s,p,'health',night?11:8);chg(s,p,'stress',night?-12:-10);chg(s,p,'bonds',night?2:4);
      add('건강',night?11:8);add('스트레스',night?-12:-10);
    }else if(id==='job'){
      chg(s,p,'health',-2);chg(s,p,'stress',2);add('스트레스',2);
    }
    if(id!=='rest' && id!=='job' && night && p.stress>=75){chg(s,p,'health',-4);add('과로로 인한 건강',-4)}
    return {success,die,total,delta:d.join(' · ')};
  }
  function openEvent(s:GameState,id:EventId){
    if(s.pending||s.ending) return false;
    const e=T.events[id];if(!e) return false;
    s.pending=id;s.myth=e.kind==='myth'?id:null;
    T.add(s,{kind:'event',title:e.title,body:[e.body],myth:e.kind==='myth'});
    return true;
  }
  function maybeRandomEvent(s:GameState){
    if(s.phase!=='voyage'||s.pending||s.ending)return;
    const c=s.companyState,p=s.player;
    const member=livingTeam(s)[0];
    if(s.year===1&&s.month===3&&s.week===2&&!s.flags.teamConcern){s.flags.teamConcern=true;openEvent(s,'teamConcern');return}
    if(p.health<34 && !s.flags.illnessRecent && Math.random()<.58){s.flags.illnessRecent=3;openEvent(s,'illness');return}
    if(member && (member.morale<27 || c.trust<24) && !s.flags.leaving && Math.random()<.55){s.flags.leaving=true;openEvent(s,'leaving');return}
    if(s.year===1&&s.month===3&&s.week===4&&!s.flags.kindness){s.flags.kindness=true;openEvent(s,'kindness');return}
    if((s.year>1||s.month>=5)&&!s.flags.poseidonRecent&&Math.random()<.065){s.flags.poseidonRecent=3;openEvent(s,'poseidon');return}
    if(!s.flags.letter && s.project.buzz<25 && s.history.turns>=11 && Math.random()<.09){s.flags.letter=true;openEvent(s,'kindness');return}
    if(s.player.stress>=80 && Math.random()<.14 && !s.flags.illnessRecent){s.flags.illnessRecent=3;openEvent(s,'illness');}
  }
  function advanceWeek(s:GameState){
    if(!isReady(s)||s.week>=4) return false;
    s.week++;s.history.turns++;
    const w=s.schedule[s.week-1];
    const day=s.phase==='calypso'?'job':w.day;
    const night=w.night;
    const a=action(s,day,'day'),b=action(s,night,'night');
    if(s.phase==='voyage'){
      const team=livingTeam(s)[0];
      if(team){
        const passive=s.player.stress>=83?1:rand(1,3);
        if(!s.project.released)chg(s,s.project,'progress',passive);
        chg(s,team,'morale',s.player.stress>75?-4:s.companyState.cash<150?-5:rand(-1,1));
      }
      if((w.day==='develop'&&w.night==='freelance')||(w.day==='freelance'&&w.night==='develop')){
        chg(s,s.player,'stress',7);chg(s,s.player,'health',-3);
      }
    }
    let delta=[a.delta,b.delta].filter(Boolean).join('  /  ');
    T.seedWeek(s,s.week,day,night,a,b,delta);
    if(s.phase==='voyage'){
      maybeRandomEvent(s);
    }
    if(!s.pending) maybeCloseMonth(s);
    return true;
  }
  function maybeCloseMonth(s:GameState){if(s.week===4&&!s.flags.monthSettled&&!s.pending&&!s.ending) closeMonth(s)}
  function closeMonth(s:GameState){
    s.flags.monthSettled=true;
    const p=s.player,c=s.companyState,proj=s.project;
    if(s.phase==='calypso'){
      p.savings+=215-D.MONTHLY_PERSONAL_COST;
      chg(s,p,'health',7);chg(s,p,'stress',-8);
      T.add(s,{kind:'chapter',title:'월말 정산 · 달콤한 정박',body:[
        '급여는 약속한 날짜에 들어왔다. 이번 달도 월세와 생활비를 걱정하지 않아도 된다. 가끔 옛 게임 파일을 열어보지만, 다시 덮는 일에 익숙해지고 있다.'
      ],delta:`개인 저축 +${215-D.MONTHLY_PERSONAL_COST}만 원 · 건강 +7`});
      return;
    }
    const active=livingTeam(s).length;
    const overhead=active?D.MONTHLY_COMPANY_OVERHEAD:65;
    c.cash-=overhead;p.savings-=D.MONTHLY_PERSONAL_COST;
    let income=0;
    for(const game of (s.catalogue||[])){
      const units=Math.max(0,Math.floor((game.quality*1.7+game.buzz*2.5)*Math.pow(.57,game.age)+rand(-23,35)));
      game.age++;income+=Math.round(units*.75);
    }
    c.cash+=income;
    const balance=`회사 고정비 −${overhead}만 원 · 생활비 −${D.MONTHLY_PERSONAL_COST}만 원${income?' · 출시작 매출 +'+income+'만 원':''}`;
    let message='급여와 사무실 비용을 정산했다. 통장 잔고는 지난달과 다른 숫자가 되었다. 사업을 한다는 것은, 가끔은 꿈보다 숫자를 먼저 보는 일이었다.';
    if(proj.released)message='출시 이후에도 일은 끝나지 않았다. 판매 통계와 리뷰를 확인하고, 다음 업데이트를 고민했다. 완성된 게임조차 계속 시간을 요구하고 있었다.';
    if(c.cash<180)message+=' 다음 달의 회사 운영비가 마음에 걸렸다.';
    T.add(s,{kind:'chapter',title:'월말 정산',body:[message],delta:balance});
    if(s.flags.promiseMonth && !s.flags.promiseEcho && s.year*12+s.month>=s.flags.promiseMonth+2){
      s.flags.promiseEcho=true;
      T.add(s,{kind:'dialogue',speaker:active?'도윤 · 프로그래머':'오래된 기억',body:[active?'“대표님, 전에 올해 안에 출시한다고 하셨죠.” 도윤은 말을 아꼈다. 그 약속이 아직 공중에 떠 있었다.':'문득 예전에 했던 말이 떠올랐다. “올해 안에는 꼭 출시하자.” 그 말은 아직 이뤄지지 않았다.']});
    }
    if(s.flags.illnessRecent) s.flags.illnessRecent--;
    if(s.flags.poseidonRecent) s.flags.poseidonRecent--;
    if(p.savings<0){chg(s,p,'stress',8);T.add(s,{kind:'note',body:['개인 통장이 마이너스가 되었다. 다음 달에는 어떻게든 생활비를 마련해야 한다.'],delta:'스트레스 +8'});}
    if(c.cash<=-70){openEvent(s,'shipwreck')}
  }
  function nextMonth(s:GameState){
    if(!isReady(s)||s.week!==4||!s.flags.monthSettled)return false;
    s.week=0;s.month++;if(s.month>12){s.month=1;s.year++}
    s.flags.monthSettled=false;
    s.schedule=clone(s.phase==='calypso'?[{day:'job',night:'rest'},{day:'job',night:'rest'},{day:'job',night:'study'},{day:'job',night:'rest'}]:D.DEFAULT_SCHEDULE);
    T.add(s,{kind:'chapter',title:`${T.date(s)} · 새로운 달`,body:[s.phase==='calypso'?'이번 달도 회사는 정해진 시간에 문을 열었다. 바깥 세상은 여전히 움직이고 있었다.':'달력이 한 장 넘어갔다. 아직 항해는 끝나지 않았다. 당신은 다음 달의 일정을 펼쳤다.']});
    return true;
  }
  function choose(s:GameState,choice:string){
    const id=s.pending;if(!id)return false;
    const p=s.player,c=s.companyState,q=s.project;
    const e=T.events[id];if(!e?.choices.some(x=>x.id===choice))return false;
    s.pending=null;s.myth=null;
    let text='',delta='';
    if(id==='teamConcern'){
      if(choice==='promise'){chg(s,c,'trust',6);s.flags.promiseMonth=s.year*12+s.month;text='“올해 안에는 반드시.” 당신은 그렇게 대답했다. 도윤은 고개를 끄덕였다. 이제 그 말은 둘 사이의 약속이 되었다.';delta='팀 신뢰 +6'}
      if(choice==='truth'){chg(s,c,'trust',9);text='“솔직히 나도 장담 못 해.” 당신이 말하자 도윤은 잠시 침묵했다. 그러더니 의자를 당겨 앉았다. “그럼 어디가 제일 문제인지 같이 봐요.”';delta='팀 신뢰 +9'}
      if(choice==='rest'){chg(s,p,'health',9);chg(s,c,'trust',7);text='“그럼 내일은 쉬자.” 도윤은 눈을 크게 떴다. “대표님, 그거 녹음해도 돼요?” 오랜만에 둘 다 웃었다.';delta='건강 +9 · 팀 신뢰 +7'}
    } else if(id==='illness'){
      if(choice==='rest'){chg(s,p,'health',22);chg(s,p,'stress',-17);text='당신은 며칠 동안 연락을 줄이고 치료와 회복에 집중했다. 일정은 늦어졌지만, 돌아온 뒤에는 전보다 화면을 오래 바라볼 수 있었다.';delta='건강 +22 · 스트레스 −17'}
      if(choice==='delegate'){chg(s,p,'health',12);chg(s,c,'trust',7);text='당신이 병원에서 보낸 메시지에 도윤이 답했다. “대표님, 이건 제가 볼게요. 일단 쉬세요.” 혼자만의 항해가 아니었다.';delta='건강 +12 · 신뢰 +7'}
      if(choice==='push'){chg(s,p,'health',-9);chg(s,p,'stress',14);chg(s,q,'progress',3);text='당신은 몸을 조금 더 혹사하며 일을 이어갔다. 몇 줄의 코드가 늘었지만, 이 선택을 계속할 수는 없을 것 같았다.';delta='건강 −9 · 스트레스 +14 · 진척 +3'}
    } else if(id==='leaving'){
      const t=livingTeam(s)[0];
      if(choice==='ask'&&t&&roll(s)+Math.floor(c.trust/20)>=17&&c.cash>=120){chg(s,c,'trust',-5);chg(s,t,'morale',12);text='도윤은 오래 생각한 끝에 고개를 끄덕였다. “정말 이번이 마지막이에요.” 그 말이 고마우면서도 무거웠다.';delta='퇴사 보류 · 팀 사기 +12'}
      else{if(t)t.active=false;text='도윤은 조용히 책상을 정리했다. 문이 닫힌 뒤에야 사무실이 생각보다 넓다는 사실을 알았다.';delta='팀원 1명 퇴사'}
    } else if(id==='kindness'){
      if(choice==='reply'){chg(s,p,'bonds',5);chg(s,q,'buzz',3);text='당신은 길게 답장을 썼다. 다음 날, 그 사람은 친구에게도 게임을 소개하겠다고 했다. 세상은 아직 전부 등을 돌린 것은 아니었다.';delta='인간관계 +5 · 인지도 +3'}
      else{chg(s,p,'stress',-4);text='당신은 그 메시지를 별표 표시했다. 마음이 무너지는 날에 다시 읽어보려고.';delta='스트레스 −4'}
    } else if(id==='poseidon'){
      c.cash-=rand(35,65);chg(s,q,'buzz',-rand(5,12));text='계획은 틀어졌고, 광고에 들인 돈 일부는 돌아오지 않았다. 며칠 동안 원망할 대상을 찾아보았지만, 바다는 아무런 대답도 하지 않았다.';delta='회사 자금 감소 · 인지도 하락';
    } else if(id==='shipwreck'){
      if(rand(1,3)===1){s.ending='drowned';text='당신의 첫 항해는 여기서 끝났다. 완성하지 못한 파일과 지나간 약속들이 남았다. 이 실패가 당신의 삶 전체를 말해주는 것은 아니지만, 이 항해는 더 이어지지 않는다.';delta='익사 엔딩 · 확률 1/3'}
      else{text='모든 것이 끝났다고 믿던 때, 낯선 번호로 전화가 걸려왔다. 누군가 당신의 오래된 게임을 기억하고 있었다.';delta='구조 · 확률 2/3'}
    } else if(id==='calypso'){
      if(choice==='stay'){
        s.phase='calypso';c.cash=0;q.released=false;
        text='당신은 제안을 받아들였다. 며칠 뒤에는 출입증과 새 노트북, 정해진 급여일이 생겼다. 오랜만에 잠을 편히 잘 수 있었다. 어느 날 당신은 오래된 프로젝트 폴더를 열었다가, 아무것도 하지 않고 닫았다.';delta='칼립소의 섬 · 직장 생활 시작';
      }else{text='“제 일을 끝내고 싶습니다.” 당신은 그 말이 이렇게 힘들 줄 몰랐다. 전화기 너머에서 잠시 침묵이 흐른 뒤, 상대의 목소리가 차갑게 변했다.';delta='칼립소의 분노 발생'}
    } else if(id==='calypsoThreat'){
      if(choice==='negotiate'){
        s.phase='voyage';c.cash=210;c.trust=40;c.team=[];q.progress=Math.max(14,Math.floor(q.progress*.28));q.released=false; q.buzz=8; p.savings=Math.max(45,p.savings-80);
        text='긴 협상 끝에 결국 떠날 수 있었다. 남은 돈은 많지 않았고, 함께했던 사람들도 흩어졌다. 그래도 당신은 다시 작업실 열쇠를 손에 쥐었다. 이번에는 작은 배 한 척으로 시작할 것이다.';delta='재출항 · 새로운 회사 자금 210만 원';
      }else{
        s.phase='calypso';text='당신은 당장 떠나지 않기로 했다. 바깥으로 통하는 문은 아직 열려 있다. 다만 언젠가 그 문을 통과하려면 준비가 필요할 것이다.';delta='칼립소의 섬에 머무름';
      }
    }
    if(text) T.add(s,{kind:'chapter',title:'당신의 선택',body:[text],delta});
    if(id==='shipwreck' && !s.ending){openEvent(s,'calypso');return true}
    if(id==='calypso'&&choice==='leave'){openEvent(s,'calypsoThreat');return true}
    if(s.ending){T.add(s,{kind:'chapter',title:'항해의 끝',body:['얼마나 먼 길을 떠났는지보다, 누구와 어떤 시간을 보냈는지가 오래 남는다. 이 항해의 기록은 여기까지다.']});return true}
    maybeCloseMonth(s);return true;
  }
  function transfer(s:GameState){if(!isReady(s)||s.phase!=='voyage'||s.player.savings<100)return false;s.player.savings-=100;s.companyState.cash+=100;T.add(s,{kind:'note',title:'당신의 결정',body:['당신은 개인 통장에서 회사 통장으로 100만 원을 옮겼다. 회사는 조금 더 버틸 수 있게 됐지만, 생활은 그만큼 불안해졌다.'],delta:'개인 저축 −100만 원 · 회사 자금 +100만 원'});return true}
  function recruit(s:GameState){if(!isReady(s)||s.phase!=='voyage'||livingTeam(s).length||s.companyState.cash<220)return false;s.companyState.cash-=100;s.companyState.team.push({id:`crew${s.history.turns}`,name:'새 동료',role:'개발자',morale:65,active:true});T.add(s,{kind:'chapter',title:'새로운 선원',body:['채용 공고를 올리고 여러 사람을 만났다. 얼마 뒤 작은 작업실에 두 번째 의자가 다시 놓였다. 이전의 동료를 대신할 사람은 없지만, 새로운 항해는 시작될 수 있다.'],delta:'채용 비용 −100만 원 · 직원 1명 합류'});return true}
  function release(s:GameState){
    if(!isReady(s)||s.phase!=='voyage'||s.project.released||s.project.progress<100)return false;
    const q=s.project,c=s.companyState,die=roll(s);
    const score=die+Math.floor(q.quality/20)+Math.floor(q.buzz/20)-Math.floor(q.bugs/25);
    const copies=Math.max(4,Math.round((q.buzz*.9+q.quality*.7)*(.35+score/25)+rand(-28,48)));
    const revenue=Math.round(copies*.75);
    c.cash+=revenue;c.reputation=clamp(c.reputation+Math.floor(copies/30));c.releasedGames++;
    q.released=true;q.weeklySales=copies;q.totalSales=copies;
    s.catalogue=s.catalogue||[];s.catalogue.push({title:s.game,quality:q.quality,buzz:q.buzz,age:1});
    const current=s.history.projects.at(-1);if(current)current.released=true;
    T.add(s,{kind:'chapter',title:'출시일 · 마침내 세상으로',body:[
      `오전 열 시, ‘${s.game}’의 출시 버튼을 눌렀다. 모니터에는 익숙한 화면이 떴다. 아무 일도 일어나지 않은 듯했다.`,
      `첫 주 판매량은 ${copies}장이었다. ${copies<60?'그중 몇 장은 아마 주변 사람들이 구매했을 것이다.': '한 번도 만난 적 없는 사람들이 당신의 게임을 구매했다.'}`,
      '완성은 도착이 아니었다. 이제 리뷰와 패치, 다음 달의 운영비가 기다리고 있다.'
    ],delta:`출시 판매 ${copies}장 · 회사 수입 +${revenue}만 원 · 다음 달에도 운영 계속`});
    return true;
  }
  function newProject(s:GameState,name:string){
    if(!isReady(s)||s.phase!=='voyage'||!s.project.released)return false;
    s.game=(name||'이름 없는 두 번째 항해').trim().slice(0,28)||'다음 게임';
    s.project={progress:0,quality:44,buzz:Math.floor(s.companyState.reputation/3),bugs:6,released:false,weeklySales:0,totalSales:0,monthsSinceRelease:0};
    s.history.projects.push({title:s.game,released:false});
    T.add(s,{kind:'chapter',title:'다음 작품',body:[`당신은 새 프로젝트의 빈 폴더에 ‘${s.game}’이라고 이름을 붙였다. 이전 작품의 성적이 무엇이었든, 빈 화면 앞에서는 다시 초심자가 되는 법이었다.`]});return true;
  }
  function leaveCalypso(s:GameState){if(!isReady(s)||s.phase!=='calypso')return false;return openEvent(s,'calypsoThreat')}
  return {advanceWeek,nextMonth,choose,release,newProject,transfer,recruit,leaveCalypso,openEvent,maybeCloseMonth};
})();
