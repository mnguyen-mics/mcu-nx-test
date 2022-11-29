import { EmailBlastStatus } from './EmailBlastStatus';
import { CampaignStatus } from '../constants';

export interface EmailCampaignCreateRequest {
  organisation_id: string;
  name: string;
  creation_ts: number;
  editor_version_id: string;
  editor_version_value: string;
  editor_group_id: string;
  editor_artifact_id: string;
  currency_code: string;
  technical_name: string;
  type: string;
  automated: boolean;
}

export interface EmailCampaignResource extends EmailCampaignCreateRequest {
  id: string;
  status: CampaignStatus;
  archived: boolean;
}

export interface EmailBlastCreateRequest {
  blast_name: string;
  subject_line: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  send_date: number;
  batch_size: number;
}

export interface EmailBlastResource extends EmailBlastCreateRequest {
  id: string;
  status: EmailBlastStatus;
  number_mail_not_send?: number;
}

export interface EmailCampaignResourceWithStats extends EmailCampaignResource {
  email_sent?: number;
  email_hard_bounced?: number;
  email_soft_bounced?: number;
  clicks?: number;
  impressions?: number;
}
