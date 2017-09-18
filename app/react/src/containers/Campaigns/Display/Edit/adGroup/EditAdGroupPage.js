import React, { Component } from 'react';
import { compose } from 'recompose';
import { injectIntl, intlShape } from 'react-intl';
import moment from 'moment';

import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import AudienceSegmentService from '../../../../../services/AudienceSegmentService';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import { normalizeArrayOfObject } from '../../../../../utils/Normalizer';
import { normalizeReportView } from '../../../../../utils/MetricHelper';
import {
  filterEmptyValues,
  formatKeysToPascalCase
} from '../../../../../utils/ReduxFormHelper';
import messages from '../messages';

class EditAdGroupPage extends Component {

  state = {
    initialValues: {}
  }

  componentDidMount() {
    const {
      match: {
        params: { adGroupId, campaignId, organisationId },
      },
    } = this.props;

    Promise.all([
      this.getGeneralInfo({ adGroupId, campaignId }),
      this.getPublishers({ campaignId }),
      this.getSegments({ adGroupId, campaignId, organisationId }),
    ])
      .then((results) => {
        const initialValues = results.reduce((acc, result) => ({
          ...acc,
          ...result
        }), {});

        this.setState({ initialValues });

        return this.getBidOptimizers({
          organisationId,
          selectedBidId: initialValues.adGroupBidOptimizerId
        });
      })
      .then((bidOptimizers) => {
        const { initialValues } = this.state;

        this.setState({
          initialValues: { ...initialValues, bidOptimizerTable: bidOptimizers }
        });
      });
  }

  getGeneralInfo({ campaignId, adGroupId }) {
    const {
      intl: { formatMessage }
    } = this.props;

    return DisplayCampaignService.getAdGroup(campaignId, adGroupId)
      .then(({ data }) => {
        const neededKeys = [
          'bid_optimizer_id',
          'end_date',
          'max_budget_per_period',
          'max_budget_period',
          'name',
          'start_date',
          'technical_name',
          'total_budget',
        ];

        const formatBudgetPeriod = {
          DAY: formatMessage(messages.contentSection1Row2Option1),
          WEEK: formatMessage(messages.contentSection1Row2Option2),
          MONTH: formatMessage(messages.contentSection1Row2Option3),
        };

        const filteredData = filterEmptyValues({ data, neededKeys })
          .reduce((acc, key) => {
            let value = data[key];

            if (key === 'start_date') {
              value = moment(value);
            } else if (key === 'end_date') {
              value = moment(value);
            } else if (key === 'max_budget_period') {
              value = formatBudgetPeriod[value];
            }

            return { ...acc, [key]: value };
          }, {});


        return formatKeysToPascalCase({ data: filteredData, prefix: 'adGroup' });
      });
  }

  getPublishers({ campaignId }) {
    return DisplayCampaignService.getSelectedPublishers(campaignId)
      .then(results => {
        const publisherTable = results.map(publisher => ({
          ...publisher,
          toBeRemoved: false
        }));

        return { publisherTable };
      });
  }

  getBidOptimizers({ organisationId, selectedBidId }) {
    return DisplayCampaignService.getBidOptimizers(organisationId)
      .then((bidOptimizers) => {
        const selectedBid = bidOptimizers.find(elem => elem.id === selectedBidId);
        const fetchEngineProperties = DisplayCampaignService
          .getEngineProperties(selectedBid.engine_version_id);

        const fetchEngineVersion = DisplayCampaignService
          .getEngineVersion(selectedBid.engine_version_id);

        return Promise.all([fetchEngineProperties, fetchEngineVersion]);
      })
      .then(results => {
        return ([{
          ...results[1],
          name: (results[0].find(elem => elem.technical_name === 'name')).value.value,
          provider: (results[0].find(elem => elem.technical_name === 'provider')).value.value,
          toBeRemoved: false,
          id: selectedBidId,
        }]);
      });
  }

  // getBidOptimizers() {
  //   // bid_optimizer_id
  //   // {id: "131", name: "OpenRTB Dynamic Allocation Test", organisation_id: "1125",…}
  //
  //   const {
  //     match: {
  //       params: { organisationId },
  //     },
  //   } = this.props;
  //
  //   return DisplayCampaignService.getBidOptimizers(organisationId)
  //     .then((bidOptimizers) => {
  //       console.log('bidOptimizers = ', bidOptimizers);
  //
  //       return Promise.all(bidOptimizers.map(bidOptimizer => {
  //         const fetchEngineProperties = DisplayCampaignService
  //           .getEngineProperties(bidOptimizer.engine_version_id);
  //
  //         const fetchEngineVersion = DisplayCampaignService
  //             .getEngineVersion(bidOptimizer.engine_version_id);
  //
  //         return Promise.all([fetchEngineProperties, fetchEngineVersion]);
  //       }));
  //     })
  //     .then(results => console.log('et là ? ', results));
  // }

  getSegments({ adGroupId, campaignId, organisationId }) {
    let initialSegments;

    return DisplayCampaignService.getSegments(campaignId, adGroupId)
      .then((segments) => {
        initialSegments = segments;

        return AudienceSegmentService.getSegmentMetaData(organisationId);
      })
      .then((results) => {
        const metadata = normalizeArrayOfObject(
          normalizeReportView(results),
          'audience_segment_id',
        );

        const audienceTable = initialSegments.map(segment => {
          const { user_points, desktop_cookie_ids } = metadata[segment.audience_segment_id];
          const { technical_name, exclude, ...relevantData } = segment;

          return {
            ...relevantData,
            desktop_cookie_ids,
            include: !exclude,
            toBeRemoved: false,
            user_points,
          };
        });

        return { audienceTable };
      });
  }

  render() {
    return (
      <AdGroupContent
        editionMode
        initialValues={this.state.initialValues}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  intl: intlShape.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
)(EditAdGroupPage);
