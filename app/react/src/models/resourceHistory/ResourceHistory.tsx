// try to keep this alphabetically ordered, easier to search
export type ResourceType =
  | 'AD'
  | 'AD_GROUP'
  | 'AD_EXCHANGE'
  | 'AD_EXCHANGE_SELECTION'
  | 'AUDIENCE_SEGMENT'
  | 'AUDIENCE_SEGMENT_EMAIL_SELECTION'
  | 'AUDIENCE_SEGMENT_SELECTION'
  | 'CAMPAIGN'
  | 'CREATIVE'
  | 'DISPLAY_CAMPAIGN'
  | 'DISPLAY_NETWORK'
  | 'DISPLAY_NETWORK_SELECTION'
  | 'EMAIL_BLAST'
  | 'EMAIL_CAMPAIGN'
  | 'EMAIL_ROUTER'
  | 'EMAIL_ROUTER_SELECTION'
  | 'EMAIL_TEMPLATE_SELECTION'
  | 'QUERY_EXPORT'
  | 'GEONAME'
  | 'GEO_TARGETING_SELECTION'
  | 'GOAL'
  | 'GOAL_SELECTION';

export type EventType =
  | 'CREATE_EVENT'
  | 'UPDATE_EVENT'
  | 'DELETE_EVENT'
  | 'CREATE_LINK_EVENT'
  | 'DELETE_LINK_EVENT'
  | 'ALERT_EVENT';

export type HistoryEventType = 'ACTION' | 'ALERT';

export interface ResourceHistoryResource {
  resource_type: ResourceType;
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

export type ResourceLinkDirection = 'PARENT' | 'CHILD';

export type ResourceLinkHelper = {
  [propertyName in ResourceType]?: {
    direction: ResourceLinkDirection;
    getType: () => React.ReactNode;
    getName: (id: string) => Promise<string>;
    goToResource: (id: string) => void;
  };
};

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

export interface HistoryLinkEventResource extends HistoryEventResource {
  event_type: 'ACTION';
  field_name: string;
  resource_type: ResourceType;
  resource_id: string;
  resourceName?: string;
}

export interface HistoryCreateLinkEventResource extends HistoryLinkEventResource {
  type: 'CREATE_LINK_EVENT';
}

export interface HistoryDeleteLinkEventResource extends HistoryLinkEventResource {
  type: 'DELETE_LINK_EVENT';
}

export type HistoryEventActionShape =
  | HistoryCreateEventResource
  | HistoryUpdateEventResource
  | HistoryDeleteEventResource
  | HistoryLinkEventResource
  | HistoryCreateLinkEventResource
  | HistoryDeleteLinkEventResource;

export type HistoryEventShape = HistoryEventActionShape | HistoryAlertEventResource;

export function isHistoryCreateEvent(
  model: HistoryEventShape,
): model is HistoryCreateEventResource {
  return model.type === 'CREATE_EVENT';
}

export function isHistoryUpdateEvent(
  model: HistoryEventShape,
): model is HistoryUpdateEventResource {
  return model.type === 'UPDATE_EVENT';
}

export function isHistoryDeleteEvent(
  model: HistoryEventShape,
): model is HistoryDeleteEventResource {
  return model.type === 'DELETE_EVENT';
}

export function isHistoryLinkEvent(model: HistoryEventShape): model is HistoryLinkEventResource {
  return model.type === 'CREATE_LINK_EVENT' || model.type === 'DELETE_LINK_EVENT';
}

export function isHistoryCreateLinkEvent(
  model: HistoryEventShape,
): model is HistoryCreateLinkEventResource {
  return model.type === 'CREATE_LINK_EVENT';
}

export function isHistoryDeleteLinkEvent(
  model: HistoryEventShape,
): model is HistoryDeleteLinkEventResource {
  return model.type === 'DELETE_LINK_EVENT';
}

export function isHistoryEventAction(model: HistoryEventShape): model is HistoryEventActionShape {
  return model.event_type === 'ACTION';
}
