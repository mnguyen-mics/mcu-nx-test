import * as React from 'react';
import { Button, message, Modal } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { connect } from 'react-redux';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import ExportService from '../../../../services/ExportService';
import CampaignService, { GetCampaignsOptions } from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { RouteComponentProps } from 'react-router';
import McsMoment from '../../../../utils/McsMoment';
import messages from '../messages';
import Slider from '../../../../components/Transition/Slide';
import {
  DrawableContent,
  injectDrawer,
} from '../../../../components/Drawer/index';
import { CampaignStatus } from '../../../../models/campaign/constants/index';

interface DisplayCampaignsActionbarProps {
  selectedRowKeys?: string[];
  multiEditProps: {
    archiveCampaigns: () => void;
    visible: boolean;
    handleOk: () => void;
    handleCancel: () => void;
    openEditCampaignsDrawer: () => void;
  };
}

interface FilterProps {
  currentPage: number;
  from: McsMoment;
  to: McsMoment;
  keywords: string[];
  pageSize: number;
  statuses: CampaignStatus[];
}

type JoinedProps = DisplayCampaignsActionbarProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCampaignsActionbarState {
  exportIsRunning: boolean;
}

const fetchExportData = (organisationId: string, filter: FilterProps) => {
  const campaignType = 'DISPLAY';
  const buildOptionsForGetCampaigns = () => {
    const options: GetCampaignsOptions = {
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
  const dimension = [''];

  const apiResults = Promise.all([
    CampaignService.getCampaigns(
      organisationId,
      campaignType,
      buildOptionsForGetCampaigns(),
    ),
    ReportService.getDisplayCampaignPerformanceReport(
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

    return Object.keys(displayCampaigns).map(campaignId => {
      return {
        ...displayCampaigns[campaignId],
        ...performanceReport[campaignId],
      };
    });
  });
};

class DisplayCampaignsActionbar extends React.Component<
  JoinedProps,
  DisplayCampaignsActionbarState
> {
  state = { exportIsRunning: false };

  handleRunExport = () => {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      DISPLAY_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });

    const hideExportLoadingMsg = message.loading(
      formatMessage({
        id: 'display.campaigns.actionbar',
        defaultMessage: 'Export in progress',
      }),
      0,
    );

    fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportDisplayCampaigns(organisationId, data, filter);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(() => {
        // TODO notify error
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  render() {
    const { exportIsRunning } = this.state;
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
      selectedRowKeys,
      multiEditProps: {
        archiveCampaigns,
        visible,
        handleOk,
        handleCancel,
        openEditCampaignsDrawer,
      },
    } = this.props;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const breadcrumbPaths = [
      {
        name: formatMessage({
          id: 'display.campaigns.breadCrumb',
          defaultMessage: 'Display',
        }),
        url: `/v2/o/${organisationId}/campaigns/display`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/v2/o/${organisationId}/campaigns/display/create`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_CAMPAIGN" />
          </Button>
        </Link>

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage id="EXPORT" />
        </Button>

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={archiveCampaigns} className="button-slider">
              <McsIcon type="delete" />
              <FormattedMessage id="ARCHIVE" />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={
              <FormattedMessage {...messages.archiveCampaignsModalTitle} />
            }
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>
              <FormattedMessage {...messages.archiveCampaignsModalMessage} />
            </p>
          </Modal>
        ) : null}

        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={openEditCampaignsDrawer} className="button-slider">
              <McsIcon type="pen" />
              <FormattedMessage id="EDIT" />
            </Button>
          }
        />
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: { drawableContents: DrawableContent[] }) => ({
  drawableContents: state.drawableContents,
});

export default compose<JoinedProps, DisplayCampaignsActionbarProps>(
  withRouter,
  withTranslations,
  injectDrawer,
  connect(mapStateToProps, undefined),
  injectIntl,
)(DisplayCampaignsActionbar);
