import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { compose } from 'recompose';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons.tsx';

import ExportService from '../../../../services/ExportService';
import CampaignService from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import { EMAIL_SEARCH_SETTINGS } from './constants';

import { parseSearch } from '../../../../utils/LocationSearchHelper';

const fetchExportData = (organisationId, filter) => {
  const campaignType = 'EMAIL';

  const buildOptionsForGetCampaigns = () => {
    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000,
    };

    const apiStatuses = filter.statuses.filter(status => status !== 'ARCHIVED');

    if (filter.keywords) {
      options.keywords = filter.keywords;
    }
    if (apiStatuses.length > 0) {
      options.status = apiStatuses;
    }
    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = 'campaign_id';

  const apiResults = Promise.all([
    CampaignService.getCampaigns(
      organisationId,
      campaignType,
      buildOptionsForGetCampaigns(),
    ),
    ReportService.getEmailDeliveryReport(
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

    const mergedData = Object.keys(displayCampaigns).map(campaignId => {
      return {
        ...displayCampaigns[campaignId],
        ...performanceReport[campaignId],
      };
    });

    return mergedData;
  });
};

class EmailCampaignsActionbar extends Component {
  constructor(props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false,
    };
  }

  handleRunExport() {
    const { match: { params: { organisationId } }, translations } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      EMAIL_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      translations.EXPORT_IN_PROGRESS,
      0,
    );

    fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportEmailCampaigns(
          organisationId,
          data,
          filter,
          translations,
        );
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      })
      .catch(() => {
        // TODO notify error
        this.setState({
          exportIsRunning: false,
        });
        hideExportLoadingMsg();
      });
  }

  render() {
    const { match: { params: { organisationId } }, translations } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const breadcrumbPaths = [
      {
        name: translations.EMAILS,
        url: `/v2/o/${organisationId}/campaigns/email`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/email/create`}>
          <Button type="primary" className="mcs-primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcons type="download" />}
          <FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );
  }
}

EmailCampaignsActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

EmailCampaignsActionbar = compose(withTranslations, withRouter)(
  EmailCampaignsActionbar
);

export default EmailCampaignsActionbar;
