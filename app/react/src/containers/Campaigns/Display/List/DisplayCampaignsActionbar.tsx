import * as React from 'react';
import { Button, message, Modal, Menu } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage, InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import {
  Actionbar,
  McsIcon,
  Slide,
  PopupContainer,
} from '@mediarithmics-private/mcs-components-library';
import ExportService from '../../../../services/ExportService';
import {
  CampaignsOptions,
  IDisplayCampaignService,
} from '../../../../services/DisplayCampaignService';
import ReportService from '../../../../services/ReportService';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import {
  parseSearch,
  DateSearchSettings,
  PaginationSearchSettings,
  KeywordSearchSettings,
} from '../../../../utils/LocationSearchHelper';
import { RouteComponentProps } from 'react-router';
import messages from './messages';
import { injectDrawer } from '../../../../components/Drawer/index';
import { CampaignStatus } from '../../../../models/campaign/constants/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { ExtendedTableRowSelection } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { DrawableContent } from '@mediarithmics-private/advanced-components/lib/components/drawer';

const { Dropdown } = PopupContainer;

const messagesMap = defineMessages({
  setStatus: {
    id: 'display.campaigns.list.multiEdit.status.setStatusTo',
    defaultMessage: 'Set status to',
  },
  activeAll: {
    id: 'display.campaigns.list.multiEdit.status.activeAll',
    defaultMessage: 'Active',
  },
  pauseAll: {
    id: 'display.campaigns.list.multiEdit.status.pauseAll',
    defaultMessage: 'Paused',
  },
  exportInProgress: {
    id: 'display.campaigns.list.actionbar.exportInProgress',
    defaultMessage: 'Export in progress',
  },
  breadCrumbPath: {
    id: 'display.campaigns.list.actionbar.breadCrumb.display',
    defaultMessage: 'Display',
  },
});

interface DisplayCampaignsActionbarProps {
  rowSelection: ExtendedTableRowSelection;
  multiEditProps: {
    archiveCampaigns: () => void;
    visible: boolean;
    handleOk: () => any;
    handleCancel: () => void;
    openEditCampaignsDrawer: () => void;
    isArchiving: boolean;
    handleStatusAction: (status: CampaignStatus) => void;
  };
}

export interface FilterParams
  extends DateSearchSettings,
    PaginationSearchSettings,
    KeywordSearchSettings {
  statuses: CampaignStatus[];
}

type JoinedProps = DisplayCampaignsActionbarProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCampaignsActionbarState {
  exportIsRunning: boolean;
  allCampaignsActivated: boolean;
  allCampaignsPaused: boolean;
}

class DisplayCampaignsActionbar extends React.Component<
  JoinedProps,
  DisplayCampaignsActionbarState
> {
  @lazyInject(TYPES.IDisplayCampaignService)
  private _displayCampaignService: IDisplayCampaignService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      exportIsRunning: false,
      allCampaignsActivated: false,
      allCampaignsPaused: false,
    };
  }

  fetchExportData = (organisationId: string, filter: FilterParams) => {
    const campaignType = 'DISPLAY';
    const buildOptionsForGetCampaigns = () => {
      const options: CampaignsOptions = {
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
      this._displayCampaignService.getDisplayCampaigns(
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

  handleRunExport = () => {
    const {
      match: {
        params: { organisationId },
      },
      intl,
    } = this.props;

    const filter = parseSearch<FilterParams>(this.props.location.search, DISPLAY_SEARCH_SETTINGS);

    this.setState({ exportIsRunning: true });

    const hideExportLoadingMsg = message.loading(
      intl.formatMessage(messagesMap.exportInProgress),
      0,
    );

    this.fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportDisplayCampaigns(organisationId, data, filter, intl.formatMessage);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  buildMenu = () => {
    const {
      multiEditProps: { handleStatusAction },
    } = this.props;
    const onClick = (event: any) => {
      switch (event.key) {
        case 'pause':
          return handleStatusAction('PAUSED');
        case 'activate':
          return handleStatusAction('ACTIVE');
        default:
          break;
      }
    };

    return (
      <Menu onClick={onClick} className='mcs-menu-antd-customized'>
        <Menu.Item key='pause'>
          <FormattedMessage {...messagesMap.pauseAll} />
        </Menu.Item>
        <Menu.Item key='activate'>
          <FormattedMessage {...messagesMap.activeAll} />
        </Menu.Item>
      </Menu>
    );
  };

  render() {
    const { exportIsRunning } = this.state;
    const {
      match: {
        params: { organisationId },
      },
      intl,
      rowSelection: { selectedRowKeys },
      multiEditProps: {
        archiveCampaigns,
        visible,
        handleCancel,
        handleOk,
        openEditCampaignsDrawer,
        isArchiving,
      },
    } = this.props;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const breadcrumbPaths = [
      <Link key='1' to={`/v2/o/${organisationId}/campaigns/display`}>
        {intl.formatMessage(messagesMap.breadCrumbPath)}
      </Link>,
    ];

    const buildActionElement = () => {
      return (
        <Dropdown overlay={this.buildMenu()} trigger={['click']}>
          <Button className='button-glow'>
            <McsIcon type='chevron' />
            <FormattedMessage {...messagesMap.setStatus} />
          </Button>
        </Dropdown>
      );
    };

    return (
      <Actionbar pathItems={breadcrumbPaths} className='mcs-modal_container'>
        <Link to={`/v2/o/${organisationId}/campaigns/display/create`}>
          <Button className='mcs-primary' type='primary'>
            <McsIcon type='plus' />{' '}
            <FormattedMessage
              id='display.campaigns.list.actionbar.newCampaignButton'
              defaultMessage='New Campaign'
            />
          </Button>
        </Link>

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type='download' />}
          <FormattedMessage
            id='display.campaigns.list.actionbar.newExportButton'
            defaultMessage='Export'
          />
        </Button>

        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={archiveCampaigns} className='button-slider button-glow'>
              <McsIcon type='delete' />
              <FormattedMessage
                id='display.campaigns.list.actionbar.archiveButton'
                defaultMessage='Archive'
              />
            </Button>
          }
        />

        {hasSelected ? (
          <Modal
            title={<FormattedMessage {...messages.archiveCampaignsModalTitle} />}
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={isArchiving}
          >
            <FormattedMessage {...messages.archiveCampaignsModalMessage} />
          </Modal>
        ) : null}

        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button onClick={openEditCampaignsDrawer} className='button-slider button-glow'>
              <McsIcon type='pen' />
              <FormattedMessage
                id='display.campaigns.list.actionbar.editCampaignButton'
                defaultMessage='Edit'
              />
            </Button>
          }
        />

        <Slide toShow={hasSelected} horizontal={true} content={buildActionElement()} />
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: { drawableContents: DrawableContent[] }) => ({
  drawableContents: state.drawableContents,
});

export default compose<JoinedProps, DisplayCampaignsActionbarProps>(
  withRouter,
  injectDrawer,
  injectNotifications,
  connect(mapStateToProps, undefined),
  injectIntl,
)(DisplayCampaignsActionbar);
