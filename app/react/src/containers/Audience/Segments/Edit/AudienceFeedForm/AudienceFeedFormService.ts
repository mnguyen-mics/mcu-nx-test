import { PluginProperty } from '../../../../../models/Plugins';
import { executeTasksInSequence } from '../../../../../utils/PromiseHelper';
import { DataResponse } from '../../../../../services/ApiService';
import { AudienceFeedFormModel } from './domain';
import { IAudienceSegmentService } from '../../../../../services/AudienceSegmentService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../../constants/types';

export interface IAudienceFeedFormService {
  loadTagInitialValue: (segmentId: string, feedId: string) => Promise<AudienceFeedFormModel>;
  loadExternalInitialValue: (segmentId: string, feedId: string) => Promise<AudienceFeedFormModel>;
  saveOrCreateTagFeed: (
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean,
  ) => Promise<any>;
  saveOrCreateExternalFeed: (
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean,
  ) => Promise<any>;
}

@injectable()
export class AudienceFeedFormService implements IAudienceFeedFormService {
  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  loadTagInitialValue(segmentId: string, feedId: string): Promise<AudienceFeedFormModel> {
    return this._audienceSegmentService
      .getAudienceTagFeed(segmentId, feedId)
      .then(res => res.data)
      .then(res => {
        return this._audienceSegmentService
          .getAudienceTagFeedProperties(segmentId, feedId)
          .then(prop => prop.data)
          .then(prop => ({ plugin: res, properties: prop }));
      });
  }
  loadExternalInitialValue(segmentId: string, feedId: string): Promise<AudienceFeedFormModel> {
    return this._audienceSegmentService
      .getAudienceExternalFeed(segmentId, feedId)
      .then(res => res.data)
      .then(res => {
        return this._audienceSegmentService
          .getAudienceExternalFeedProperties(segmentId, feedId)
          .then(prop => prop.data)
          .then(prop => ({ plugin: res, properties: prop }));
      });
  }
  saveOrCreateTagFeed(
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean,
  ) {
    if (edition) {
      return this._audienceSegmentService
        .updateAudienceTagFeeds(segmentId, formData.plugin.id, formData.plugin)
        .then(() =>
          updateOrCreatePluginProperties(
            organisationId,
            segmentId,
            formData.plugin.id,
            this._audienceSegmentService.updateAudienceSegmentTagFeedProperty,
            formData.properties,
          ),
        );
    }

    const {
      plugin: { organisation_id, ...formDataFormatted },
    } = formData;

    return this._audienceSegmentService
      .createAudienceTagFeeds(segmentId, formDataFormatted)
      .then(res =>
        updateOrCreatePluginProperties(
          organisationId,
          segmentId,
          res.data.id,
          this._audienceSegmentService.updateAudienceSegmentTagFeedProperty,
          formData.properties,
        ),
      );
  }
  saveOrCreateExternalFeed(
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean,
  ) {
    if (edition) {
      return this._audienceSegmentService
        .updateAudienceExternalFeeds(segmentId, formData.plugin.id, formData.plugin)
        .then(() =>
          updateOrCreatePluginProperties(
            organisationId,
            segmentId,
            formData.plugin.id,
            this._audienceSegmentService.updateAudienceSegmentExternalFeedProperty,
            formData.properties,
          ),
        );
    }

    const {
      plugin: { organisation_id, ...formDataFormatted },
    } = formData;

    return this._audienceSegmentService
      .createAudienceExternalFeeds(segmentId, formDataFormatted)
      .then(res =>
        updateOrCreatePluginProperties(
          organisationId,
          segmentId,
          res.data.id,
          this._audienceSegmentService.updateAudienceSegmentExternalFeedProperty,
          formData.properties,
        ),
      );
  }
}

type UpdatePromise = (
  organisationId: string,
  segmentId: string,
  feedId: string,
  technicalName: string,
  item: any,
) => Promise<DataResponse<PluginProperty> | void>;

const updateOrCreatePluginProperties = (
  organisationId: string,
  segmentId: string,
  feedId: string,
  promise: UpdatePromise,
  properties?: PluginProperty[],
) => {
  const propertiesPromises: Array<() => Promise<any>> = [];
  if (properties) {
    properties.forEach(item => {
      if (item.writable) {
        propertiesPromises.push(() =>
          promise(organisationId, segmentId, feedId, item.technical_name, item),
        );
      }
    });
  }
  return executeTasksInSequence(propertiesPromises);
};
