import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import BidOptimizerServices from '../../../../services/BidOptimizerServices';
import CreativeService from '../../../../services/CreativeService';
import { isFakeId } from '../../../../utils/FakeIdHelper';


// ===========================================================================
//                             GET ADGROUP
// ===========================================================================

function getGeneralInfo({ campaignId, adGroupId }) {
  return DisplayCampaignService.getAdGroup(campaignId, adGroupId);
}

function getAds({ adGroupId, campaignId, organisationId }) {
  const fetchAllAds = CreativeService.getDisplayAds(organisationId)
    .then(({ data }) => data);

  const fetchSelectedAds = DisplayCampaignService.getAds(campaignId, adGroupId)
    .then(({ data }) => data.map(ad => ({ id: ad.creative_id, modelId: ad.id })));

  return Promise.all([fetchAllAds, fetchSelectedAds])
    .then((results) => {
      const allAds = results[0];
      const selectedAds = results[1];
      const selectedAdIds = selectedAds.map(ad => ad.id);

      const adTable = allAds
        .filter(ad => selectedAdIds.includes(ad.id))
        .map(ad => ({
          ...ad,
          modelId: (selectedAds.find(selection => selection.id === ad.id)).modelId
        }));

      return { adTable };
    });
}

function getPublishers({ campaignId }) {
  return DisplayCampaignService.getPublishers({ campaignId })
    .then(publisherTable => ({ publisherTable }));
}

function getLocations({ campaignId, adGroupId }) {
  return DisplayCampaignService.getLocations({ campaignId, adGroupId })
    .then(({ data }) => {
      return {
        locationTargetingTable: data
      };
    });
}

function getSegments({ adGroupId, campaignId, organisationId }) {
  const fetchSegments = DisplayCampaignService.getAudiences(campaignId, adGroupId);
  const fetchMetadata = AudienceSegmentService.getSegmentMetaData(organisationId);

  return Promise.all([fetchSegments, fetchMetadata])
    .then((results) => {
      const segments = results[0];
      const metadata = results[1];

      return segments.map(segment => {
        const meta = metadata[segment.id];
        const userPoints = (meta && meta.user_points ? meta.user_points : '-');
        const desktopCookieIds = (meta && meta.desktop_cookie_ids ? meta.desktop_cookie_ids : '-');

        return { ...segment, user_points: userPoints, desktop_cookie_ids: desktopCookieIds };
      });
    })
    .then(audienceTable => ({ audienceTable }));
}

function getAdGroupAudienceSegments(campaignId, adGroupId) {
  return DisplayCampaignService.getAudienceSegments(campaignId, adGroupId).then(segments => {
    return segments.map(segment => {
      return {
        id: segment.id,
        resource: segment,
      };
    });
  }).then(audienceSegmentTable => ({ audienceSegmentTable }));
}

const getAdGroup = (organisationId, campaignId, adGroupId) => {
  let adGroup = {};

  return Promise.all([
    getGeneralInfo({ adGroupId, campaignId }),
    getPublishers({ campaignId }),
    getSegments({ adGroupId, campaignId, organisationId }),
    getAds({ campaignId, adGroupId, organisationId }),
    getLocations({ campaignId, adGroupId }),
    getAdGroupAudienceSegments(campaignId, adGroupId),
  ])
    .then((results) => {
      adGroup = results.reduce((acc, result) => ({ ...acc, ...result }), {});
      return BidOptimizerServices.getBidOptimizers({ organisationId, selectedIds: [adGroup.bid_optimizer_id] });
    }).then(result => {
      return { ...adGroup, optimizerTable: result.data };
    });
};

