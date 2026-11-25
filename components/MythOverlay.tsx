import { DATA } from '@/lib/data';
import { Story } from '@/lib/story';
import type { EventId } from '@/lib/types';

export function MythOverlay({eventId,onChoose}:{eventId:EventId|null;onChoose:(id:string)=>void}){
  if(!eventId)return null;
  const event=Story.events[eventId];
  if(event.kind!=='myth')return null;
  return <div className="myth-backdrop"><section className="myth-dialog" role="dialog" aria-modal="true" aria-labelledby="myth-heading">
    <div className="event-mark">✦ MYTH EVENT ✦</div>
    {event.image&&<img className="myth-image" src={DATA.CARD_IMAGES[event.image]} alt={`${event.title} 신화 카드`}/>}
    <h2 className="myth-title" id="myth-heading">{event.title}</h2>
    <p className="myth-text">{event.body}</p>
    {event.choices.map((choice,index)=><button key={choice.id} className={`button ${index===0?'primary':'secondary'}`} onClick={()=>onChoose(choice.id)}>{choice.text}</button>)}
  </section></div>;
}
