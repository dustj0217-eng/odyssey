/** ITHACA STUDIO — 게임 규칙과 사건 데이터. 수정할 때는 이 파일부터 확인하세요. */
export const MAX_WEEKS = 16;
export const ACTION_POINTS = 5;
export const SAVE_KEY = 'ithaca-studio-save-v1';

export type TaskKey = 'build' | 'polish' | 'fix' | 'market' | 'freelance' | 'rest';
export type MetricKey = 'cash' | 'progress' | 'quality' | 'bugs' | 'hype' | 'fatigue' | 'autonomy';
export type Phase = 'setup' | 'playing' | 'ended';
export type Tab = 'desk' | 'work' | 'messages' | 'journal';

export interface Feed {
  id: number;
  week: number;
  from: string;
  subject: string;
  body: string;
  kind: 'mail' | 'chat' | 'system' | 'player';
}
export interface WeekLog {
  week: number;
  cashDelta: number;
  progressDelta: number;
  hypeDelta: number;
  note: string;
}
export interface Result {
  title: string;
  subtitle: string;
  narrative: string;
  released: boolean;
  sales: number;
  income: number;
  finalCash: number;
  grade: string;
}
export interface State {
  version: 1;
  phase: Phase;
  studio: string;
  project: string;
  genre: string;
  week: number;
  cash: number; // 단위: 만원
  progress: number;
  quality: number;
  bugs: number;
  hype: number;
  fatigue: number;
  autonomy: number;
  plan: Record<TaskKey, number>;
  pendingEvent: string | null;
  flags: string[];
  feed: Feed[];
  logs: WeekLog[];
  nextId: number;
  result: Result | null;
}
export interface EventOption {
  label: string;
  detail: string;
  reply: string;
  effect: Partial<Record<MetricKey, number>>;
  flag?: string;
  minCash?: number;
  conclude?: boolean;
}
export interface Event {
  id: string;
  week: number;
  character: string;
  role: string;
  title: string;
  body: string;
  options: EventOption[];
}

export const TASKS: { key: TaskKey; title: string; desc: string; short: string }[] = [
  { key: 'build', title: '핵심 기능 개발', desc: '진행도 +7 · 버그 +2 · 피로 +7', short: '개발' },
  { key: 'polish', title: '게임 다듬기', desc: '진행도 +3 · 품질 +5 · 버그 +1', short: '다듬기' },
  { key: 'fix', title: 'QA와 버그 수정', desc: '버그 −5 · 품질 +2 · 피로 +4', short: '버그 수정' },
  { key: 'market', title: '홍보 및 커뮤니티', desc: '관심 +11 · 비용 −9만 원', short: '홍보' },
  { key: 'freelance', title: '외주 개발', desc: '자금 +44만 원 · 피로 +9', short: '외주' },
  { key: 'rest', title: '재충전', desc: '피로 −19 · 작은 품질 보너스', short: '휴식' },
];

