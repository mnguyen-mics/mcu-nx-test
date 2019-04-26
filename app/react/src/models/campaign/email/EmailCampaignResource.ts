import { CampaignStatus } from '../CampaignStatus';
import { EmailBlastStatus } from './EmailBlastStatus';

export interface EmailCampaignCreateRequest {
  organisation_id: string;
  name: string;
  creation_ts: string;
  editor_versionid: string;
  editor_version_value: string;
  editor_groupid: string;
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
