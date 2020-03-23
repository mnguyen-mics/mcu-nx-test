import { BaseExecutionResource } from '../Job';

export interface ChannelResource {
  creation_ts: number;
  datamart_id: string;
  id: string;
  name: string;
  organisation_id: string;
  token: string;
  visit_analyzer_model_id: string | null;
}

export interface ChannelAnalyticsResource {
  channel_id?: number;
  sessions?: number;
  user?: number;
}

export type ChannelResourceShape = MobileApplicationResource | SiteResource;

export type ChannelResourceShapeWithAnalytics = ChannelResourceShape & ChannelAnalyticsResource;

export type ChannelType = 'MOBILE_APPLICATION' | 'SITE';

export interface MobileApplicationResource extends ChannelResource {
  type: 'MOBILE_APPLICATION';
}

export interface MobileApplicationCreationResource
  extends Partial<ChannelResource> {
  type: 'MOBILE_APPLICATION';
}

export interface SiteResource extends ChannelResource {
  type: 'SITE';
  domain: string;
}

/*
 *
 * Event Rules
 *
 */

export interface EventRuleResource {
  id: string;
  site_id?: string;
  datamart_id: string;
}

export interface EventRuleCatalogAutoMatch extends EventRuleResource {
  type: 'CATALOG_AUTO_MATCH';
  add_category_to_item: boolean;
  auto_match_type: 'CATEGORY' | 'PRODUCT' | 'PRODUCT_AND_CATEGORY';
  category_max_depth?: number | null;
  excluded_categories: string[];
}

export interface EventRuleUrlMatch extends EventRuleResource {
  type: 'URL_MATCH';
  pattern: string;
  event_template: {
    $event_name: string;
    $properties: any;
  };
}

export interface EventRuleUserIdentifierInsertion extends EventRuleResource {
  type: 'USER_IDENTIFIER_INSERTION';
  hash_function:
    | 'MD2'
    | 'NO_HASH'
    | 'SHA_256'
    | 'MD5'
    | 'SHA_1'
    | 'SHA_384'
    | 'SHA_512';
  identifier_creation: 'USER_ACCOUNT' | 'EMAIL_HASH';
  property_source: string;
  remove_source: boolean;
  salt?: string | null;
  to_lower_case: boolean;
  validation_regexp?: string | null;
  compartment_id?: string | null;
}

export interface EventRulePropertyToOriginCopy extends EventRuleResource {
  type: 'PROPERTY_TO_ORIGIN_COPY';
  destination: string;
  property_name: string;
  property_source: 'URL' | 'EVENT_PROPERTY' | 'REFERRER';
}

export type EventRules =
  | EventRuleUrlMatch
  | EventRuleUserIdentifierInsertion
  | EventRuleCatalogAutoMatch
  | EventRulePropertyToOriginCopy;

/*
 * aliases
 */

export interface Aliases {
  id: string;
  organisation_id: string;
  site_id: string;
  name: string;
}

export type ReplicationType = 'GOOGLE_PUBSUB';

export type ReplicationStatus = 'PAUSED' | 'ACTIVE' | 'ERROR';

export type DatamartReplicationResourceShape = PubSubReplicationResource;

export interface DatamartReplicationResource {
  id: string;
  name: string;
  datamart_id: string;
  type: ReplicationType;
  status: ReplicationStatus;
}

export interface PubSubReplicationResource extends DatamartReplicationResource {
  credentials_uri: string;
  project_id: string;
  topic_id: string;
}

// Waiting for backend
interface DatamartReplicationJobExecutionParameters {}
interface DatamartReplicationJobExecutionResult {
  total_failure?: number;
}

export type DatamartReplicationJobExecutionResource = BaseExecutionResource<
  DatamartReplicationJobExecutionParameters,
  DatamartReplicationJobExecutionResult
>;
