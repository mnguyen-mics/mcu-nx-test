import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import ExportService from '../../../../services/ExportService';
import CampaignService from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import { DISPLAY_SEARCH_SETTINGS } from './constants';

import { parseSearch } from '../../../../utils/LocationSearchHelper';

const fetchExportData = (organisationId, filter) => {

  const campaignType = 'DISPLAY';
  const buildOptionsForGetCampaigns = () => {
    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000,
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) { options.keywords = filter.keywords; }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }

    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = '';

  const apiResults = Promise.all([

    CampaignService.getCampaigns(
      organisationId,
      campaignType,
      buildOptionsForGetCampaigns(),
    ),
    ReportService.getDisplayCampaignPerfomanceReport(
      organisationId,
      startDate,
      endDate,
      dimension,
    ),
  ]);

  return apiResults.then(results => {
    const displayCampaigns = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'campaign_id',
    );

    return Object.keys(displayCampaigns).map((campaignId) => {
      return {
        ...displayCampaigns[campaignId],
        ...performanceReport[campaignId],
      };
    });
  });
};

class DisplayCampaignsActionbar extends Component {

  state = { exportIsRunning: false };

  handleRunExport = () => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const filter = parseSearch(this.props.location.search, DISPLAY_SEARCH_SETTINGS);

    this.setState({ exportIsRunning: true });

    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, filter).then(data => {
      ExportService.exportDisplayCampaigns(organisationId, data, filter, translations);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    });

  };

  render() {
    const { exportIsRunning } = this.state;
    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const breadcrumbPaths = [{
      name: translations.DISPLAY,
      url: `/v2/o/${organisationId}/campaigns/display`,
    }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/display/create`}>
          <Button className="mcs-primary" type="primary" >
            <McsIcons type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Link>

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          { !exportIsRunning && <McsIcons type="download" /> }
          <FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );
  }
}

DisplayCampaignsActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
};

DisplayCampaignsActionbar = compose(
  withRouter,
  withTranslations,
)(DisplayCampaignsActionbar);

export default DisplayCampaignsActionbar;