/** 고정 사건 7개. 새 사건은 이 배열에 추가하고 week 값만 겹치지 않게 설정합니다. */
export const EVENTS: Event[] = [
  {
    id: 'first-impression', week: 2, character: '윤지 · 베타 테스터', role: '메신저',
    title: '첫 빌드의 첫 인상',
    body: '플레이해 봤어요. 기본 아이디어는 괜찮은데 조작감이 살짝 아쉬워요. 지금 방향을 바꾸면 일정이 밀릴 것 같은데… 어떻게 할까요?',
    options: [
      { label: '피드백을 반영해 조작감을 고친다', detail: '완성도 향상, 일정 부담', reply: '좋아요. 다음 빌드가 훨씬 기대되네요.', effect: { quality: 9, progress: -5, fatigue: 4 }, flag: 'listened-to-tester' },
      { label: '현재 계획대로 개발을 진행한다', detail: '진행도 유지, 개선 기회 보류', reply: '알겠어요. 출시 전에 한 번 더 확인해 볼게요.', effect: { progress: 4, hype: -2 } },
    ],
  },
  {
    id: 'sirens-trend', week: 4, character: '커뮤니티 봇', role: '트렌드 알림',
    title: '세이렌: 요즘 다들 이 장르를 만든다',
    body: '유명 스트리머가 유행시키는 시스템이 폭발적인 반응을 얻고 있습니다. 팔로워들은 당신의 게임에도 이 기능을 넣어달라고 요청합니다.',
    options: [
      { label: '유행하는 기능을 추가한다', detail: '관심 급증, 기술 부채 증가', reply: '유행에 올라탔습니다. 대신 개발 목록이 무거워졌습니다.', effect: { hype: 19, bugs: 8, progress: -9, fatigue: 6 }, flag: 'followed-trend' },
      { label: '내 게임의 콘셉트를 유지한다', detail: '변화 적음, 제작 의도 보존', reply: '유행과 무관하게 게임을 기다리는 사람들도 있습니다.', effect: { quality: 4, autonomy: 4 }, flag: 'stayed-true' },
    ],
  },
  {
    id: 'qa-warning', week: 6, character: '윤지 · 베타 테스터', role: '긴급 메일',
    title: '저장 파일 손상 버그',
    body: '일부 환경에서 저장 파일이 사라지는 문제가 발견됐습니다. 다음 주 체험판 공개를 앞두고 있습니다. 전문 QA를 고용할까요?',
    options: [
      { label: '외부 QA를 고용해 해결한다', detail: '비용 85만 원, 버그 크게 감소', reply: 'QA팀이 재현 케이스를 정리해 빠르게 대응했습니다.', effect: { cash: -85, bugs: -14, quality: 5 }, minCash: 85, flag: 'hired-qa' },
      { label: '직접 고친다', detail: '비용 없이 버그 감소, 피로 증가', reply: '밤을 새웠지만 문제를 상당 부분 해결했습니다.', effect: { bugs: -8, fatigue: 18, progress: -4 } },
      { label: '문제를 공지하고 데모를 연기한다', detail: '버그 감소, 관심도 하락', reply: '유저들은 실망했지만 솔직한 공지를 긍정적으로 받아들이는 반응도 있습니다.', effect: { bugs: -6, hype: -11, quality: 3 }, flag: 'transparent-delay' },
    ],
  },
  {
    id: 'poseidon-policy', week: 8, character: '플랫폼 파트너팀', role: '자동 안내',
    title: '포세이돈: 스토어 정책 변경',
    body: '출시 심사 기준이 예고 없이 변경되었습니다. 대응 작업에 추가 시간이 필요합니다. 플레이어의 노력만으로 피할 수 없는 일이 생겼습니다.',
    options: [
      { label: '신규 심사 기준에 맞춰 재작업한다', detail: '진행도 감소, 안정성 확보', reply: '답답하지만 심사 요구 사항에 맞춰 수정했습니다.', effect: { progress: -9, bugs: -5, fatigue: 9 }, flag: 'met-platform-rules' },
      { label: '출시 플랫폼을 다시 검토한다', detail: '관심 감소, 제작 자율성 증가', reply: '플랫폼을 바꾸는 것도 하나의 전략입니다.', effect: { hype: -13, autonomy: 8, cash: -25 }, flag: 'switched-store' },
    ],
  },
  {
    id: 'calypso-publisher', week: 10, character: '오로라 퍼블리싱', role: '사업 제안',
    title: '칼립소: 매력적인 계약서',
    body: '개발비 지원과 홍보를 약속하는 퍼블리셔가 나타났습니다. 대신 게임의 일부 방향성과 최종 출시 결정권을 넘겨야 합니다. 운영 통장에는 아직 여유가 있을까요?',
    options: [
      { label: '퍼블리셔와 계약한다', detail: '큰 자금과 관심 확보, 제작 자율성 감소', reply: '계약이 체결됐습니다. 이제 개발 일정에 외부의 목소리가 들어옵니다.', effect: { cash: 350, hype: 24, autonomy: -42, fatigue: -5 }, flag: 'signed-publisher' },
      { label: '독립 개발을 이어간다', detail: '자율성 유지, 지원금 없음', reply: '제안은 거절됐습니다. 자금 문제는 여전히 당신의 몫입니다.', effect: { autonomy: 7, hype: 2 }, flag: 'refused-publisher' },
      { label: '일부 조건만 다시 협상한다', detail: '적은 지원금, 제한적인 자율성 손실', reply: '상대가 일부 조건을 받아들였습니다. 모든 것을 얻지는 못했지만요.', effect: { cash: 110, hype: 9, autonomy: -13 }, flag: 'negotiated-publisher' },
    ],
  },
  {
    id: 'critical-review', week: 12, character: '하루 · 게임 리뷰어', role: '미리보기 요청',
    title: '리뷰어가 데모를 요청했다',
    body: '게임 리뷰어가 사전 플레이를 제안했습니다. 홍보 기회이지만 버그가 많다면 부정적인 반응도 빠르게 퍼질 수 있습니다.',
    options: [
      { label: '지금 있는 빌드를 보낸다', detail: '관심도 상승 가능, 버그에 따른 위험', reply: '리뷰어가 빌드를 받아갔습니다. 반응은 현재 게임 상태에 달려 있습니다.', effect: { hype: 13, fatigue: 3 }, flag: 'sent-review-build' },
      { label: '한 번 더 수정하고 정중히 미룬다', detail: '안정성 개선, 홍보 기회 일부 손실', reply: '리뷰어는 다음 기회를 기약했습니다.', effect: { bugs: -7, hype: -5, quality: 5 }, flag: 'delayed-review-build' },
    ],
  },
  {
    id: 'career-offer', week: 14, character: '웰컴게임즈 채용팀', role: '개인 메일',
    title: '다른 이타카가 보인다',
    body: '한 게임 회사에서 정규직 개발자 채용을 제안했습니다. 생활은 안정될 수 있지만 현재 프로젝트를 중단해야 합니다. 남은 자금과 게임의 완성도를 보고 결정하세요.',
    options: [
      { label: '제안을 받아들이고 프로젝트를 정리한다', detail: '다른 삶을 선택하며 플레이 종료', reply: '스튜디오 문을 닫았습니다. 하지만 기술과 경험은 당신에게 남습니다.', effect: { cash: 160, fatigue: -25 }, flag: 'took-job', conclude: true },
      { label: '게임을 끝까지 완성하겠다', detail: '프로젝트 계속 진행', reply: '메일을 보관함에 넣었습니다. 항해는 계속됩니다.', effect: { autonomy: 7, fatigue: 6 }, flag: 'rejected-job' },
    ],
  },
];

