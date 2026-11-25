import { Icon } from './GameUI';
import { DATA } from '@/lib/data';
import { Story } from '@/lib/story';
import type { EventId } from '@/lib/types';

export function MythOverlay({eventId,onChoose}:{eventId:EventId|null;onChoose:(id:string)=>void}){
  if(!eventId)return null;
  const event=Story.events[eventId];
  if(event.kind!=='myth')return null;
  return <div className="myth-backdrop">
    <section className="myth-dialog" role="dialog" aria-modal="true" aria-labelledby="myth-heading">
      <div className="event-mark">
        특별한 사건
      </div>
      {event.image&&<img className="myth-image" src={DATA.CARD_IMAGES[event.image]} alt={`${event.title} 신화 카드`}/>}
      <h2 className="myth-title" id="myth-heading">
        {event.title}
      </h2>
      <p className="myth-text">
        {event.body}
      </p>
      {event.choices.map((choice,index)=><button key={choice.id} className="choice-button" onClick={()=>onChoose(choice.id)}><span className="choice-number">{String(index+1).padStart(2,'0')}</span><span>{choice.text}</span><Icon name="arrow"/></button>)}
    </section>
  </div>;
}
