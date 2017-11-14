import CreativeService from '../services/CreativeService';
import log from '../utils/Logger';

// ===========================================================================
//                             CREATE CREATIVE
// ===========================================================================


const createDisplayCreative = (creative, properties, organisationId, rendererData) => {

  const options = {
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
    .createDisplayCreative(organisationId, options)
    .then(newCreative => {
      const creativeId = newCreative.id;
      return Promise.all([
        ...properties.map(item => CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item)),
        CreativeService.takeScreenshot(creativeId, organisationId)
      ]).then(() => newCreative);
    });
};


// ===========================================================================
//                             UPDATE CREATIVE
// ===========================================================================


const updateDisplayCreative = (organisationId, creative, rendererProperties) => {

  return CreativeService
    .updateDisplayCreative(organisationId, creative.id, creative)
    .then(() => {
      const creativeId = creative.id;
      const propertiesPromises = [];
      rendererProperties.map(item =>
        propertiesPromises.push(CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item))
      );

      return Promise.all(propertiesPromises).then(() => {
        return CreativeService.takeScreenshot(creativeId, organisationId).then(() => {
          return creativeId;
        }).catch(err => {
          log.error(err);
        });
      })
      .catch(err => {
        log.error(err);
      });
    })
    .catch(err => {
      log.error(err);
    });
};

export {
  createDisplayCreative,
  updateDisplayCreative,
};

