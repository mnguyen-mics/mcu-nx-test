export interface DatamartResource {
  id: string;
  name: string;
  organisation_id: string;
  token: string;
  creation_date: Date;
  time_zone: string; // DateTimeZone ?
  type: DatamartType;
  datafarm: string;
}

type DatamartType = 'DATAMART' | 'CROSS_DATAMART';