const zeroPlan = (): Record<TaskKey, number> => ({ build: 0, polish: 0, fix: 0, market: 0, freelance: 0, rest: 0 });
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const cashText = (value: number) => `${value.toLocaleString('ko-KR')}만 원`;

export function newGame(): State {
  return {
    version: 1, phase: 'setup', studio: '이타카 스튜디오', project: '돌아가는 길', genre: '스토리 게임',
    week: 1, cash: 760, progress: 0, quality: 45, bugs: 5, hype: 8, fatigue: 12, autonomy: 100,
    plan: zeroPlan(), pendingEvent: null, flags: [], feed: [], logs: [], nextId: 1, result: null,
  };
}
function addFeed(s: State, from: string, subject: string, body: string, kind: Feed['kind']): void {
  s.feed.push({ id: s.nextId++, week: s.week, from, subject, body, kind });
}
function withBounds(s: State) {
  s.progress = clamp(s.progress);
  s.quality = clamp(s.quality);
  s.bugs = clamp(s.bugs, 0, 80);
  s.hype = clamp(s.hype);
  s.fatigue = clamp(s.fatigue);
  s.autonomy = clamp(s.autonomy);
  s.cash = Math.round(s.cash);
}
export function startGame(studio: string, project: string, genre: string): State {
  const s = newGame();
  s.phase = 'playing';
  s.studio = studio.trim().slice(0, 26) || '이타카 스튜디오';
  s.project = project.trim().slice(0, 30) || '돌아가는 길';
  s.genre = genre;
  addFeed(s, '시스템', '사업자 노트 생성', `${s.studio}의 문을 열었습니다. 초기 자금은 ${cashText(s.cash)}입니다. 16주 안에 첫 게임을 출시해 보세요.`, 'system');
  addFeed(s, '선배 개발자 · 민재', '첫 출근에 보내는 말', `첫 게임 『${s.project}』 개발을 축하합니다. 이 시장에서는 완성도, 홍보, 자금 셋을 모두 챙기기 어렵더라고요.\n매주 작업량 5칸을 배분한 다음 '이번 주 마감'을 누르세요.`, 'chat');
  addFeed(s, '나', '창업자의 메모', '이 게임을 만들고 싶어서 여기까지 왔다. 내 이타카는 어떤 모습일까?', 'player');
  return s;
}
export function plannedPoints(s: State) { return Object.values(s.plan).reduce((sum, value) => sum + value, 0); }
export function changePlan(s: State, action: TaskKey, change: number): State {
  if (s.phase !== 'playing' || s.pendingEvent) return s;
  const amount = s.plan[action] + change;
  if (amount < 0 || amount > ACTION_POINTS || (change > 0 && plannedPoints(s) >= ACTION_POINTS)) return s;
  return { ...s, plan: { ...s.plan, [action]: amount } };
}
function applyEffects(s: State, effects: EventOption['effect']) {
  (Object.keys(effects) as MetricKey[]).forEach(key => {
    const amount = effects[key] ?? 0;
    s[key] += amount;
  });
  withBounds(s);
}
export function chooseEvent(old: State, optionIndex: number): State {
  const event = EVENTS.find(item => item.id === old.pendingEvent);
  const option = event?.options[optionIndex];
  if (!event || !option || (option.minCash !== undefined && old.cash < option.minCash)) return old;
  const s = structuredClone(old);
  applyEffects(s, option.effect);
  if (option.flag) s.flags.push(option.flag);
  addFeed(s, '나', event.title, option.label, 'player');
  addFeed(s, event.character, '답장이 도착했습니다', option.reply, 'chat');
  s.pendingEvent = null;
  if (option.conclude) s.result = makeResult(s, 'career');
  if (option.conclude) s.phase = 'ended';
  return s;
}

