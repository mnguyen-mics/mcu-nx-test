import ApiService, { DataListResponse, DataResponse } from './ApiService';
import {
  CreativeType,
  CreativeSubtype,
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
import { PluginLayout } from '../models/plugin/PluginLayout';
import { IPluginService } from './PluginService';
import log from '../utils/Logger';
import { injectable, inject } from 'inversify';
import { TYPES } from '../constants/types';

export interface CreativesOptions {
  type?: CreativeType;
  subtype?: CreativeSubtype[];
  scope?: string;
  keywords?: string[];
  statuses?: CreativeStatus[];
  archived?: boolean;
  label_ids?: string[];
  order_by?: string[];
  first_result?: number;
  max_results?: number;
}

export interface ICreativeService {
  getCreatives: <T extends GenericCreativeResource>(
    organisationId: string,
    options: CreativesOptions,
  ) => Promise<DataListResponse<T>>;

  getCreative: (creativeId: string) => Promise<DataResponse<CreativeResourceShape>>;
  getDisplayAds: (
    organisationId: string,
    options: CreativesOptions,
  ) => Promise<DataListResponse<DisplayAdResource>>;
  getEmailTemplates: (
    organisationId: string,
    options: CreativesOptions,
  ) => Promise<DataListResponse<EmailTemplateResource>>;

  getEmailTemplate: (templateId: string) => Promise<DataResponse<EmailTemplateResource>>;

  getDisplayAd: (displayAdId: string) => Promise<DataResponse<DisplayAdResource>>;
  getCreativeFormats: (
    organisationId: string,
    options: {
      width?: number;
      height?: number;
      type?: AdType;
    },
  ) => Promise<DataListResponse<AdFormatResource>>;

  createDisplayCreative: (
    organisationId: string,
    resource: Partial<DisplayAdResource>,
  ) => Promise<DataResponse<DisplayAdResource>>;
  createEmailTemplate: (
    organisationId: string,
    resource: Partial<EmailTemplateResource>,
  ) => Promise<DataResponse<EmailTemplateResource>>;
  updateDisplayCreative: (
    creativeId: string,
    resource: Partial<DisplayAdResource>,
  ) => Promise<DataResponse<DisplayAdResource>>;
  updateEmailTemplate: (
    creativeId: string,
    resource: Partial<EmailTemplateResource>,
  ) => Promise<DataResponse<EmailTemplateResource>>;

  updateDisplayCreativeRendererProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<any> | any>;
  updateEmailTemplateProperty: (
    organisationId: string,
    id: string,
    technicalName: string,
    params: object,
  ) => Promise<DataResponse<any> | any>;
  getCreativeRendererProperties: (
    creativeId: string,
  ) => Promise<DataListResponse<PropertyResourceShape>>;
  getEmailTemplateProperties: (
    creativeId: string,
  ) => Promise<DataListResponse<PropertyResourceShape>>;
  getEmailTemplateLocalizedPluginLayout: (
    creativeId: string,
    locale: string,
  ) => Promise<DataResponse<PluginLayout> | null>;

  getAuditStatus: (creativeId: string) => Promise<DataListResponse<AuditStatusResource>>;
  makeAuditAction: (creativeId: string, auditAction: CreativeAuditAction) => Promise<any>;
  takeScreenshot: (
    creativeId: string,
    options?: Array<Partial<CreativeScreenshotResource>>,
  ) => Promise<DataListResponse<CreativeScreenshotResource>>;
  getCreativeScreenshotStatus: (
    creativeId: string,
  ) => Promise<DataResponse<CreativeScreenshotResource>>;
  sendTestBlast: (creativeId: string, organisationId: string, email: string) => Promise<any>;
}

@injectable()
export class CreativeService implements ICreativeService {
  @inject(TYPES.IPluginService)
  private _pluginService: IPluginService;
  getCreatives<T extends GenericCreativeResource>(
    organisationId: string,
    options: CreativesOptions = {},
  ): Promise<DataListResponse<T>> {
    const endpoint = 'creatives';

    const params = {
      organisation_id: organisationId,
      ...options,
    };
    return ApiService.getRequest(endpoint, params);
  }

  getCreative(creativeId: string): Promise<DataResponse<CreativeResourceShape>> {
    const endpoint = `creatives/${creativeId}`;
    return ApiService.getRequest(endpoint);
  }

  getDisplayAds(
    organisationId: string,
    options: CreativesOptions = {},
  ): Promise<DataListResponse<DisplayAdResource>> {
    return this.getCreatives(organisationId, {
      type: 'DISPLAY_AD',
      ...options,
    });
  }
  getEmailTemplates(
    organisationId: string,
    options: CreativesOptions = {},
  ): Promise<DataListResponse<EmailTemplateResource>> {
    return this.getCreatives(organisationId, {
      type: 'EMAIL_TEMPLATE',
      ...options,
    });
  }

  getEmailTemplate(templateId: string): Promise<DataResponse<EmailTemplateResource>> {
    return this.getCreative(templateId) as Promise<DataResponse<EmailTemplateResource>>;
  }

  getDisplayAd(displayAdId: string): Promise<DataResponse<DisplayAdResource>> {
    return this.getCreative(displayAdId) as Promise<DataResponse<DisplayAdResource>>;
  }

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
  }

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
  }

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
  }

  updateDisplayCreative(
    creativeId: string,
    resource: Partial<DisplayAdResource>,
  ): Promise<DataResponse<DisplayAdResource>> {
    const endpoint = `display_ads/${creativeId}`;
    return ApiService.putRequest(endpoint, resource);
  }

  updateEmailTemplate(
    creativeId: string,
    resource: Partial<EmailTemplateResource>,
  ): Promise<DataResponse<EmailTemplateResource>> {
    const endpoint = `email_templates/${creativeId}`;
    return ApiService.putRequest(endpoint, resource);
  }

  updateDisplayCreativeRendererProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<any> | any> {
    const endpoint = `display_ads/${id}/renderer_properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'display_ads',
      id,
      endpoint,
    );
  }

  updateEmailTemplateProperty(
    organisationId: string,
    id: string,
    technicalName: string,
    params: object = {},
  ): Promise<DataResponse<any> | any> {
    const endpoint = `email_templates/${id}/renderer_properties/technical_name=${technicalName}`;
    return this._pluginService.handleSaveOfProperties(
      params,
      organisationId,
      'email_templates',
      id,
      endpoint,
    );
  }

  getCreativeRendererProperties(
    creativeId: string,
  ): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `display_ads/${creativeId}/renderer_properties`;
    return ApiService.getRequest(endpoint);
  }

  getEmailTemplateProperties(creativeId: string): Promise<DataListResponse<PropertyResourceShape>> {
    const endpoint = `email_templates/${creativeId}/renderer_properties`;
    return ApiService.getRequest(endpoint);
  }

  getEmailTemplateLocalizedPluginLayout(
    creativeId: string,
    locale: string = 'en-US',
  ): Promise<DataResponse<PluginLayout> | null> {
    const endpoint = `email_templates/${creativeId}/properties_layout?locale=${locale}`;
    return ApiService.getRequest<DataResponse<PluginLayout>>(endpoint).catch(err => {
      log.warn('Cannot retrieve plugin layout', err);
      return null;
    });
  }

  getAuditStatus(creativeId: string): Promise<DataListResponse<AuditStatusResource>> {
    const endpoint = `display_ads/${creativeId}/audits`;
    return ApiService.getRequest(endpoint);
  }

  makeAuditAction(creativeId: string, auditAction: CreativeAuditAction): Promise<any> {
    const endpoint = `display_ads/${creativeId}/action`;
    return ApiService.postRequest(endpoint, { audit_action: auditAction });
  }

  takeScreenshot(
    creativeId: string,
    options: Array<Partial<CreativeScreenshotResource>> = [],
  ): Promise<DataListResponse<CreativeScreenshotResource>> {
    const endpoint = `creatives/${creativeId}/screenshots`;
    return ApiService.postRequest(endpoint, options);
  }

  getCreativeScreenshotStatus(
    creativeId: string,
  ): Promise<DataResponse<CreativeScreenshotResource>> {
    const endpoint = `creatives/${creativeId}/screenshots/last`;
    return ApiService.getRequest(endpoint);
  }

  sendTestBlast(creativeId: string, organisationId: string, email: string): Promise<any> {
    const endpoint = `email_templates/${creativeId}/send_test`;
    const options = {
      organisation_id: organisationId,
      email: email,
    };
    return ApiService.postRequest(endpoint, options);
  }
}
