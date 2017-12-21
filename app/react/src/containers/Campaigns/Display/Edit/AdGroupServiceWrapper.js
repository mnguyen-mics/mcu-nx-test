import DisplayCampaignService from '../../../../services/DisplayCampaignService.ts';
import BidOptimizerServices from '../../../../services/BidOptimizerServices';
import CreativeService from '../../../../services/CreativeService.ts';
import PlacementListServices from '../../../../services/Library/PlacementListsService.ts';
import GeonameService from '../../../../services/GeonameService.ts';
import { isFakeId, generateFakeId } from '../../../../utils/FakeIdHelper';


// ===========================================================================
//                             GET ADGROUP
// ===========================================================================

function getGeneralInfo({ campaignId, adGroupId }) {
  return DisplayCampaignService.getAdGroup(campaignId, adGroupId);
}

function getAds({ adGroupId, campaignId }) {

  return DisplayCampaignService.getAds(campaignId, adGroupId)
    .then(({ data }) => {
      return Promise.all(data.map(sel => CreativeService.getCreative(sel.creative_id).then(res => res.data)))
        .then(creatives => {
          return creatives.map(creative => {
            return {
              ...creative,
              modelId: data.find(d => d.creative_id === creative.id).id,
            };
          });
        });
    }).then(results => { return { adTable: results }; });
}

export function getCreatives({ adGroupId, campaignId }) {
  return DisplayCampaignService.getAds(campaignId, adGroupId)
    .then(({ data }) => {
      return Promise.all(data.map(sel => CreativeService.getCreative(sel.creative_id).then(res => res.data)));
    }).then(results => { return { adTable: results }; });
}

function getPlacementSelection({ campaignId, adGroupId }) {
  return DisplayCampaignService.getPlacementLists(campaignId, adGroupId)
    .then(res => res.data)
    .then(res => {
      return res.map(item => {
        return {
          ...item,
          include: !item.exclude,
          modelId: item.id,
        };
      });
    })
    .then(placementTable => ({ placementTable }));
}

export function getPlacement({ campaignId, adGroupId }) {
  return DisplayCampaignService.getPlacementLists(campaignId, adGroupId)
    .then(res => res.data)
    .then(res => {
      return res.map(item => {
        return { id: item.placement_list_id, exclude: item.exclude };
      });
    })
    .then(results => {
      return Promise.all(
        results.map(item => {
          return PlacementListServices.getPlacementList(item.id).then(placementList => {
            return {
              ...placementList.data,
              modelId: generateFakeId(),
              include: !item.exclude,
              placement_list_id: placementList.data.id,
              toBeRemoved: false,
            };
          });
        })
      );
    })
    .then(placementTable => ({ placementTable }));
}


function getPublisherSelection({ campaignId }) {
  return DisplayCampaignService.getPublishers(campaignId)
    .then(publisherTable => ({ publisherTable }));
}

function getLocationSelection({ campaignId, adGroupId }) {
  return DisplayCampaignService.getLocations(campaignId, adGroupId).then(response => {
    const locationSelections = response.data;
    return locationSelections.map(location => {
      return {
        id: location.id,
        resource: location,
        deleted: false,
      };
    });
  }).then(locationTargetingTable => ({ locationTargetingTable }));
}

export function getLocation({ campaignId, adGroupId }) {
  return DisplayCampaignService.getLocations(campaignId, adGroupId).then(response => {
    const locationSelections = response.data;
    return Promise.all(locationSelections.map(item => {
      return GeonameService.getGeoname(item.geoname_id)
        .then(res => {
          return {
            id: generateFakeId(),
            resource: {
              geoname_id: res.id,
              country: res.country_iso,
              admin1: res.admin1,
              admin2: res.admin2,
              exclude: item.exclude
            },
            deleted: false,
          };
        });
    }));
  })
  .then(locationTargetingTable => ({ locationTargetingTable }));
}

function getSegmentSelection({ adGroupId, campaignId }) {
  const fetchSegments = DisplayCampaignService.getAudiences(campaignId, adGroupId);

  return fetchSegments
    .then((segments) => {

      return segments.map(segment => {
        return { id: segment.id, resource: segment };
      });
    })
    .then(audienceTable => ({ audienceTable }));
}


function getAudienceSegmentSelection(campaignId, adGroupId) {
  return DisplayCampaignService.getAudienceSegments(campaignId, adGroupId).then(segments => {
    return segments.map(segment => {
      return {
        id: segment.id,
        resource: segment,
      };
    });
  }).then(audienceSegmentTable => ({ audienceSegmentTable }));
}

export function getAudienceSegment(campaignId, adGroupId) {
  return DisplayCampaignService.getAudienceSegments(campaignId, adGroupId).then(segments => {
    return segments.map(segment => {
      return {
        id: generateFakeId(),
        resource: segment,
      };
    });
  }).then(audienceSegmentTable => ({ audienceSegmentTable }));
}