export function advanceWeek(old: State): State {
  if (old.phase !== 'playing' || old.pendingEvent || plannedPoints(old) === 0) return old;
  const s = structuredClone(old);
  const before = { cash: s.cash, progress: s.progress, hype: s.hype };
  const p = s.plan;
  // 피로가 높으면 핵심 개발 효율이 감소합니다. 후반부에는 기술 부채로 진행이 느려집니다.
  const development = Array.from({ length: p.build }).reduce<number>((sum) => {
    const gain = s.progress >= 75 ? 4 : s.fatigue >= 70 ? 5 : 7;
    s.progress += gain;
    s.bugs += s.fatigue >= 65 ? 3 : 2;
    s.fatigue += 7;
    return sum + gain;
  }, 0);
  s.progress += p.polish * 3;
  s.quality += p.polish * 5;
  s.bugs += p.polish;
  s.fatigue += p.polish * 5;
  s.bugs -= p.fix * 5;
  s.quality += p.fix * 2;
  s.fatigue += p.fix * 4;
  s.hype += p.market * 11;
  s.cash -= p.market * 9;
  s.fatigue += p.market * 4;
  s.cash += p.freelance * 44;
  s.fatigue += p.freelance * 9;
  s.hype -= p.freelance;
  s.fatigue -= p.rest * 19;
  if (p.rest > 0) s.quality += 1;
  s.cash -= 47; // 매주 운영비: 임대·생계·서비스 요금
  s.hype -= 2;  // 새로운 홍보가 없으면 관심도 서서히 감소
  if (s.fatigue >= 80) s.quality -= 3;
  withBounds(s);
  const taskText = TASKS.filter(t => p[t.key] > 0).map(t => `${t.short} ${p[t.key]}`).join(' · ');
  const note = `진행한 작업: ${taskText}. 운영비 47만 원이 지출됐습니다.`;
  s.logs.push({ week: s.week, cashDelta: s.cash - before.cash, progressDelta: s.progress - before.progress, hypeDelta: s.hype - before.hype, note });
  addFeed(s, '운영 리포트', `${s.week}주 차 결산`, `진행도 ${signed(s.progress - before.progress)}%p · 관심 ${signed(s.hype - before.hype)} · 자금 ${signed(s.cash - before.cash)}만 원\n${note}`, 'system');
  if (s.fatigue >= 75) addFeed(s, '민재 · 선배 개발자', '건강도 자원입니다', '최근 밤샘이 많아 보입니다. 피로가 심해지면 개발 효율과 완성도가 떨어집니다. 한 주쯤은 쉬어도 됩니다.', 'chat');
  if (s.bugs >= 27) addFeed(s, '자동 QA', '버그 누적 경고', `현재 확인된 버그가 ${s.bugs}개입니다. 이 상태로 출시하면 사용자 평가에 악영향을 줄 수 있습니다.`, 'system');
  s.plan = zeroPlan();
  if (s.cash < -60) {
    s.phase = 'ended';
    s.result = makeResult(s, 'bankrupt');
    return s;
  }
  if (s.week >= MAX_WEEKS) {
    s.phase = 'ended';
    s.result = makeResult(s, 'unfinished');
    return s;
  }
  s.week++;
  const event = EVENTS.find(item => item.week === s.week);
  if (event) {
    s.pendingEvent = event.id;
    addFeed(s, event.character, event.title, event.body, 'mail');
  } else {
    const line = development > 0 ? '조금씩 게임의 윤곽이 보입니다.' : '개발하지 않은 주에도 회사의 시간은 흐릅니다.';
    addFeed(s, '운영실', `${s.week}주 차 시작`, line, 'system');
  }
  return s;
}
function signed(value: number) { return `${value > 0 ? '+' : ''}${value}`; }

