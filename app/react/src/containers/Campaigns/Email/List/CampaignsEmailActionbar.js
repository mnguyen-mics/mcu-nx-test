import React, { Component, PropTypes } from 'react';
import { Icon, Button, message } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as ActionbarActions from '../../../../state/Actionbar/actions';

import ExportService from '../../../../services/ExportService';
import CampaignService from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import {
  EMAIL_QUERY_SETTINGS,

  deserializeQuery
} from '../../RouteQuerySelector';

const fetchExportData = (organisationId, filter) => {

  const campaignType = 'EMAIL';

  const buildOptionsForGetCampaigns = () => {
    const options = {
      archived: filter.statuses.includes('ARCHIVED'),
      first_result: 0,
      max_results: 2000
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
  const dimension = 'campaign_id';

  const apiResults = Promise.all([
    CampaignService.getCampaigns(organisationId, campaignType, buildOptionsForGetCampaigns()),
    ReportService.getEmailDeliveryReport(organisationId, startDate, endDate, dimension)
  ]);

  return apiResults.then(results => {
    const campaignsDisplay = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'campaign_id'
    );

    const mergedData = Object.keys(campaignsDisplay).map((campaignId) => {
      return {
        ...campaignsDisplay[campaignId],
        ...performanceReport[campaignId]
      };
    });

    return mergedData;
  });
};

class CampaignsEmailActionbar extends Component {

  constructor(props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = {
      exportIsRunning: false
    };
  }

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.EMAIL_CAMPAIGNS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  handleRunExport() {
    const {
      activeWorkspace: {
        organisationId
      },
      translations,

    } = this.props;

    const filter = deserializeQuery(this.props.query, EMAIL_QUERY_SETTINGS);

    this.setState({
      exportIsRunning: true
    });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, filter).then(data => {
      ExportService.exportCampaignsEmail(organisationId, data, filter, translations);
      this.setState({
        exportIsRunning: false
      });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({
        exportIsRunning: false
      });
      hideExportLoadingMsg();
    });

  }

  render() {

    const {
      activeWorkspace: {
        workspaceId
      }
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    return (
      <Actionbar>
        <Link to={`/${workspaceId}/campaigns/email/edit`}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Link>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          { !exportIsRunning && <Icon type="export" /> }<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }

}

CampaignsEmailActionbar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  translations: state.translationsState.translations,
  query: ownProps.router.location.query,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

CampaignsEmailActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsEmailActionbar);

export default CampaignsEmailActionbar;
