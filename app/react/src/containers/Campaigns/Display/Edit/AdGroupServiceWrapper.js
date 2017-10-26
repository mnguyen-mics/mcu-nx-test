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

function getSegments({ adGroupId, campaignId, organisationId }) {
  const fetchSegments = DisplayCampaignService.getAudience(campaignId, adGroupId);
  const fetchMetadata = AudienceSegmentService.getSegmentMetaData(organisationId);

  return Promise.all([fetchSegments, fetchMetadata])
    .then((results) => {
      const segments = results[0];
      const metadata = results[1];

      return segments.map(segment => {
        const { desktop_cookie_ids, user_points } = metadata[segment.id];

        return { ...segment, desktop_cookie_ids, user_points };
      });
    })
    .then(audienceTable => ({ audienceTable }));
}

const getAdGroup = (organisationId, campaignId, adGroupId) => {
  let adGroup = {};

  return Promise.all([
    getGeneralInfo({ adGroupId, campaignId }),
    getPublishers({ campaignId }),
    getSegments({ adGroupId, campaignId, organisationId }),
    getAds({ campaignId, adGroupId, organisationId }),
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

  return formValues.reduce((promise, row) => {
    const body = getBody(row);
    const { include, modelId, toBeRemoved } = row;
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
        newPromise = requests.delete({ campaignId, adGroupId, id: modelId });
      }

      return newPromise || Promise.resolve();
    });
  }, Promise.resolve());
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
    tableName: 'audienceTable',
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const saveDevices = (/* campaignId, adGroupId, formValue, initialFormValue */) => {
  return Promise.resolve();
};

const savePlacements = (/* campaignId, adGroupId, formValue, initialFormValue */) => {
  return Promise.resolve();
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
    tableName: 'publisherTable',
  };

  return saveTableFields(options, formValue, initialFormValue);
};

const saveAdGroup = (campaignId, adGroupData, adGroupInitialData, editionMode = false) => {

  const publisherTable = adGroupData && adGroupData.publisherTable ? adGroupData.publisherTable : [];
  const audienceTable = adGroupData && adGroupData.audienceTable ? adGroupData.audienceTable : [];
  const adTable = adGroupData && adGroupData.adTable ? adGroupData.adTable : [];
  const deviceTable = [];
  const placementTable = [];
  const optimizerTable = adGroupData && adGroupData.optimizerTable ? adGroupData.optimizerTable : [];

  const initialPublisherTable = adGroupInitialData && adGroupInitialData.publisherTable ? adGroupInitialData.publisherTable : [];
  const initialAudienceTable = adGroupInitialData && adGroupInitialData.audienceTable ? adGroupInitialData.audienceTable : [];
  const initialAdTable = adGroupInitialData && adGroupInitialData.adTable ? adGroupInitialData.adTable : [];
  const initialDeviceTable = [];
  const initialPlacementTable = [];

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

  return new Promise((resolve, reject) => {
    let adGroupNewId = null;
    request
      .then((response) => {
        adGroupNewId = response.data.id;
        return saveAudience(campaignId, adGroupNewId, audienceTable, initialAudienceTable);
      })
      .then(() => savePublishers(campaignId, adGroupNewId, publisherTable, initialPublisherTable))
      .then(() => saveAds(campaignId, adGroupNewId, adTable, initialAdTable))
      .then(() => saveDevices(campaignId, adGroupNewId, deviceTable, initialDeviceTable))
      .then(() => savePlacements(campaignId, adGroupNewId, placementTable, initialPlacementTable))
      .then(() => {
        resolve(adGroupNewId);
      })
      .catch(error => {
        reject(error);
      });
  });
};


export {
    saveAdGroup,
    getAdGroup,
    getAdGroups,
};
