import { CampaignsOptions } from './DisplayCampaignService';
import { ApiService } from '@mediarithmics-private/advanced-components';
import {
  DataListResponse,
  DataResponse,
} from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import {
  EmailCampaignResource,
  EmailRouterSelectionResource,
  EmailBlastResource,
  EmailTemplateSelectionResource,
} from '../models/campaign/email';
import { ConsentSelectionResource } from '../models/consent';
import { AudienceSegmentSelectionResource } from '../models/audiencesegment';
import { injectable } from 'inversify';

const EMAIL_CAMPAIGNS_BASE_URL = `email_campaigns`;

export interface IEmailCampaignService {
  getEmailCampaign: (campaignId: string) => Promise<DataResponse<EmailCampaignResource>>;

  getEmailCampaigns: (
    organisationId: string,
    campaignType: 'EMAIL',
    options?: CampaignsOptions,
  ) => Promise<DataListResponse<EmailCampaignResource>>;

  deleteEmailCampaign: (campaignId: string) => Promise<DataResponse<EmailCampaignResource>>;

  createEmailCampaign: (
    organisationId: string,
    resource: Partial<EmailCampaignResource>,
  ) => Promise<DataResponse<EmailCampaignResource>>;

  updateEmailCampaign: (
    campaignId: string,
    resource: Partial<EmailCampaignResource>,
  ) => Promise<DataResponse<EmailCampaignResource>>;

  archiveEmailCampaign: (campaignId: string) => Promise<DataResponse<EmailCampaignResource>>;

  getRouters: (campaignId: string) => Promise<DataListResponse<EmailRouterSelectionResource>>;

  getRouter: (
    campaignId: string,
    routerId: string,
  ) => Promise<DataResponse<EmailRouterSelectionResource>>;

  createRouter: (
    campaignId: string,
    resource: Partial<EmailRouterSelectionResource>,
  ) => Promise<DataResponse<EmailRouterSelectionResource>>;

  deleteRouter: (
    campaignId: string,
    routerSelectionId: string,
  ) => Promise<DataResponse<EmailRouterSelectionResource>>;

  getBlasts: (campaignId: string) => Promise<DataListResponse<EmailBlastResource>>;

  getBlast: (campaignId: string, blastId: string) => Promise<DataResponse<EmailBlastResource>>;

  createBlast: (
    campaignId: string,
    resource: Partial<EmailBlastResource>,
  ) => Promise<DataResponse<EmailBlastResource>>;

  updateBlast: (
    campaignId: string,
    blastId: string,
    resource: Partial<EmailBlastResource>,
  ) => Promise<DataResponse<EmailBlastResource>>;

  deleteBlast: (campaignId: string, blastId: string) => Promise<DataResponse<EmailBlastResource>>;

  getEmailTemplates: (
    campaignId: string,
    blastId: string,
  ) => Promise<DataListResponse<EmailTemplateSelectionResource>>;

  createEmailTemplate: (
    campaignId: string,
    blastId: string,
    resource: Partial<EmailTemplateSelectionResource>,
  ) => Promise<DataResponse<EmailTemplateSelectionResource>>;

  deleteEmailTemplate: (
    campaignId: string,
    blastId: string,
    templateSelectionId: string,
  ) => Promise<DataResponse<EmailTemplateSelectionResource>>;

  getConsents: (
    campaignId: string,
    blastId: string,
  ) => Promise<DataListResponse<ConsentSelectionResource>>;

  createConsent: (
    campaignId: string,
    blastId: string,
    resource: Partial<ConsentSelectionResource>,
  ) => Promise<DataListResponse<ConsentSelectionResource>>;

  deleteConsent: (
    campaignId: string,
    blastId: string,
    consentSelectionId: string,
  ) => Promise<DataResponse<ConsentSelectionResource>>;

  getSegments: (
    campaignId: string,
    blastId: string,
  ) => Promise<DataListResponse<AudienceSegmentSelectionResource>>;

  createSegment: (
    campaignId: string,
    blastId: string,
    resource: Partial<AudienceSegmentSelectionResource>,
  ) => Promise<DataResponse<AudienceSegmentSelectionResource>>;

  deleteSegment: (
    campaignId: string,
    blastId: string,
    segmentSelectionId: string,
  ) => Promise<DataResponse<AudienceSegmentSelectionResource>>;

  computeSegmentReach: (
    datamartId: string,
    segmentIds: string[],
    providerTechnicalNames: string[],
  ) => Promise<number>;
}

