import {
  EmailCampaignResource,
  EmailCampaignCreateRequest,
  EmailBlastResource,
  EmailBlastCreateRequest,
  EmailRouterSelectionResource,
  EmailTemplateSelectionResource,
  EmailTemplateSelectionCreateRequest,
} from '../../../../models/campaign/email';

import {
  AudienceSegmentSelectionResource,
  AudienceSegmentSelectionCreateRequest,
} from '../../../../models/audiencesegment';

import { ConsentSelectionResource } from '../../../../models/consent';

import { FieldArrayModel, FieldArrayModelWithMeta } from '../../../../utils/FormHelper';

export interface EditEmailCampaignRouteMatchParam {
  organisationId: string;
  campaignId?: string;
}

export interface EditEmailBlastRouteMatchParam {
  organisationId: string;
  campaignId: string;
  blastId?: string;
}

export type TemplateFieldModel = FieldArrayModelWithMeta<
  EmailTemplateSelectionResource | EmailTemplateSelectionCreateRequest,
  { name: string }
>;
export type ConsentFieldModel = FieldArrayModel<ConsentSelectionResource>;
export type SegmentFieldModel = FieldArrayModelWithMeta<
  AudienceSegmentSelectionResource | AudienceSegmentSelectionCreateRequest,
  { name: string }
>;
export type RouterFieldModel = FieldArrayModel<EmailRouterSelectionResource>;
export type BlastFieldModel = FieldArrayModel<EmailBlastFormData>;

export interface EmailCampaignFormData {
  campaign: Partial<EmailCampaignCreateRequest> | EmailCampaignResource;
  blastFields: BlastFieldModel[];
  routerFields: RouterFieldModel[];
}
export interface EmailBlastFormData {
  blast: Partial<EmailBlastCreateRequest> | EmailBlastResource;
  templateFields: TemplateFieldModel[];
  consentFields: ConsentFieldModel[];
  segmentFields: SegmentFieldModel[];
}

export const INITIAL_EMAIL_BLAST_FORM_DATA = {
  blast: {},
  templateFields: [],
  consentFields: [],
  segmentFields: [],
};

export const INITIAL_EMAIL_CAMPAIGN_FORM_DATA = {
  campaign: {},
  blastFields: [],
  routerFields: [],
};