const getAdGroups = (organisationId, campaignId) => {
  return DisplayCampaignService.getAdGroups(campaignId).then((results) => {
    const listIds = results.data.map(item => getAdGroup(organisationId, campaignId, item.id));
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
    return function promise() { return requests.create({ campaignId, adGroupId, body: field.resource }); };
  });

  const updateResources = newFormValues.filter(field => !isFakeId(field.id) && !field.deleted).map(field => {
    return function promise() { return requests.update({ campaignId, adGroupId, id: field.id, body: field.resource }); };
  });
  const deleteResources = newFormValues.filter(field => field.deleted).map(field => {
    return function promise() { return requests.delete({ campaignId, adGroupId, id: field.id }); };
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
            newPromise = requests.create({ campaignId, adGroupId, body });
          } else if (requests.update) {
            const needsUpdating = formInitialValues.find(elem => (
              elem.modelId === modelId && elem.include !== include
            ));

            /* update if modified element */
            if (needsUpdating) {
              newPromise = requests.update({ campaignId, adGroupId, id: modelId, body });
            }
          }
        } else if (toBeRemoved && !isCreation) {
          /* In case we want to delete an existing element */
          newPromise = requests.delete({ campaignId, adGroupId, id: (modelId || id) });
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

const saveAudience = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: (row) => ({ audience_segment_id: row.id, exclude: !row.include }),
    requests: {
      create: DisplayCampaignService.createAudience,
      update: DisplayCampaignService.updateAudience,
      delete: DisplayCampaignService.deleteAudience,
    },
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

const savePlacements = (/* campaignId, adGroupId, formValue, initialFormValue */) => {
  return Promise.resolve();
};

const saveLocations = (campaignId, adGroupId, formValue, initialFormValue) => {
  const options = {
    campaignId,
    adGroupId,
    getBody: (row) => ({
      country: row.name,
      postal_code: row.postal_code,
      admin2: row.admin2,
      exclude: row.exclude,
    }),
    requests: {
      create: DisplayCampaignService.createLocation,
      delete: DisplayCampaignService.deleteLocation,
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

  const { editionMode, catalogMode } = options;

  const publisherTable = adGroupData && adGroupData.publisherTable ? adGroupData.publisherTable : [];
  const audienceTable = adGroupData && adGroupData.audienceTable ? adGroupData.audienceTable : [];
  const adTable = adGroupData && adGroupData.adTable ? adGroupData.adTable : [];
  const audienceSegments = adGroupData && adGroupData.audienceSegmentTable ? adGroupData.audienceSegmentTable : [];
  const optimizerTable = adGroupData && adGroupData.optimizerTable ? adGroupData.optimizerTable : [];
  const deviceTable = [];
  const placementTable = [];
  const locationTargetingTable = adGroupData && adGroupData.locationTargetingTable ? adGroupData.locationTargetingTable : [];
  const initialPublisherTable = adGroupInitialData && adGroupInitialData.publisherTable ? adGroupInitialData.publisherTable : [];
  const initialAudienceTable = adGroupInitialData && adGroupInitialData.audienceTable ? adGroupInitialData.audienceTable : [];
  const initialAdTable = adGroupInitialData && adGroupInitialData.adTable ? adGroupInitialData.adTable : [];
  const initialAudienceSegments = adGroupInitialData && adGroupInitialData.audienceSegmentTable ? adGroupInitialData.audienceSegmentTable : [];
  const initialDeviceTable = [];
  const initialPlacementTable = [];
  const initialLocationTargetingTable = adGroupInitialData && adGroupInitialData.locationTargetingTable ? adGroupInitialData.locationTargetingTable : [];

  let bidOptimizer = null;
  if (optimizerTable && optimizerTable.length) {
    bidOptimizer = optimizerTable.find(elem => !elem.toBeRemoved);
  }


  const body = {
    bid_optimizer_id: bidOptimizer ? bidOptimizer.id : null,
    end_date: adGroupData.adGroupEndDate.valueOf(),
    max_budget_per_period: adGroupData.adGroupMaxBudgetPerPeriod,
    max_budget_period: adGroupData.adGroupMaxBudgetPeriod,
    name: adGroupData.adGroupName,
    start_date: adGroupData.adGroupStartDate.valueOf(),
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
      if (catalogMode) {
        return saveAudienceSegments(campaignId, adGroupId, audienceSegments, initialAudienceSegments);
      }
      return saveAudience(campaignId, adGroupId, audienceTable, initialAudienceTable);
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
