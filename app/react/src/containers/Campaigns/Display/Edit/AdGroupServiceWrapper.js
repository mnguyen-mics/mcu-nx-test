import DisplayCampaignService from '../../../../services/DisplayCampaignService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import BidOptimizerServices from '../../../../services/BidOptimizerServices';
import { unformatMetric } from '../../../../utils/MetricHelper';


const saveTableFields = (options, formValues, formInitialValues) => {

  const { campaignId, adGroupId, getBody, requests } = options;

  return formValues.reduce((promise, row) => {
    const body = getBody(row);
    const { include, otherId, toBeRemoved } = row;

    return promise.then(() => {
      let newPromise;

      if (!toBeRemoved) {
          /* In case we want to add or update a element */

        if (!otherId) {
            /* creation */
          newPromise = requests.create({ campaignId, adGroupId, body });
        } else if (requests.update) {
          const needsUpdating = formInitialValues.find(elem => (
              elem.otherId === otherId && elem.include !== include
            ));

            /* update if modified element */
          if (needsUpdating) {
            newPromise = requests.update({ campaignId, adGroupId, id: otherId, body });
          }
        }
      } else if (otherId) {
          /* In case we want to delete an existing element */
        newPromise = requests.delete({ campaignId, adGroupId, id: otherId });
      }

      return newPromise || Promise.resolve();
    });
  }, Promise.resolve());
};


// ===========================================================================
//                             GET ADGROUP
// ===========================================================================


function getGeneralInfo({ campaignId, adGroupId }) {
  return DisplayCampaignService.getAdGroup(campaignId, adGroupId);

}

function getPublishers({ campaignId }) {
  return DisplayCampaignService.getPublishers({ campaignId })
    .then(publisherTable => ({ publisherTable }));
}

function getSegments({ adGroupId, campaignId, organisationId }) {
  const fetchSegments = DisplayCampaignService.getAudiences(campaignId, adGroupId);
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
//                             CREATE ADGROUP
// ===========================================================================

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

const createAdGroup = (campaignId, adGroupData, adGroupInitialData, editionMode = false) => {

  const publisherTable = adGroupData && adGroupData.publisherTable ? adGroupData.publisherTable : [];
  const audienceTable = adGroupData && adGroupData.audienceTable ? adGroupData.audienceTable : [];
  const optimizerTable = adGroupData && adGroupData.optimizerTable ? adGroupData.optimizerTable : [];

  const initialPublisherTable = adGroupInitialData && adGroupInitialData.publisherTable ? adGroupInitialData.publisherTable : [];
  const initialAudienceTable = adGroupInitialData && adGroupInitialData.audienceTable ? adGroupInitialData.audienceTable : [];

  let bidOptimizer = null;
  if (optimizerTable && optimizerTable.length) {
    bidOptimizer = optimizerTable.find(elem => !elem.toBeRemoved);
  }


  const body = {
    bid_optimizer_id: bidOptimizer ? bidOptimizer.id : null,
    end_date: adGroupData.adGroupEndDate.valueOf(),
    max_budget_per_period: unformatMetric(adGroupData.adGroupMaxBudgetPerPeriod),
    max_budget_period: adGroupData.adGroupMaxBudgetPeriod,
    name: adGroupData.adGroupName,
    start_date: adGroupData.adGroupStartDate.valueOf(),
    technical_name: adGroupData.adGroupTechnicalName,
    total_budget: unformatMetric(adGroupData.adGroupTotalBudget),
  };

  const request = (!editionMode
    ? DisplayCampaignService.createAdGroup(campaignId, body)
    : DisplayCampaignService.updateAdGroup(campaignId, adGroupData.adGroupId, body)
  );

  return new Promise((resolve, reject) => {
    let adGroupNewId = null;
    request
      .then((adGroupId) => {
        adGroupNewId = adGroupId;
        return saveAudience(campaignId, adGroupNewId, audienceTable, initialAudienceTable);
      })
      .then(() => {
        return savePublishers(campaignId, adGroupNewId, publisherTable, initialPublisherTable);
      })
      .then((results) => {
        resolve(results);
      })
      .catch(error => {
        reject(error);
      });
  });
};


const updateAdGroup = () => {
  return null;
};

export {
    updateAdGroup,
    createAdGroup,
    getAdGroup,
    getAdGroups,
};
