import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Icon, Button, message } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../Actionbar';
import * as ActionbarActions from '../../../state/Actionbar/actions';

import ExportService from '../../../services/ExportService';
import CampaignService from '../../../services/CampaignService';
import ReportService from '../../../services/ReportService';

import { normalizeReportView } from '../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../utils/Normalizer';

import {
  DISPLAY_QUERY_SETTINGS,

  deserializeQuery
} from '../RouteQuerySelector';

const fetchExportData = (organisationId, filter) => {

  const campaignType = 'DISPLAY';

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
  const dimension = '';

  const apiResults = Promise.all([
    CampaignService.getCampaigns(organisationId, campaignType, buildOptionsForGetCampaigns()),
    ReportService.getDisplayCampaignPerfomanceReport(organisationId, startDate, endDate, dimension)
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

class CampaignsDisplayActionbar extends Component {

  constructor(props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = { exportIsRunning: false };
  }

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.DISPLAY_CAMPAIGNS
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

    const filter = deserializeQuery(this.props.query, DISPLAY_QUERY_SETTINGS);

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, filter).then(data => {
      ExportService.exportCampaignsDisplay(organisationId, data, filter, translations);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    });

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const newCampaignMenu = (
      <Menu>
        <Menu.Item key="DESKTOP_AND_MOBILE">
          <Link to={`${organisationId}/campaigns/display/expert/edit/T1`}>
            <FormattedMessage id="DESKTOP_AND_MOBILE" />
          </Link>
        </Menu.Item>
        <Menu.Item key="SIMPLIFIED_KEYWORDS_TARGETING">
          <Link to={`${organisationId}/campaigns/display/keywords`}>
            <FormattedMessage id="SIMPLIFIED_KEYWORDS_TARGETING" />
          </Link>
        </Menu.Item>
        <Menu.Item key="EXTERNAL_CAMPAIGN">
          <Link to={`${organisationId}/campaigns/display/external/edit/T1`}>
            <FormattedMessage id="EXTERNAL_CAMPAIGN" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar>
        <Dropdown overlay={newCampaignMenu} trigger={['click']}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Dropdown>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          { !exportIsRunning && <Icon type="export" /> }<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }

}

CampaignsDisplayActionbar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

CampaignsDisplayActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplayActionbar);

export default CampaignsDisplayActionbar;
