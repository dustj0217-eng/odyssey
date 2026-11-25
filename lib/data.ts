import type { ActionId, CardId, Slot, WeekSchedule } from './types';

export const DATA = {
  STORAGE_KEY: 'ithaca-next-v03-save',
  ACTIONS: {
    develop: {label:'내 게임 개발', slots:['day','night'], hint:'개발 진척과 품질. 실력과 피로에 영향을 받습니다.'},
    freelance: {label:'외주 작업', slots:['day','night'], hint:'개인 수입. 실력과 마감에 영향을 받습니다.'},
    marketing: {label:'홍보 / 소통', slots:['day','night'], hint:'회사 돈을 사용해 인지도를 높입니다.'},
    study: {label:'공부 / 연습', slots:['day','night'], hint:'기술 실력을 천천히 쌓습니다.'},
    rest: {label:'휴식 / 생활', slots:['day','night'], hint:'건강과 인간관계를 돌봅니다.'},
    job: {label:'회사 근무', slots:['day'], hint:'칼립소의 회사에서 업무를 수행합니다.'}
  } satisfies Record<ActionId, {label:string; slots:Slot[]; hint:string}>,
  DEFAULT_SCHEDULE: [
    {day:'develop',night:'rest'},
    {day:'develop',night:'freelance'},
    {day:'develop',night:'rest'},
    {day:'marketing',night:'rest'}
  ] as WeekSchedule[],
  CARD_IMAGES: {
    poseidon:'/cards/poseidon.webp', helios:'/cards/helios.webp', circe:'/cards/circe.webp',
    shipwreck:'/cards/shipwreck.webp', calypso:'/cards/calypso.webp'
  } satisfies Record<CardId,string>,
  MONTH_NAMES: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  INITIAL_COMPANY_CASH: 760,
  INITIAL_PERSONAL_CASH: 160,
  MONTHLY_COMPANY_OVERHEAD: 165,
  MONTHLY_PERSONAL_COST: 42,
  FREELANCE_BASE: 48,
};

export const ACTION_IDS = Object.keys(DATA.ACTIONS) as ActionId[];
