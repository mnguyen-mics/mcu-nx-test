import { DataResponse } from './../services/ApiService';
import { DisplayAdResource } from './../models/creative/CreativeResource';
import CreativeService from '../services/CreativeService';
import log from '../utils/Logger';
import { RendererDataProps } from '../models/campaign/display/AdResource';
import { PropertyResourceShape } from '../models/plugin';

// ===========================================================================
//                             CREATE CREATIVE
// ===========================================================================

const createDisplayCreative = (
  creative: Partial<DisplayAdResource>,
  properties: PropertyResourceShape[],
  organisationId: string,
  rendererData: RendererDataProps,
) => {

  const resource = {
    renderer_artifact_id: rendererData.renderer_artifact_id,
    renderer_group_id: rendererData.renderer_group_id,
    editor_artifact_id: 'default-editor',
    editor_group_id: 'com.mediarithmics.creative.display',
    subtype: 'BANNER',
    format: creative.format,
    destination_domain: creative.destination_domain,
    name: creative.name,
  };

  return CreativeService
    .createDisplayCreative(organisationId, resource)
    .then((newCreative: DataResponse<DisplayAdResource>) => {
      const creativeId = newCreative.data.id;
      return Promise.all([
        ...properties
          .map(item => CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item)),
        CreativeService.takeScreenshot(creativeId),
      ]).then(() => newCreative);
    });
};

// ===========================================================================
//                             UPDATE CREATIVE
// ===========================================================================

const updateDisplayCreative = (
  organisationId: string,
  creative: Partial<DisplayAdResource>,
  rendererProperties: PropertyResourceShape[],
) => {

  return CreativeService
    .updateDisplayCreative(creative.id, creative)
    .then(() => {
      const creativeId = creative.id;
      const propertiesPromises: any[] = [];
      rendererProperties.map(item =>
        propertiesPromises
          .push(CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item)),
      );

      return Promise.all(propertiesPromises).then(() => {
        return CreativeService.takeScreenshot(creativeId).then(() => {
          return creativeId;
        }).catch((err: any) => {
          log.error(err);
        });
      })
      .catch(err => {
        log.error(err);
      });
    })
    .catch((err: any) => {
      log.error(err);
    });
};

export {
  createDisplayCreative,
  updateDisplayCreative,
};