const getAdGroup = (organisationId, campaignId, adGroupId, duplication = false) => {
  let adGroup = {};

  let promiseEdition;

  if (duplication) {
    promiseEdition = [
      getGeneralInfo({ adGroupId, campaignId }),
      getCreatives({ adGroupId, campaignId }),
      getPlacement({ campaignId, adGroupId }),
      getLocation({ adGroupId, campaignId }),
      getSegmentSelection({ adGroupId, campaignId, organisationId }),
      getAudienceSegment(campaignId, adGroupId),
    ];
  } else {
    promiseEdition = [
      getGeneralInfo({ adGroupId, campaignId }),
      getPublisherSelection({ campaignId }),
      getPlacementSelection({ campaignId, adGroupId }),
      getSegmentSelection({ adGroupId, campaignId, organisationId }),
      getAds({ campaignId, adGroupId, organisationId }),
      getLocationSelection({ campaignId, adGroupId }),
      getAudienceSegmentSelection(campaignId, adGroupId),
    ];

  }

  return Promise.all(promiseEdition)
    .then((results) => {
      adGroup = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      let bidOptimizer = {};
      return adGroup.bid_optimizer_id ? BidOptimizerServices.getBidOptimizer(adGroup.bid_optimizer_id)
        .then(res => res.data)
        .then(res => {
          bidOptimizer = res;
          return BidOptimizerServices.getBidOptimizerProperties(res.id)
            .then(resp => resp.data)
            .then(resp => {
              return resp.length ? {
                ...bidOptimizer,
                type: (resp.find(elem => elem.technical_name === 'name')).value.value,
                provider: (resp.find(elem => elem.technical_name === 'provider')).value.value,
              } : {
                ...bidOptimizer
              };
            });
        }) : Promise.resolve(null);

    }).then(result => {
      return { ...adGroup, optimizerTable: result ? [result] : [] };
    });
};

const getAdGroups = (organisationId, campaignId, duplication) => {
  return DisplayCampaignService.getAdGroups(campaignId).then((results) => {
    const listIds = results.data.map(item => getAdGroup(organisationId, campaignId, item.id, duplication));
    return Promise.all(listIds);
  });
};

// ===========================================================================
//                             SAVE ADGROUP
// ===========================================================================


const saveTableFields = (options, formValues, formInitialValues) => {

  const { campaignId, adGroupId, getBody, requests } = options;

  // TODO generalize this way
  const newFormValues = formValues.filter(field => field.resource && Object.keys(field.resource).length > 0);

  // TODO IN UPDATE CASE => maybe compare resource between initial and current
  const createResources = newFormValues.filter(field => isFakeId(field.id)).map(field => {
    return function promise() { return requests.create(campaignId, adGroupId, field.resource); };
  });

  const updateResources = newFormValues.filter(field => !isFakeId(field.id) && !field.deleted).map(field => {
    return function promise() { return requests.update(campaignId, adGroupId, field.id, field.resource); };
  });
  const deleteResources = newFormValues.filter(field => field.deleted).map(field => {
    return function promise() { return requests.delete(campaignId, adGroupId, field.id); };
  });

  const sequentialPromisesResult = [
    ...createResources,
    ...updateResources,
    ...deleteResources,
  ].reduce((previousPromise, promise) => {
    return previousPromise.then(() => {
      return promise();
    });
  }, Promise.resolve());

  const oldFormValues = formValues.filter(field => !field.resource);

  return sequentialPromisesResult.then(() => {
    return oldFormValues.reduce((promise, row) => {
      const body = getBody(row);
      const { include, modelId, toBeRemoved, id } = row;
      const isCreation = isFakeId(modelId);

      return promise.then(() => {
        let newPromise;

        if (!toBeRemoved) {
          /* In case we want to add or update a element */

          if (isCreation) {
            /* creation */
            newPromise = requests.create(campaignId, adGroupId, body);
          } else if (requests.update) {
            const needsUpdating = formInitialValues.find(elem => (
              elem.modelId === modelId && elem.include !== include
            ));

            /* update if modified element */
            if (needsUpdating) {
              newPromise = requests.update(campaignId, adGroupId, modelId, body);
            }
          }
        } else if (toBeRemoved && !isCreation) {
          /* In case we want to delete an existing element */
          newPromise = requests.delete(campaignId, adGroupId, (modelId || id));
        }

        return newPromise || Promise.resolve();
      });
    }, Promise.resolve());
  });
};

const saveAds = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    adGroupId,
    campaignId,
    getBody: (row) => ({ creative_id: row.id }),
    requests: {
      create: DisplayCampaignService.createAd,
      delete: DisplayCampaignService.deleteAd,
    },
    tableName: 'ads',
  };

  return saveTableFields(options, formValue, initialFormValue);
};


