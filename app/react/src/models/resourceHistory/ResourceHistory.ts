export type ResourceName = 
  'AD_GROUP' |
  'DISPLAY_AD' |
  'DISPLAY_CAMPAIGN' |
  'EMAIL_CAMPAIGN' |
  'EMAIL_TEMPLATE' |
  'VIDEO_AD'

export type EventType =
  'CREATE_EVENT' |
  'UPDATE_EVENT' |
  'DELETE_EVENT' |
  'ALERT_EVENT';

export type HistoryEventType = 
  'ACTION' |
  'ALERT';


export interface ResourceHistoryResource {
  resource_name: ResourceName;
  resource_id: string;
  events: HistoryEventShape[];
}

export interface HistoryEventResource {
  timestamp: string;
  event_type: HistoryEventType;
  event_id: string;
  user_identification: UserIdentification;
  type: EventType;
}

export interface UserIdentification {
  user_id: string;
  user_agent: string;
  user_ipaddress: string;
  user_name: string;
}


export interface HistoryCreateEventResource extends HistoryEventResource {
  type: 'CREATE_EVENT';
  event_type: 'ACTION';
}

export interface HistoryUpdateEventResource extends HistoryEventResource {
  type: 'UPDATE_EVENT';
  event_type: 'ACTION';
  field_changed: string;
  old_value: string;
  new_value: string;
}

export interface HistoryDeleteEventResource extends HistoryEventResource {
  type: 'DELETE_EVENT';
  event_type: 'ACTION';
}

export interface HistoryAlertEventResource extends HistoryEventResource {
  type: 'ALERT_EVENT';
  event_type: 'ALERT';
  alert_code: string;
}

export type HistoryEventActionShape =
  HistoryCreateEventResource |
  HistoryUpdateEventResource |
  HistoryDeleteEventResource;

export type HistoryEventShape =
  HistoryEventActionShape |
  HistoryAlertEventResource;



export function isHistoryCreateEvent(model: HistoryEventShape): model is HistoryCreateEventResource {
  return model.type === 'CREATE_EVENT';
}

export function isHistoryUpdateEvent(model: HistoryEventShape): model is HistoryUpdateEventResource {
  // return (model as HistoryUpdateEventResource).old_value !== undefined;
  return model.type === 'UPDATE_EVENT';
}

export function isHistoryDeleteEvent(model: HistoryEventShape): model is HistoryDeleteEventResource {
  return model.type === 'DELETE_EVENT';
}

export function isHistoryEventAction(model: HistoryEventShape): model is HistoryEventActionShape {
  return model.event_type === 'ACTION';
}
// function f(rhr : ResourceHistoryResource) {
//   switch (rhr.events[0].type) {
//     case ''
//   }
// }


// export function convertHistoryEventToSubtype(historyEvent: HistoryEventShape) {
//   if (isHistoryEventAction(historyEvent)) {
//     if (isHistoryCreateEvent(historyEvent)) {return historyEvent}
//     else if (isHistoryUpdateEvent(historyEvent)) {return historyEvent}
//     else {return historyEvent}
//   }
//   else {
//     return historyEvent
//   }
// }