@injectable()
export class EmailCampaignService implements IEmailCampaignService {
  getEmailCampaign(campaignId: string): Promise<DataResponse<EmailCampaignResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}`;
    return ApiService.getRequest(endpoint);
  }

  getEmailCampaigns(
    organisationId: string,
    campaignType: 'EMAIL',
    options: CampaignsOptions = {},
  ): Promise<DataListResponse<EmailCampaignResource>> {
    const endpoint = 'campaigns';

    const params = {
      organisation_id: organisationId,
      campaign_type: campaignType,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  deleteEmailCampaign(campaignId: string): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}`;
    return ApiService.deleteRequest(endpoint);
  }

  createEmailCampaign(
    organisationId: string,
    resource: Partial<EmailCampaignResource>,
  ): Promise<DataResponse<EmailCampaignResource>> {
    const params = { organisation_id: organisationId };
    const body = {
      ...resource,
      organisation_id: organisationId,
      type: 'EMAIL',
      editor_version_id: '17',
    };

    return ApiService.postRequest(EMAIL_CAMPAIGNS_BASE_URL, body, params);
  }

  updateEmailCampaign(
    campaignId: string,
    resource: Partial<EmailCampaignResource>,
  ): Promise<DataResponse<EmailCampaignResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}`;
    return ApiService.putRequest(endpoint, { ...resource, type: 'EMAIL' });
  }

  archiveEmailCampaign(campaignId: string): Promise<DataResponse<EmailCampaignResource>> {
    return this.updateEmailCampaign(campaignId, {
      archived: true,
    });
  }

  getRouters(campaignId: string): Promise<DataListResponse<EmailRouterSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_routers`;
    return ApiService.getRequest(endpoint);
  }

  getRouter(
    campaignId: string,
    routerId: string,
  ): Promise<DataResponse<EmailRouterSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_routers/${routerId}`;
    return ApiService.getRequest(endpoint);
  }

  createRouter(
    campaignId: string,
    resource: Partial<EmailRouterSelectionResource>,
  ): Promise<DataResponse<EmailRouterSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_routers`;
    return ApiService.postRequest(endpoint, resource);
  }

  deleteRouter(campaignId: string, routerSelectionId: string): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_routers/${routerSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getBlasts(campaignId: string): Promise<DataListResponse<EmailBlastResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts`;
    return ApiService.getRequest(endpoint);
  }

  getBlast(campaignId: string, blastId: string): Promise<DataResponse<EmailBlastResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}`;
    return ApiService.getRequest(endpoint);
  }

  createBlast(
    campaignId: string,
    resource: Partial<EmailBlastResource>,
  ): Promise<DataResponse<EmailBlastResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts`;
    return ApiService.postRequest(endpoint, resource);
  }

  updateBlast(
    campaignId: string,
    blastId: string,
    resource: Partial<EmailBlastResource>,
  ): Promise<DataResponse<EmailBlastResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}`;
    return ApiService.putRequest(endpoint, resource);
  }

  deleteBlast(campaignId: string, blastId: string): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getEmailTemplates(
    campaignId: string,
    blastId: string,
  ): Promise<DataListResponse<EmailTemplateSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_templates`;
    return ApiService.getRequest(endpoint);
  }

  createEmailTemplate(
    campaignId: string,
    blastId: string,
    resource: Partial<EmailTemplateSelectionResource>,
  ): Promise<DataResponse<EmailTemplateSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_templates`;
    return ApiService.postRequest(endpoint, resource);
  }

  deleteEmailTemplate(
    campaignId: string,
    blastId: string,
    templateSelectionId: string,
  ): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_templates/${templateSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getConsents(
    campaignId: string,
    blastId: string,
  ): Promise<DataListResponse<ConsentSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_consents`;
    return ApiService.getRequest(endpoint);
  }

  createConsent(
    campaignId: string,
    blastId: string,
    resource: Partial<ConsentSelectionResource>,
  ): Promise<DataListResponse<ConsentSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_consents`;
    return ApiService.postRequest(endpoint, resource);
  }

  deleteConsent(campaignId: string, blastId: string, consentSelectionId: string): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/email_consents/${consentSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  getSegments(
    campaignId: string,
    blastId: string,
  ): Promise<DataListResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/audience_segments`;
    return ApiService.getRequest(endpoint);
  }

  createSegment(
    campaignId: string,
    blastId: string,
    resource: Partial<AudienceSegmentSelectionResource>,
  ): Promise<DataResponse<AudienceSegmentSelectionResource>> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/audience_segments`;
    return ApiService.postRequest(endpoint, resource);
  }

  deleteSegment(campaignId: string, blastId: string, segmentSelectionId: string): Promise<any> {
    const endpoint = `${EMAIL_CAMPAIGNS_BASE_URL}/${campaignId}/email_blasts/${blastId}/audience_segments/${segmentSelectionId}`;
    return ApiService.deleteRequest(endpoint);
  }

  computeSegmentReach(
    datamartId: string,
    segmentIds: string[],
    providerTechnicalNames: string[],
  ): Promise<number> {
    const endpoint = `datamarts/${datamartId}/email_blast_query`;

    const params = {
      segment_ids: segmentIds,
      provider_technical_names: providerTechnicalNames,
    };

    return ApiService.getRequest(endpoint, params).then(res => (res as any).count);
  }
}

export default EmailCampaignService;