function makeResult(s: State, type: 'released' | 'career' | 'bankrupt' | 'unfinished'): Result {
  if (type === 'career') return {
    title: '새로운 항구에 정박하다', subtitle: '칼립소의 섬이 꼭 실패는 아닙니다.',
    narrative: '정규직 개발자로 새로운 일을 시작하기로 했습니다. 창업했던 시간과 완성하지 못한 게임은 사라지지 않습니다. 훗날 다시 출항할지도 모릅니다.',
    released: false, sales: 0, income: 0, finalCash: s.cash, grade: '진로 변경',
  };
  if (type === 'bankrupt') return {
    title: '거센 파도 앞에서', subtitle: '자금이 바닥나 운영을 지속할 수 없게 됐습니다.',
    narrative: '프로젝트는 중단됐지만, 개발 경험과 플레이테스트 기록은 남았습니다. 처음의 목표를 이루지 못했다고 항해했던 시간이 사라지는 것은 아닙니다.',
    released: false, sales: 0, income: 0, finalCash: s.cash, grade: '운영 중단',
  };
  if (type === 'unfinished') return {
    title: '아직 항해 중', subtitle: '16주가 지났지만 출시 결정을 내리지 못했습니다.',
    narrative: '게임은 완성보다 시간이 필요했을지 모릅니다. 출시를 미룬 선택에도 이유는 있습니다. 다음 항해에서는 무엇을 다르게 할까요?',
    released: false, sales: 0, income: 0, finalCash: s.cash, grade: '미출시',
  };
  // 예측 가능한 공식이므로 같은 상태에서 다시 출시하면 같은 결과가 나옵니다.
  const publisherBoost = s.flags.includes('signed-publisher') ? 1.22 : s.flags.includes('negotiated-publisher') ? 1.08 : 1;
  const testedBoost = s.flags.includes('listened-to-tester') ? 1.04 : 1;
  const reviewPenalty = s.flags.includes('sent-review-build') && s.bugs > 18 ? 0.76 : 1;
  const base = s.hype * 20 + s.quality * 13 + s.progress * 5 - s.bugs * 31;
  const sales = Math.max(40, Math.round(base * publisherBoost * testedBoost * reviewPenalty));
  const income = Math.round(sales * (s.flags.includes('signed-publisher') ? 0.62 : 1.05)); // 단위 만원
  const earned = income + s.cash;
  const grade = sales >= 2800 ? '흥행 성공' : sales >= 1200 ? '작지만 의미 있는 성과' : '조용한 출시';
  const isHit = sales >= 2800;
  return {
    title: isHit ? '마침내, 나의 이타카' : '세상에 나온 첫 게임',
    subtitle: `『${s.project}』 출시 · ${grade}`,
    narrative: s.autonomy < 70
      ? '긴 항해 끝에 게임을 출시했습니다. 다만 완성된 게임에는 당신뿐 아니라 다른 사람의 결정도 새겨져 있습니다. 처음 꿈꾸었던 이타카와 지금의 이타카는 같은 모습인가요?'
      : '당신은 결국 게임을 완성해 세상에 내놓았습니다. 결과가 어떻든 다른 이가 대신할 수 없는 결정을 수없이 내렸습니다. 이곳이 당신이 꿈꾸던 이타카인가요?',
    released: true, sales, income, finalCash: earned, grade,
  };
}
export function releaseGame(old: State): State {
  if (old.phase !== 'playing' || old.pendingEvent || old.progress < 65) return old;
  const s = structuredClone(old);
  s.phase = 'ended';
  s.result = makeResult(s, 'released');
  addFeed(s, '스토어', '게임 출시 완료', `『${s.project}』이(가) 출시됐습니다. 첫 판매 결과가 정산되었습니다.`, 'system');
  return s;
}

