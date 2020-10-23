export type CreativeType =
  'DISPLAY_AD' |
  'VIDEO_AD' |
  'EMAIL_TEMPLATE' |
  'LANDING_PAGE';

export type CreativeSubtype =
  'BANNER' |
  'VIDEO' |
  'FACEBOOK_RIGHT_HAND_SIDE' |
  'FACEBOOK_NEWS_FEED' |
  'NATIVE';

export type CreativeStatus =
  'DRAFT' |
  'PENDING' |
  'PUBLISHED' |
  'ARCHIVED';

export type CreativeAuditStatus =
  'NOT_AUDITED' |
  'AUDIT_PENDING' |
  'AUDIT_FAILED' |
  'AUDIT_PASSED' |
  'AUDIT_PARTIALLY_PASSED';

export type CreativeAuditAction =
  'START_AUDIT' |
  'FAIL_AUDIT' |
  'PASS_AUDIT' |
  'RESET_AUDIT';

export type CreativeScreenshotStatus =
  'NOT_TAKEN' |
  'PENDING' |
  'PROCESSING' |
  'SUCCEEDED' |
  'FAILED';

export type AdType = 'DISPLAY_AD' | 'VIDEO_AD';
export interface AdFormatResource {
  id: string;
  width: number;
  height: number;
  type: AdType;
}

export interface GenericCreativeResource {
  id: string;
  organisation_id: string;
  name: string;
  technical_name: string;
  archived: boolean;
  editor_version_id: string;
  editor_version_value: string;
  editor_group_id: string;
  editor_artifact_id: string;
  editor_plugin_id: string;
  renderer_version_id: string;
  renderer_version_value: string;
  renderer_group_id: string;
  renderer_artifact_id: string;
  renderer_plugin_id: string;
  creation_date: string;
  subtype: CreativeSubtype;
}

export interface DisplayAdCreateRequest extends GenericCreativeResource {
  type: 'DISPLAY_AD';
  format: string;
  destination_domain: string;
}

export interface DisplayAdResource extends DisplayAdCreateRequest {
  id: string;
  published_version: number;
  creative_kit: string;
  ad_layout: string;
  locale: string;  
  audit_status: CreativeAuditStatus;
  available_user_audit_actions: CreativeAuditAction[];
}

export interface VideoAdResource extends GenericCreativeResource {
  id: string;
  type: 'VIDEO_AD';
  format: string;
  published_version: number;
  creative_kit: string;
  locale: string;
  destination_domain: string;
  audit_status: CreativeAuditStatus;
  available_user_audit_actions: CreativeAuditAction[];
}

export interface EmailTemplateResource extends GenericCreativeResource {
  id: string;
  type: 'EMAIL_TEMPLATE';
}

export type CreativeResourceShape =
  DisplayAdResource |
  VideoAdResource |
  EmailTemplateResource;

export type AuditStatus =
  'AUDIT_PENDING' |
  'AUDIT_FAILURE' |
  'AUDIT_SUCCESS';

export interface AuditStatusResource {
  display_network: string;
  date: number;
  status: AuditStatus;
  feedback: string;
}

export interface CreativeScreenshotResource {
  id: string;
  creative_id: string;
  status: CreativeScreenshotStatus;
  url: string;
  os: string;
  os_version: string;
  browser: string;
  browser_version: string;
  creation_ts: string;
}
