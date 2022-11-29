export type ExternalFeedType = 'EXTERNAL';
export type ExternalFeedSessionStatus =
  | 'INITIAL'
  | 'BOOTING'
  | 'INITIAL_LOADING'
  | 'LIVE'
  | 'CLOSING'
  | 'CLOSED';

export interface ExternalFeedSession {
  type: ExternalFeedType;
  id: string;
  datamart_id: string;
  audience_segment_id: string;
  open: boolean;
  status: ExternalFeedSessionStatus;
  open_date: number;
}