/** 자유 입력은 외부 AI와 연결하지 않은 간단한 명령어 파서입니다. */
export function messageCommand(old: State, raw: string): State {
  const text = raw.trim().slice(0, 300);
  if (!text || old.phase !== 'playing') return old;
  let s = structuredClone(old);
  addFeed(s, '나', '메신저', text, 'player');
  if (s.pendingEvent) {
    addFeed(s, '민재 · 선배 개발자', '메시지', '먼저 받은 제안에 답해주세요. 사건 선택은 메일 화면 위쪽에서 할 수 있습니다.', 'chat');
    return s;
  }
  const mapping: { regex: RegExp; key: TaskKey }[] = [
    { regex: /버그|QA|테스트|오류/, key: 'fix' },
    { regex: /홍보|마케팅|SNS|커뮤니티/, key: 'market' },
    { regex: /외주|알바|아르바이트|돈 벌|수익/, key: 'freelance' },
    { regex: /휴식|쉬자|쉰다|쉬고|쉬기|잠/, key: 'rest' },
    { regex: /완성도|다듬|폴리싱|품질/, key: 'polish' },
    { regex: /개발|코딩|기능|구현/, key: 'build' },
  ];
  const match = mapping.find(m => m.regex.test(text));
  if (!match) {
    addFeed(s, '민재 · 선배 개발자', '메시지', '무슨 뜻인지 정확히 이해하지 못했어요. 지금은 규칙 기반 명령만 지원합니다. 예: “개발 2”, “버그 수정 1”, “홍보 1”, “외주 2”, “휴식 1”.', 'chat');
    return s;
  }
  const number = text.match(/[1-5]/)?.[0];
  const asked = number ? Number(number) : 1;
  const possible = Math.max(0, ACTION_POINTS - plannedPoints(s));
  const count = Math.min(asked, possible);
  if (count === 0) {
    addFeed(s, '민재 · 선배 개발자', '메시지', '이번 주 작업 시간이 이미 가득 찼습니다. 작업실에서 기존 계획을 줄이거나 이번 주를 마감해 주세요.', 'chat');
    return s;
  }
  s.plan[match.key] += count;
  const task = TASKS.find(t => t.key === match.key)!;
  addFeed(s, '민재 · 선배 개발자', '작업 계획 업데이트', `확인했습니다. 이번 주 계획에 “${task.short}” ${count}칸을 추가했어요. 작업실에서도 확인할 수 있습니다.`, 'chat');
  return s;
}

export function isValidSave(candidate: unknown): candidate is State {
  if (!candidate || typeof candidate !== 'object') return false;
  const s = candidate as Partial<State>;
  return s.version === 1 && (s.phase === 'setup' || s.phase === 'playing' || s.phase === 'ended')
    && typeof s.week === 'number' && typeof s.cash === 'number'
    && typeof s.studio === 'string' && typeof s.project === 'string'
    && !!s.plan && Array.isArray(s.feed) && Array.isArray(s.logs);
}
