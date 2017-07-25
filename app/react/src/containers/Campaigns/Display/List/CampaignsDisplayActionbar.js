import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
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

  handleRunExport() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      translations,
    } = this.props;

    const filter = parseSearch(this.props.location.search, DISPLAY_SEARCH_SETTINGS);

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
      match: {
        params: {
          organisationId
        }
      },
      history,
      translations
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const handleOnClick = ({ key }) => {
      switch (key) {
        case 'DESKTOP_AND_MOBILE':
          history.push(`/${organisationId}/campaigns/display/expert/edit/T1`);
          break;

        default:
          break;
      }
    };

    const newCampaignMenu = (
      <Menu onClick={handleOnClick}>
        <Menu.Item key="DESKTOP_AND_MOBILE">
          {/* <Link to={`/${organisationId}/campaigns/display/expert/edit/T1`}> */}
          <FormattedMessage id="DESKTOP_AND_MOBILE" />
          {/* </Link> */}
        </Menu.Item>
        <Menu.Item key="SIMPLIFIED_KEYWORDS_TARGETING">
          <Link to={`/${organisationId}/campaigns/display/keywords`}>
            <FormattedMessage id="SIMPLIFIED_KEYWORDS_TARGETING" />
          </Link>
        </Menu.Item>
        <Menu.Item key="EXTERNAL_CAMPAIGN">
          <Link to={`/${organisationId}/campaigns/display/external/edit/T1`}>
            <FormattedMessage id="EXTERNAL_CAMPAIGN" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const breadcrumbPaths = [{ name: translations.DISPLAY, url: `/v2/o/${organisationId}/campaigns/display` }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Dropdown overlay={newCampaignMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Dropdown>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          { !exportIsRunning && <McsIcons type="download" /> }<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }

}

CampaignsDisplayActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

CampaignsDisplayActionbar = compose(
  withTranslations,
  withRouter,
)(CampaignsDisplayActionbar);

export default CampaignsDisplayActionbar;
