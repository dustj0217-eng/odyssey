import { DATA } from "./data";
import type {GameState,ActionId,Slot,DiaryEntry,EventId,StoryEvent,ActionResult} from "./types";

/* 서술 데이터: 게임 규칙에서 분리하여 문장과 대화를 마음껏 다듬을 수 있습니다. */
export const Story = (()=>{
  const D=DATA;
  const money = (n:number) => `${n<0?'−':''}${Math.abs(Math.round(n)).toLocaleString('ko-KR')}만 원`;
  const pick = (values: string[]): string => values[Math.floor(Math.random()*values.length)];
  const date = (s:GameState) => `제${s.year}년 ${D.MONTH_NAMES[s.month-1]}`;
  function add(s:GameState, entry:Omit<DiaryEntry,"id"|"when">) {
    s.storyIndex += 1;
    s.log.push({id:s.storyIndex,when:`${date(s)} · ${s.week}주차`,...entry});
  }
  function addPrologue(s:GameState) {
    add(s,{kind:'chapter',title:'서막 · 출항',body:[
      '트로이에서 이타카로 돌아가는 데에는 십 년이 걸렸다고 한다. 누구는 파도를 탓하고, 누구는 신들을 탓한다. 항해를 시작할 때 그 끝을 아는 사람은 없었다.',
      `당신의 회사 이름은 ‘${s.company}’. 처음 만들기로 한 게임은 ‘${s.game}’이다.`,
      '당신에게는 번듯한 사무실 대신 비좁은 작업실이, 거대한 선단 대신 오래된 컴퓨터 두 대가 있다. 그리고 아직은 미래를 믿어주는 동료 한 명이 있다.',
      '오늘 당신은 첫 번째 달의 일정을 작성한다. 몇 년 뒤에도 이 선택을 기억할지는 알 수 없다.'
    ]});
    add(s,{kind:'dialogue',speaker:'도윤 · 프로그래머',body:['“대표님. 여기 와이파이는 잘 되죠?”','“……일단 그것부터 확인하고 시작합시다.”']});
  }
  const dayText: Record<ActionId, {success:string[];fail:string[]}> = {
    develop:{success:[
      '오랫동안 붙잡고 있던 문제의 실마리를 찾았다. 화면 속 캐릭터가 처음으로 당신의 의도대로 움직였다. 사소한 일이지만, 사무실에는 잠깐 박수가 나왔다.',
      '개발 화면에 초록색 체크 표시가 떠올랐다. 도윤이 의자를 뒤로 밀며 말했다. “아, 이건 진짜 좀 게임 같아졌는데요?”',
      '전에는 서로 이어지지 않던 기능들이 하나의 장면으로 묶였다. 아직 많은 부분이 비어 있지만, 오늘만큼은 다음 달이 기대됐다.'
    ], fail:[
      '고친 버그가 다른 버그를 불러왔다. 하루 종일 모니터를 들여다보았지만, 끝내 문제의 원인은 밝혀지지 않았다.',
      '코드를 열 번쯤 다시 읽은 뒤에야 오늘 해야 했던 일이 무엇인지 떠올랐다. 작업량은 많았지만 진척은 보잘것없었다.',
      '뜻대로 작동하지 않는 시스템을 앞에 두고 시간이 흘렀다. 도윤이 물었다. “이거 원래 이렇게 어려운 거였어요?”'
    ]},
    freelance:{success:[
      '외주 의뢰처에서 작업물을 확인했다. “생각보다 훨씬 좋네요.” 잔금이 들어온다는 말을 듣자 오래 참았던 숨이 나왔다.',
      '남의 게임에서 마감 직전의 버그를 찾아냈다. 의뢰인은 고마워했고, 당신은 잠깐 통장 잔고를 생각했다.',
      '제때 납품을 마쳤다. 그 작업이 당신의 게임과 아무런 관련이 없다는 사실은 일단 생각하지 않기로 했다.'
    ], fail:[
      '외주 의뢰처에서 수정 요청이 쏟아졌다. 약속한 시간은 넘겼고, 받을 수 있는 돈은 줄었다.',
      '익숙하지 않은 기술을 써야 하는 작업이었다. 결국 예상보다 오래 걸렸고, 당신의 게임은 그만큼 멈춰 있었다.',
      '담당자가 작업물에 만족하지 못했다. 당신은 밤늦게까지 수정을 이어갔지만 보수 일부를 포기해야 했다.'
    ]},
    marketing:{success:[
      '게시글 아래에 처음 보는 사람들이 댓글을 남겼다. 누군가는 게임의 분위기가 마음에 든다고 했다. 숫자는 작았지만 낯선 이름들이 반가웠다.',
      '짧은 개발 영상이 예상보다 멀리 퍼졌다. 몇몇 사람이 찜 목록에 게임을 넣었다는 메시지가 도착했다.',
      '소규모 커뮤니티에서 게임을 소개했다. 오래 대화를 나눈 끝에, 당신은 무엇을 더 보여줘야 하는지 조금 알 것 같았다.'
    ], fail:[
      '홍보 게시글은 빠르게 아래로 밀려났다. 좋아요 몇 개는 아마 팀원들의 것일 것이다.',
      '광고비가 빠져나간 뒤에도 통계 그래프는 거의 움직이지 않았다. 숫자가 틀린 것은 아니었다.',
      '열심히 만든 소개 영상은 별다른 반응을 얻지 못했다. 적어도 조회수 하나는 당신이 올린 것이 확실했다.'
    ]},
    study:{success:[
      '오래 미뤄 두었던 공부를 했다. 당장 게임이 달라지지는 않겠지만, 지난달 이해하지 못한 코드가 이제는 읽혔다.',
      '예제 프로젝트를 만들며 새로운 방식을 배웠다. 지금 게임에 곧바로 쓰기보다는, 다음에 같은 실수를 하지 않는 데 도움이 될 듯했다.'
    ],fail:['피곤한 머리로 강의를 들었다. 분명 집중했다고 생각했지만, 노트에는 제목만 남아 있었다.']},
    rest:{success:[
      '오랜만에 일을 일찍 끝냈다. 집으로 가는 길에 저녁 하늘이 아직 밝다는 사실을 알았다.',
      '친구를 만나 밥을 먹었다. 게임 이야기를 꺼내지 않으려 했지만 결국 조금 했다. 친구는 듣고 웃었다.',
      '늦잠을 잤다. 창밖은 평온했고, 오늘은 아무것도 완성하지 않아도 괜찮았다.'
    ],fail:[]},
    job:{success:[
      '칼립소의 회사는 놀라울 정도로 체계적이었다. 업무가 끝나면 사람들은 정말로 퇴근했다. 이런 생활이 가능하다는 사실이 낯설었다.',
      '회의가 끝나자 누군가 점심 메뉴를 물었다. 오후에도 일이 있었지만, 적어도 월급이 밀릴 걱정은 없었다.'
    ],fail:[]}
  };
  const nightText: Record<ActionId, {success:string[];fail:string[]}> = {
    develop:{success:['퇴근한 건물에 다시 불이 켜졌다. 조용한 밤, 아무도 보지 않는 화면에서 작은 기능 하나가 완성되었다.','밤이 깊어가자 코드는 조금씩 제자리를 찾았다. 내일의 자신에게 보여줄 만한 진척이 생겼다.'],fail:['한밤중에 원인을 알 수 없는 오류가 발생했다. 잠을 포기한 대가는 생각보다 작았다.','새벽 두 시, 당신은 같은 코드를 세 번째 다시 작성하고 있었다.']},
    freelance:{success:['밤이 되자 또 다른 프로젝트가 열렸다. 다른 회사의 마감도 당신에게는 중요한 생계였다.','납품 메시지를 보낸 뒤 통장을 확인했다. 오늘은 적어도 내일의 걱정을 조금 덜었다.'],fail:['의뢰인의 수정 요청이 새벽까지 이어졌다. 자신의 게임을 켜볼 시간은 없었다.','작업은 뜻대로 풀리지 않았다. 결국 잔금보다 피로가 먼저 쌓였다.']},
    marketing:{success:['늦은 밤 커뮤니티에서 몇 사람과 이야기를 나누었다. 작은 관심이지만 누군가 당신의 게임을 기다리고 있었다.'],fail:['홍보글에 달린 새 알림은 광고 계정의 댓글이었다. 당신은 화면을 조용히 닫았다.']},
    study:{success:['잠들기 전 공부한 내용이 머릿속을 맴돌았다. 배운 만큼 세상이 조금 넓어졌다.'],fail:['책을 펴 놓고 졸았다. 기억에 남는 것은 첫 페이지뿐이었다.']},
    rest:{success:['저녁에는 노트북을 닫았다. 내일도 바쁘겠지만 오늘 하루만큼은 되찾은 기분이었다.','오랜만에 밤에 잠들었다. 사소한 일인데도 작은 승리처럼 느껴졌다.'],fail:[]},
    job:{success:['퇴근 후에는 회사 메일을 확인하지 않았다. 그 사실이 이상하게도 큰 위안이 되었다.'],fail:[]}
  };
  function workNarration(action:ActionId,slot:Slot,success:boolean){
    const set=(slot==='night'?nightText:dayText)[action]||dayText.rest;
    return pick(set[success?'success':'fail']?.length?set[success?'success':'fail']:set.success);
  }
  function seedWeek(s:GameState,week:number,day:ActionId,night:ActionId,resultA:ActionResult,resultB:ActionResult,delta:string){
    add(s,{kind:'chapter',title:`${week}주차 · ${pick(['작은 항해','계획대로 되지 않는 일들','보통의 하루들','희망과 계산 사이'])}`,body:[
      `이번 주 낮에는 ‘${D.ACTIONS[day].label}’을 택했다. ${workNarration(day,'day',resultA.success)}`,
      `밤에는 ‘${D.ACTIONS[night].label}’에 시간을 배정했다. ${workNarration(night,'night',resultB.success)}`
    ],delta});
  }
  const events:Record<EventId,StoryEvent> = {
    teamConcern:{title:'작은 균열',kind:'normal',body:'도윤은 식은 커피를 손에 쥔 채 조심스럽게 말을 꺼냈다.\n\n“대표님, 저희 올해 안에 게임 낼 수 있을까요? 사실 월급도 그렇고…… 좀 걱정이 돼요.”\n\n당신은 지난달에도 비슷한 약속을 했던 것 같았다.',choices:[
      {id:'promise',text:'“올해 안에는 꼭 출시하자.”'},
      {id:'truth',text:'“솔직히 나도 장담은 못 해.”'},
      {id:'rest',text:'“이번 주는 조금 쉬자.”'}]},
    illness:{title:'몸이 보내는 신호',kind:'normal',body:'아침부터 어지러움이 가시지 않았다. 병원에서는 무리한 작업을 줄이고 경과를 보자고 했다.\n\n게임은 기다려주지 않는 것 같았다. 하지만 몸 역시 당신의 말을 들어주지 않았다.',choices:[
      {id:'rest',text:'치료와 휴식에 시간을 쓴다.'},
      {id:'delegate',text:'도윤에게 한동안 개발을 맡긴다.'},
      {id:'push',text:'가능한 범위에서 계속 일한다.'}]},
    leaving:{title:'동료의 하선',kind:'normal',body:'“대표님, 죄송합니다.”\n\n도윤은 한참을 머뭇거리다 다른 회사에 합격했다고 털어놓았다.\n\n“여기서 만든 건 저도 소중해요. 그래도 저도 제 생활이 있잖아요.”\n\n당신이 아무 말도 하지 않자 도윤은 덧붙였다.\n\n“거긴 창문도 있더라고요.”',choices:[
      {id:'ask',text:'한 번만 더 같이 하자고 부탁한다.'},
      {id:'accept',text:'인수인계를 부탁하고 보내준다.'}]},
    kindness:{title:'누군가의 편지',kind:'normal',body:'메시지함에 처음 보는 사람이 글을 남겼다.\n\n“개발 일지 잘 보고 있습니다. 언젠가 꼭 플레이해 보고 싶어요.”\n\n사무실의 숫자는 여전히 어렵다. 그래도 화면 건너편에 누군가 있다.',choices:[
      {id:'reply',text:'정성껏 답장을 보낸다.'},
      {id:'keep',text:'조용히 저장해 둔다.'}]},
    poseidon:{title:'포세이돈의 해일',kind:'myth',image:'poseidon',body:'한밤중, 플랫폼의 정책이 갑작스럽게 바뀌었다. 작은 스튜디오의 홍보 노출이 급감했고, 준비했던 캠페인에도 차질이 생겼다.\n\n당신이 무엇을 잘못해서가 아니었다. 바다는 언제나 그랬다.',choices:[{id:'endure',text:'남은 계획을 다시 세운다.'}]},
    shipwreck:{title:'파괴된 배',kind:'myth',image:'shipwreck',body:'결국 지켜내지 못했다. 창업 계좌는 텅 비었고, 동료들은 떠났으며, 회사 문에는 더 이상 불이 켜지지 않았다.\n\n오래 믿었던 배가 파도 아래로 사라졌다.',choices:[{id:'fate',text:'마지막 운명을 받아들인다.'}]},
    calypso:{title:'칼립소의 제안',kind:'myth',image:'calypso',body:'회사가 사라진 뒤, 이름 있는 게임 회사의 임원에게서 전화가 왔다.\n\n“대표님 작품을 오래 눈여겨봤어요. 이제 혼자 모든 걸 감당하지 않아도 됩니다. 저희 회사로 오세요.”\n\n따뜻한 말이었다. 그 말이 더 무섭게 들릴 줄은 아직 몰랐다.',choices:[
      {id:'stay',text:'제안을 받아들여 안정된 직장으로 간다.'},
      {id:'leave',text:'“아니요. 아직 제가 할 일이 있습니다.”'}]},
    calypsoThreat:{title:'칼립소의 분노',kind:'myth',image:'calypso',body:'“다시 떠나시겠다고요?”\n\n그녀의 목소리가 낮아졌다.\n\n“당신이 모든 걸 잃었을 때 누가 도왔는지 잊으셨나요? 지원받았던 비용과 계약 조항부터 확인해야겠네요.”\n\n방금 전까지 안식처였던 곳이 낯선 섬처럼 느껴졌다.',choices:[
      {id:'negotiate',text:'서류를 검토하고 정식으로 독립을 준비한다.'},
      {id:'wait',text:'일단 남아 때를 기다린다.'}]}
  };
  return {money,pick,date,add,addPrologue,seedWeek,events};
})();
