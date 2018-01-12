import * as React from 'react';
import { Button, message, Modal } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';

import { withTranslations } from '../../../Helpers';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';
import ExportService from '../../../../services/ExportService';
import CampaignService from '../../../../services/CampaignService';
import ReportService from '../../../../services/ReportService';
import EditCampaignsForm, {
  EditCampaignsFormProps,
} from '../Edit/Campaign/MutiEdit/EditCampaignsForm';
import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';
import { DISPLAY_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import withDrawer, {
  DrawableContentProps,
} from '../../../../components/Drawer/index';
import { RouteComponentProps } from 'react-router';
import McsMoment from '../../../../utils/McsMoment';
import messages from '../messages';

interface DisplayCampaignsActionbarProps extends DrawableContentProps {
  translations?: object; // type
  hasSelected: boolean
}

interface FilterProps {
  currentPage: number;
  from: McsMoment;
  to: McsMoment;
  keywords: string[];
  pageSize: number;
  statuses: string[];
}

interface OptionsProps {
  archived: any;
  first_result: number;
  max_results: number;
  keywords: string[];
  status: string[];
}

type JoinedProps = DisplayCampaignsActionbarProps &
  RouteComponentProps<{ organisationId: string }>;

interface DisplayCampaignsActionbarState {
  exportIsRunning: boolean;
  visible: boolean;
}

const fetchExportData = (organisationId: string, filter: FilterProps) => {
  const campaignType = 'DISPLAY';
  const buildOptionsForGetCampaigns = () => {
    const options: OptionsProps = {
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
  state = { exportIsRunning: false, visible: false };

  handleRunExport = () => {
    const { match: { params: { organisationId } }, translations } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      DISPLAY_SEARCH_SETTINGS,
    );

    this.setState({ exportIsRunning: true });

    const hideExportLoadingMsg = message.loading(
      translations.EXPORT_IN_PROGRESS,
      0,
    );

    fetchExportData(organisationId, filter)
      .then(data => {
        ExportService.exportDisplayCampaigns(
          organisationId,
          data,
          filter,
          translations,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(() => {
        // TODO notify error
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = e => {
    console.log('campaings archived');
    this.setState({
      visible: false,
    });
  };
  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  editCampaigns = () => {
    console.log('campaigns saved !');
    this.props.closeNextDrawer();
  };

  openEditCampaignsDrawer = () => {
    const additionalProps = {
      close: this.props.closeNextDrawer,
      openNextDrawer: this.props.openNextDrawer,
      closeNextDrawer: this.props.closeNextDrawer,
      save: this.editCampaigns,
    };
    const options = {
      additionalProps: additionalProps,
    };
    this.props.openNextDrawer<EditCampaignsFormProps>(
      EditCampaignsForm,
      options,
    );
  };

  archiveCampaigns = () => {
    this.showModal();
    console.log('archive');
  };

  render() {
    const { exportIsRunning } = this.state;
    const { match: { params: { organisationId } }, translations, hasSelected } = this.props;

    const breadcrumbPaths = [
      {
        name: translations.DISPLAY,
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

        {hasSelected ? (
          <Button onClick={this.archiveCampaigns}>
            <McsIcon type="delete" />
            <FormattedMessage id="ARCHIVE" />
          </Button>
        ) : null}

        {hasSelected ? (
          <Modal
            title={<FormattedMessage {...messages.archiveCampaignsModalTitle} /> }
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <p>
              <FormattedMessage {...messages.archiveCampaignsModalMessage} /> 
            </p>
          </Modal>
        ) : null}

        {hasSelected ? (
          <Button onClick={this.openEditCampaignsDrawer}>
            <McsIcon type="pen" />
            <FormattedMessage id="EDIT" />
          </Button>
        ) : null}
      </Actionbar>
    );
  }
}

export default compose<JoinedProps, DisplayCampaignsActionbarProps>(
  withRouter,
  withTranslations,
  withDrawer,
)(DisplayCampaignsActionbar);
