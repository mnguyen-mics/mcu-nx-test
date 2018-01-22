import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  CreativeType,
  GenericCreativeResource,
  CreativeStatus,
  CreativeResourceShape,
  DisplayAdResource,
  EmailTemplateResource,
  AdFormatResource,
  AdType,
  AuditStatusResource,
  CreativeAuditAction,
  CreativeScreenshotResource,
} from '../models/creative/CreativeResource';
import { PropertyResourceShape } from '../models/plugin/index';
import PluginService from './PluginService';

export interface GetCreativesOptions {
  creative_type?: CreativeType;
  scope?: string;
  keywords?: string[];
  statuses?: CreativeStatus[];
  archived?: boolean;
  label_ids?: string[];
  order_by?: string[];
  first_result?: number;
  max_results?: number;
}

const CreativeService = {
  getCreatives<T extends GenericCreativeResource>(
    organisationId: string,
    options: GetCreativesOptions = {},
  ): Promise<DataListResponse<T>> {
    const endpoint = 'creatives';

    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  },

  getCreative(
    creativeId: string,
  ): Promise<DataResponse<CreativeResourceShape>> {
    const endpoint = `creatives/${creativeId}`;
    return ApiService.getRequest(endpoint);
  },

  getDisplayAds(
    organisationId: string,
    options: GetCreativesOptions = {},
  ): Promise<DataListResponse<DisplayAdResource>> {
    return CreativeService.getCreatives(organisationId, {
      creative_type: 'DISPLAY_AD',
      ...options,
    });
  },

  getEmailTemplates(
    organisationId: string,
    options: GetCreativesOptions = {},
  ): Promise<DataListResponse<EmailTemplateResource>> {
    return CreativeService.getCreatives(organisationId, {
      creative_type: 'EMAIL_TEMPLATE',
      ...options,
    });
  },

  getEmailTemplate(
    templateId: string,
  ): Promise<DataResponse<EmailTemplateResource>> {
    return CreativeService.getCreative(templateId) as Promise<
      DataResponse<EmailTemplateResource>
    >;
  },

  getDisplayAd(
    displayAdId: string,
  ): Promise<DataResponse<DisplayAdResource>> {
    return CreativeService.getCreative(displayAdId) as Promise<DataResponse<DisplayAdResource>>;
  },

  getCreativeFormats(
    organisationId: string,
    options: {
      width?: number;
      height?: number;
      type?: AdType;
    } = {},
  ): Promise<DataListResponse<AdFormatResource>> {
    const endpoint = 'reference_tables/formats';
    const params = {
      ...options,
      organisation_id: organisationId,
    };
    return ApiService.getRequest(endpoint, params);
  },

  createDisplayCreative(
    organisationId: string,
    resource: Partial<DisplayAdResource>,
  ): Promise<DataResponse<DisplayAdResource>> {
    const endpoint = 'display_ads';
    const body = {
      ...resource,
      type: 'DISPLAY_AD',
      organisation_id: organisationId,
    };
    return ApiService.postRequest(endpoint, body);
  },

  createEmailTemplate(
    organisationId: string,
    resource: Partial<EmailTemplateResource>,
  ): Promise<DataResponse<EmailTemplateResource>> {
    const endpoint = 'email_templates';
    const body = {
      ...resource,
      type: 'EMAIL_TEMPLATE',
      organisation_id: organisationId,
    };
    return ApiService.postRequest(endpoint, body);
  },

  updateDisplayCreative(
    creativeId: string,
    resource: Partial<DisplayAdResource>,
  ): Promise<DataResponse<DisplayAdResource>> {
    const endpoint = `display_ads/${creativeId}`;
    return ApiService.putRequest(endpoint, resource);
  },

  updateEmailTemplate(
    creativeId: string,
    resource: Partial<EmailTemplateResource>,
  ): Promise<DataResponse<EmailTemplateResource>> {
    const endpoint = `email_templates/${creativeId}`;
    return ApiService.putRequest(endpoint, resource);
  },

  updateDisplayCreativeRendererProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<any> | any> {
    const endpoint = `display_ads/${id}/renderer_properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(params, organisationId, 'display_ads', id, endpoint);
  },

  updateEmailTemplateProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<any> | any> {
    const endpoint = `email_templates/${id}/renderer_properties/technical_name=${technicalName}`;
    return PluginService.handleSaveOfProperties(params, organisationId, 'email_templates', id, endpoint);
  },

  getCreativeRendererProperties(
    creativeId: string,
  ): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `display_ads/${creativeId}/renderer_properties`;
    return ApiService.getRequest(endpoint);
  },

  getEmailTemplateProperties(
    creativeId: string,
  ): Promise<DataListResponse<any>> {
    const endpoint = `email_templates/${creativeId}/renderer_properties`;
    return ApiService.getRequest(endpoint);
  },

  getAuditStatus(
    creativeId: string,
  ): Promise<DataListResponse<AuditStatusResource>> {
    const endpoint = `display_ads/${creativeId}/audits`;
    return ApiService.getRequest(endpoint);
  },

  makeAuditAction(
    creativeId: string,
    auditAction: CreativeAuditAction,
  ): Promise<any> {
    const endpoint = `display_ads/${creativeId}/action`;
    return ApiService.postRequest(endpoint, { audit_action: auditAction });
  },

  takeScreenshot(
    creativeId: string,
    options: Array<Partial<CreativeScreenshotResource>> = [],
  ): Promise<DataListResponse<CreativeScreenshotResource>> {
    const endpoint = `creatives/${creativeId}/screenshots`;
    return ApiService.postRequest(endpoint, options);
  },

  getCreativeScreenshotStatus(
    creativeId: string,
  ): Promise<DataResponse<CreativeScreenshotResource>> {
    const endpoint = `creatives/${creativeId}/screenshots/last`;
    return ApiService.getRequest(endpoint);
  },

  sendTestBlast(
    creativeId: string,
    organisationId: string,
    email: string,
  ): Promise<any> {
    const endpoint = `email_templates/${creativeId}/send_test`;
    const options = {
      organisation_id: organisationId,
      email: email,
    };
    return ApiService.postRequest(endpoint, options);
  },
};

export default CreativeService;