const saveAudienceSegments = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: () => {},
    requests: {
      create: DisplayCampaignService.createAudienceSegment,
      update: DisplayCampaignService.updateAudienceSegment,
      delete: DisplayCampaignService.deleteAudience,
    },
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const saveDevices = (/* campaignId, adGroupId, formValue, initialFormValue */) => {
  return Promise.resolve();
};

const savePlacements = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: (row) => ({ placement_list_id: row.id, exclude: !row.include }),
    requests: {
      create: DisplayCampaignService.createPlacementList,
      update: DisplayCampaignService.updatePlacementList,
      delete: DisplayCampaignService.deletePlacementList,
    },
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const saveLocations = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: () => {},
    requests: {
      create: DisplayCampaignService.createLocation,
      delete: DisplayCampaignService.deleteLocation,
      update: DisplayCampaignService.updateLocation,
    },
    tableName: 'locationTargetingTable',
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const savePublishers = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: (row) => ({ display_network_access_id: row.id }),
    requests: {
      create: DisplayCampaignService.createPublisher,
      delete: DisplayCampaignService.deletePublisher,
    },
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const saveAdGroup = (campaignId, adGroupData, adGroupInitialData, options = { editionMode: false, catalogMode: false }) => {

  const { editionMode } = options;

  const publisherTable = adGroupData && adGroupData.publisherTable ? adGroupData.publisherTable : [];
  const adTable = adGroupData && adGroupData.adTable ? adGroupData.adTable : [];
  const audienceSegments = adGroupData && adGroupData.audienceSegmentTable ? adGroupData.audienceSegmentTable : [];
  const optimizerTable = adGroupData && adGroupData.optimizerTable ? adGroupData.optimizerTable : [];
  const deviceTable = [];
  const locationTargetingTable = adGroupData && adGroupData.locationTargetingTable ? adGroupData.locationTargetingTable : [];
  const placementTable = adGroupData && adGroupData.placementTable ? adGroupData.placementTable : [];

  const initialPublisherTable = adGroupInitialData && adGroupInitialData.publisherTable ? adGroupInitialData.publisherTable : [];
  const initialAdTable = adGroupInitialData && adGroupInitialData.adTable ? adGroupInitialData.adTable : [];
  const initialAudienceSegments = adGroupInitialData && adGroupInitialData.audienceSegmentTable ? adGroupInitialData.audienceSegmentTable : [];
  const initialDeviceTable = [];
  const initialLocationTargetingTable = adGroupInitialData && adGroupInitialData.locationTargetingTable ? adGroupInitialData.locationTargetingTable : [];
  const initialPlacementTable = adGroupInitialData && adGroupInitialData.placementTable ? adGroupInitialData.placementTable : [];

  let bidOptimizer = null;
  if (optimizerTable && optimizerTable.length) {
    bidOptimizer = optimizerTable.find(elem => !elem.toBeRemoved);
  }


  const body = {
    bid_optimizer_id: bidOptimizer ? bidOptimizer.id : null,
    end_date: adGroupData.adGroupEndDate && adGroupData.adGroupEndDate.valueOf(),
    max_budget_per_period: adGroupData.adGroupMaxBudgetPerPeriod,
    max_budget_period: adGroupData.adGroupMaxBudgetPeriod,
    name: adGroupData.adGroupName,
    start_date: adGroupData.adGroupStartDate && adGroupData.adGroupStartDate.valueOf(),
    technical_name: adGroupData.adGroupTechnicalName,
    total_budget: adGroupData.adGroupTotalBudget,
    per_day_impression_capping: adGroupData.adGroupPerDayImpressionCapping,
    total_impression_capping: adGroupData.adGroupTotalImpressionCapping,
    max_bid_price: adGroupData.adGroupMaxBidPrice,
  };

  const request = (!editionMode
    ? DisplayCampaignService.createAdGroup(campaignId, body)
    : DisplayCampaignService.updateAdGroup(campaignId, adGroupData.adGroupId, body)
  );

  return request.then(response => {
    const adGroupId = response.data.id;

    const handleSaveAudience = () => {
      // if (catalogMode) {
      return saveAudienceSegments(campaignId, adGroupId, audienceSegments, initialAudienceSegments);
      // }
      // return saveAudience(campaignId, adGroupId, audienceTable, initialAudienceTable);
    };

    return handleSaveAudience()
      .then(() => saveDevices(campaignId, adGroupId, deviceTable, initialDeviceTable))
      .then(() => savePublishers(campaignId, adGroupId, publisherTable, initialPublisherTable))
      .then(() => savePlacements(campaignId, adGroupId, placementTable, initialPlacementTable))
      .then(() => saveAds(campaignId, adGroupId, adTable, initialAdTable))
      .then(() => saveLocations(campaignId, adGroupId, locationTargetingTable, initialLocationTargetingTable))
      .then(() => adGroupId);
  });
};


export {
    saveAdGroup,
    getAdGroup,
    getAdGroups,
};
