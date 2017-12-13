import { CampaignStatus } from '../CampaignStatus';
import { EmailBlastStatus } from './EmailBlastStatus';

export interface EmailCampaignResource {
  id: string;
  organisationId: string;
  name: string;
  creation_ts: string;
  editor_versionid: string;
  editor_version_value: string;
  editor_groupid: string;
  editor_artifact_id: string;
  status: CampaignStatus;
  currency_code: string;
  technical_name?: string;
  archived: boolean;
}

export interface EmailBlastResource {
  id: string;
  blast_name: string;
  subject_line: string;
  from_email: string;
  from_name: string;
  reply_to: string;
  send_date: string;
  status: EmailBlastStatus;
  batch_size: number;
  number_mail_not_send: number;
}
