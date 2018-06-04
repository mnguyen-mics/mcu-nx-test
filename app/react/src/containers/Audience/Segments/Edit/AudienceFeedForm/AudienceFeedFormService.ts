import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import { PluginProperty } from '../../../../../models/Plugins';
import { executeTasksInSequence } from '../../../../../utils/FormHelper';
import { DataResponse } from '../../../../../services/ApiService';
import { AudienceFeedFormModel } from './domain';

export const AudienceFeedFormService = {
  loadTagInitialValue(
    segmentId: string,
    feedId: string,
  ): Promise<AudienceFeedFormModel> {
    return AudienceSegmentService.getAudienceTagFeed(
      segmentId,
      feedId,
    )
      .then(res => res.data)
      .then(res => {
        return AudienceSegmentService.getAudienceTagFeedProperty(segmentId, feedId)
          .then(prop => prop.data)
          .then(prop => ({ plugin: res, properties: prop }))
      })
  },
  loadExternalInitialValue(
    segmentId: string,
    feedId: string,
  ): Promise<AudienceFeedFormModel> {
    return AudienceSegmentService.getAudienceExternalFeed(
      segmentId,
      feedId,
    )
      .then(res => res.data)
      .then(res => {
        return AudienceSegmentService.getAudienceExternalFeedProperty(segmentId, feedId)
          .then(prop => prop.data)
          .then(prop => ({ plugin: res, properties: prop }))
      })
  },
  saveOrCreateTagFeed(
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean
  ) {

    if (edition) {
      return AudienceSegmentService.updateAudienceTagFeeds(
        segmentId,
        formData.plugin.id,
        formData.plugin
      ).then(() => updateOrCreatePluginProperties(
        organisationId,
        segmentId,
        formData.plugin.id,
        AudienceSegmentService.updateAudienceSegmentTagFeedProperty,
        formData.properties
      ))
    }

    const {
      plugin: {
        organisation_id,
        ...formDataFormatted
      }
    } = formData

    return AudienceSegmentService.createAudienceTagFeeds(
      segmentId,
      formDataFormatted
    ).then((res) => updateOrCreatePluginProperties(
      organisationId,
      segmentId,
      res.data.id,
      AudienceSegmentService.updateAudienceSegmentTagFeedProperty,
      formData.properties
    ))
  },
  saveOrCreateExternalFeed(
    organisationId: string,
    segmentId: string,
    formData: AudienceFeedFormModel,
    edition: boolean
  ) {

    if (edition) {
      return AudienceSegmentService.updateAudienceExternalFeeds(
        segmentId,
        formData.plugin.id,
        formData.plugin
      ).then(() => updateOrCreatePluginProperties(
        organisationId,
        segmentId,
        formData.plugin.id,
        AudienceSegmentService.updateAudienceSegmentExternalFeedProperty,
        formData.properties
      ))
    }

    const {
      plugin: {
        organisation_id,
        ...formDataFormatted
      }
    } = formData

    return AudienceSegmentService.createAudienceExternalFeeds(
      segmentId,
      formDataFormatted
    ).then((res) => updateOrCreatePluginProperties(
      organisationId,
      segmentId,
      res.data.id,
      AudienceSegmentService.updateAudienceSegmentExternalFeedProperty,
      formData.properties
    ))
  }
}

type UpdatePromise = (organisationId: string, segmentId: string, feedId: string, technicalName: string, item: any) => Promise<DataResponse<PluginProperty> | void>

const updateOrCreatePluginProperties = (organisationId: string, segmentId: string, feedId: string, promise: UpdatePromise, properties?: PluginProperty[]) => {
  const propertiesPromises: Array<() => Promise<any>> = [];
  if (properties) {
    properties.forEach(item => {
      if (item.writable) {
        propertiesPromises.push(() =>
          promise(
            organisationId,
            segmentId,
            feedId,
            item.technical_name,
            item,
          ),
        );
      }
    });
  }
  return executeTasksInSequence(propertiesPromises);
}
