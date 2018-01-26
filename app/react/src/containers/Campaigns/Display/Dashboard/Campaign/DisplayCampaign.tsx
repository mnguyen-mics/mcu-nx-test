// import locale from 'antd/lib/time-picker/locale/pt_PT';
import * as React from 'react';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, Button, message, Modal } from 'antd';
import { compose } from 'recompose';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import {
  AdInfoResource,
  DisplayCampaignInfoResource,
} from '../../../../../models/campaign/display/DisplayCampaignInfoResource';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import CampaignDashboardHeader from '../../../Common/CampaignDashboardHeader';
import DisplayCampaignDashboard from './DisplayCampaignDashboard';
import DisplayCampaignAdGroupTable, {
  UpdateMessage,
} from './DisplayCampaignAdGroupTable';
import DisplayCampaignAdTable from '../Common/DisplayCampaignAdTable';
import Card from '../../../../../components/Card/Card';
import McsDateRangePicker, {
  McsDateRangeValue,
} from '../../../../../components/McsDateRangePicker';
import DisplayCampaignActionbar from './DisplayCampaignActionbar';
import { Labels } from '../../../../../containers/Labels';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import messages from '../messages';
import {
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import EditAdGroupsForm, {
  EditAdGroupsFormProps,
  EditAdGroupsFormData,
} from '../../Edit/AdGroup/MultiEdit/EditAdGroupsForm';
import Slider from '../../../../../components/TableView/Slider';
import { McsIcons } from '../../../../../components/index';
import DisplayCampaignService from '../../../../../services/DisplayCampaignService';
import operation from '../../Edit/AdGroup/domain';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';

const { Content } = Layout;
const DisplayCampaignAdTableJS = DisplayCampaignAdTable as any;

export interface CampaignSubProps<T> {
  isLoadingList: boolean;
  isLoadingPerf: boolean;
  items?: T[];
}

interface DashboardPerformanceSubProps {
  isLoading: boolean;
  hasFetched: boolean;
  items?: object[];
}

interface DisplayCampaignProps {
  campaign: {
    isLoadingList?: boolean;
    isLoadingPerf?: boolean;
    items: DisplayCampaignInfoResource;
  };
  ads: CampaignSubProps<AdInfoResource>;
  adGroups: CampaignSubProps<AdGroupResource>;
  updateAd: (
    adId: string,
    body: Partial<DisplayAdResource>,
    successMessage: UpdateMessage,
    errorMessage: UpdateMessage,
    undoBody: Partial<DisplayAdResource>
  ) => void;
  updateAdGroup: (
    adGroupId: string,
    body: Partial<AdGroupResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdGroupResource>,
  ) => void;
  updateCampaign: (
    campaignId: string,
    object: {
      status: string;
      type: string;
    },
  ) => void;
  dashboardPerformance: {
    media: DashboardPerformanceSubProps;
    overall: DashboardPerformanceSubProps;
    campaign: DashboardPerformanceSubProps;
  };
  goals: object[];
}

interface DisplaycampaignState {
  selectedRowKeys: string[];
  visible: boolean;
  allAdGroupsActivated: boolean;
  allAdGroupsPaused: boolean;
}

type JoinedProps = DisplayCampaignProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectDrawerProps &
  InjectedIntlProps;

class DisplayCampaign extends React.Component<
  JoinedProps,
  DisplaycampaignState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      visible: false,
      allAdGroupsActivated: false,
      allAdGroupsPaused: false,
    };
  }

  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(
        currentSearch,
        params,
        DISPLAY_DASHBOARD_SEARCH_SETTINGS,
      ),
    };

    history.push(nextLocation);
  }

  renderDatePicker() {
    const { location: { search } } = this.props;

    const filter = parseSearch(search, DISPLAY_DASHBOARD_SEARCH_SETTINGS);

    const values = {
      from: filter.from,
      to: filter.to,
    };

    const onChange = (newValues: McsDateRangeValue): void =>
      this.updateLocationSearch({
        from: newValues.from,
        to: newValues.to,
      });

    return <McsDateRangePicker values={values} onChange={onChange} />;
  }

  saveAdGroups = (formData: EditAdGroupsFormData) => {
    const {
      intl: { formatMessage },
      match: { params: { campaignId } },
      updateAdGroup,
    } = this.props;

    const { selectedRowKeys } = this.state;
    selectedRowKeys.map(adGroupId => {
      DisplayCampaignService.getAdGroup(campaignId, adGroupId)
        .then(apiRes => apiRes.data)
        .then((adGroupData: any) => {
          const updatedData = formData.fields.reduce((acc, field) => {
            const campaignProperty: keyof AdGroupResource =
              field.adGroupProperty;
            return {
              ...acc,
              [field.adGroupProperty]: operation(
                field.action,
                adGroupData[campaignProperty],
                parseInt(field.value, 10),
              ),
            };
          }, {});
          updateAdGroup(adGroupId, updatedData);
          // DisplayCampaignService.updateAdGroup(
          //   campaignId,
          //   adGroupId,
          //   updatedData,
          // );
        });
    });

    this.setState({
      selectedRowKeys: [],
    });
    this.props.closeNextDrawer();
    message.success(
      formatMessage({
        id: 'edit.campaigns.success.msg',
        defaultMessage: 'Campaigns successfully saved',
      }),
    );
  };

  handleOk = () => {
    const { intl: { formatMessage } } = this.props;
    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
    message.success(
      formatMessage({
        id: 'archive.adGroups.success.msg',
        defaultMessage: 'Ad Groups successfully archived',
      }),
    );
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  openEditAdGroupsDrawer = () => {
    const additionalProps = {
      close: this.props.closeNextDrawer,
      onSubmit: this.saveAdGroups,
      selectedRowKeys: this.state.selectedRowKeys,
    };
    const options = {
      additionalProps: additionalProps,
    };
    this.props.openNextDrawer<EditAdGroupsFormProps>(EditAdGroupsForm, options);
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  archiveAdGroups = () => {
    this.setState({
      visible: true,
    });
  };

  render() {
    const {
      match: { params: { campaignId, organisationId } },
      campaign,
      ads,
      adGroups,
      location,
      updateAd,
      updateAdGroup,
      updateCampaign,
      dashboardPerformance,
      goals,
      history,
      intl: { formatMessage },
    } = this.props;

    const {
      selectedRowKeys,
      allAdGroupsActivated,
      allAdGroupsPaused,
    } = this.state;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

    const onClick = () => {
      history.push({
        pathname: `/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/create`,
        state: { from: `${location.pathname}${location.search}` },
      });
    };
    const adGroupsStatus: string[] = [];
    if (hasSelected) {
      Promise.all(
        selectedRowKeys.map(adGroupId => {
          return DisplayCampaignService.getAdGroup(campaignId, adGroupId);
        }),
      ).then(apiResp => {
        apiResp.map(adGroup => adGroupsStatus.push(adGroup.data.status));
        this.setState({
          allAdGroupsActivated: !!!(
            adGroupsStatus.includes('PAUSED') ||
            adGroupsStatus.includes('PENDING')
          ),
          allAdGroupsPaused: !adGroupsStatus.includes('ACTIVE'),
        });
      });
    }

    const buildActionElement = () => {
      const onClickElement = (status: AdGroupStatus) => () => {
        selectedRowKeys.map(adGroupId => {
          updateAdGroup(adGroupId, {
            status,
          });
        });
        this.setState({
          selectedRowKeys: [],
        });
      };

      if (allAdGroupsActivated) {
        return (
          <Button
            className="mcs-primary button-slider"
            type="primary"
            onClick={onClickElement('PAUSED')}
          >
            <McsIcons type="pause" />
            <FormattedMessage {...messages.pauseAdGroups} />
          </Button>
        );
      } else if (allAdGroupsPaused) {
        return (
          <Button
            className="mcs-primary button-slider"
            type="primary"
            onClick={onClickElement('ACTIVE')}
          >
            <McsIcons type="play" />
            <FormattedMessage {...messages.activateAdGroups} />
          </Button>
        );
      } else {
        return null;
      }
    };

    const adGroupButtons: JSX.Element = (
      <span>
        <Button className="m-r-10" type="primary" onClick={onClick}>
          <FormattedMessage {...messages.newAdGroups} />
        </Button>
        {this.renderDatePicker()}
        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              className="m-r-10 button-slider"
              onClick={this.archiveAdGroups}
            >
              <McsIcons type="delete" />
              <FormattedMessage {...messages.archiveAdGroup} />
            </Button>
          }
        />
        {hasSelected ? (
          <Modal
            title={<FormattedMessage {...messages.archiveAdGroupsModalTitle} />}
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
          >
            <p>
              <FormattedMessage {...messages.archiveAdGroupsModalMessage} />
            </p>
          </Modal>
        ) : null}
        <Slider
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button
              className="m-r-10 button-slider"
              onClick={this.openEditAdGroupsDrawer}
            >
              <McsIcons type="pen" />
              <FormattedMessage {...messages.editAdGroup} />
            </Button>
          }
        />
        {(allAdGroupsActivated || allAdGroupsPaused) && (
          <Slider
            toShow={hasSelected}
            horizontal={true}
            content={buildActionElement()}
          />
        )}
      </span>
    );

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const adButtons: JSX.Element = <span>{this.renderDatePicker()}</span>;

    return (
      <div className="ant-layout">
        <DisplayCampaignActionbar
          campaign={campaign}
          updateCampaign={updateCampaign}
          isFetchingStats={
            dashboardPerformance.campaign.isLoading &&
            adGroups.isLoadingPerf &&
            ads.isLoadingPerf &&
            dashboardPerformance.media.isLoading
          }
        />
        <div className="ant-layout">
          <Content className="mcs-content-container">
            <CampaignDashboardHeader
              campaign={campaign.items}
            />
            <Labels labellableId={campaignId} organisationId={organisationId} labellableType="DISPLAY_CAMPAIGN" />
            <DisplayCampaignDashboard
              isFetchingCampaignStat={dashboardPerformance.campaign.isLoading}
              hasFetchedCampaignStat={dashboardPerformance.campaign.hasFetched}
              campaignStat={dashboardPerformance.campaign.items}
              mediaStat={dashboardPerformance.media.items}
              isFetchingMediaStat={dashboardPerformance.media.isLoading}
              hasFetchedMediaStat={dashboardPerformance.media.hasFetched}
              isFetchingOverallStat={dashboardPerformance.overall.isLoading}
              hasFetchedOverallStat={dashboardPerformance.overall.hasFetched}
              overallStat={dashboardPerformance.overall.items}
              goals={goals}
            />
            <Card
              title={formatMessage(messages.adGroups)}
              buttons={adGroupButtons}
            >
              <DisplayCampaignAdGroupTable
                isFetching={adGroups.isLoadingList}
                isFetchingStat={adGroups.isLoadingPerf}
                dataSet={adGroups.items}
                updateAdGroup={updateAdGroup}
                rowSelection={rowSelection}
              />
            </Card>
            <Card title={formatMessage(messages.creatives)} buttons={adButtons}>
              <DisplayCampaignAdTableJS
                isFetching={ads.isLoadingList}
                isFetchingStat={ads.isLoadingPerf}
                dataSet={ads.items}
                updateAd={updateAd}
              />
            </Card>
          </Content>
        </div>
      </div>
    );
  }
}

export default compose<DisplayCampaignProps, JoinedProps>(
  injectIntl,
  withRouter,
  injectDrawer,
)(DisplayCampaign);
