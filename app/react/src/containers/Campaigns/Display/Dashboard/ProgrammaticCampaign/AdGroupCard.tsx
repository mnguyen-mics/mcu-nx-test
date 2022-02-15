import * as React from 'react';
import { compose } from 'recompose';
import { Button, Modal, message, Menu } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage, defineMessages } from 'react-intl';
import messages from '../messages';
import {
  Card,
  McsIcon,
  McsDateRangePicker,
  Slide,
  PopupContainer,
} from '@mediarithmics-private/mcs-components-library';
import { CardProps } from '@mediarithmics-private/mcs-components-library/lib/components/card/Card';
import { AdGroupResource } from '../../../../../models/campaign/display/AdGroupResource';
import DisplayCampaignAdGroupTable, { UpdateMessage } from './DisplayCampaignAdGroupTable';
import { CampaignRouteParams } from '../../../../../models/campaign/CampaignResource';
import { parseSearch, updateSearch } from '../../../../../utils/LocationSearchHelper';
import { DISPLAY_DASHBOARD_SEARCH_SETTINGS } from '../constants';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { injectDrawer } from '../../../../../components/Drawer/index';
import EditAdGroupsForm, {
  EditAdGroupsFormProps,
  EditAdGroupsFormData,
} from '../../Edit/AdGroup/MultiEdit/EditAdGroupsForm';
import { Task, executeTasksInSequence } from '../../../../../utils/PromiseHelper';
import { AdGroupStatus } from '../../../../../models/campaign/constants/index';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { DisplayCampaignInfoResource } from '../../../../../models/campaign/display';
import { lazyInject } from '../../../../../config/inversify.config';
import { IAdGroupFormService } from '../../Edit/AdGroup/AdGroupFormService';
import { TYPES } from '../../../../../constants/types';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import {
  convertMessageDescriptorToString,
  mcsDateRangePickerMessages,
} from '../../../../../IntlMessages';
import { McsDateRangePickerMessages } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker';

const { Dropdown } = PopupContainer;

const messagesMap = defineMessages({
  setStatus: {
    id: 'display.campaigns.dashboard.adGroupCard.status.setStatusTo',
    defaultMessage: 'Set status to',
  },
  activeAll: {
    id: 'display.campaigns.dashboard.adGroupCard.status.activeAll',
    defaultMessage: 'Active',
  },
  pauseAll: {
    id: 'display.campaigns.dashboard.adGroupCard.status.pauseAll',
    defaultMessage: 'Paused',
  },
  archiveSuccess: {
    id: 'display.campaigns.dashboard.adGroupCard.archive.successMsg',
    defaultMessage: 'Ad Groups successfully archived',
  },
  saveSuccess: {
    id: 'display.campaigns.dashboard.adGroupCard.save.successMsg',
    defaultMessage: 'Ad Groups successfully saved',
  },
});

interface AdGroupCardProps extends CardProps {
  isFetching: boolean;
  isFetchingStat: boolean;
  dataSet?: AdGroupResource[];
  updateAdGroup: (
    adGroupId: string,
    body: Partial<AdGroupResource>,
    successMessage?: UpdateMessage,
    errorMessage?: UpdateMessage,
    undoBody?: Partial<AdGroupResource>,
  ) => Promise<any>;
  campaign?: Omit<DisplayCampaignInfoResource, 'ad_groups'>;
}

interface AdGroupCardState {
  selectedRowKeys: string[];
  visible: boolean;
  allRowsAreSelected: boolean;
  isArchiving: boolean;
  isUpdatingStatuses: boolean;
}

type JoinedProps = AdGroupCardProps &
  RouteComponentProps<CampaignRouteParams> &
  InjectedDrawerProps &
  InjectedNotificationProps &
  InjectedIntlProps;

class AdGroupCard extends React.Component<JoinedProps, AdGroupCardState> {
  @lazyInject(TYPES.IAdGroupFormService)
  private _adGroupFormService: IAdGroupFormService;

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      visible: false,
      allRowsAreSelected: false,
      isArchiving: false,
      isUpdatingStatuses: false,
    };
  }
  updateLocationSearch(params: McsDateRangeValue) {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, DISPLAY_DASHBOARD_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }
  renderDatePicker() {
    const {
      location: { search },
    } = this.props;

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
    const mcsdatePickerMsg = convertMessageDescriptorToString(
      mcsDateRangePickerMessages,
      this.props.intl,
    ) as McsDateRangePickerMessages;
    return (
      <McsDateRangePicker
        values={values}
        onChange={onChange}
        messages={mcsdatePickerMsg}
        className='mcs-datePicker_container'
      />
    );
  }

  archiveAdGroups = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = () => {
    const { intl } = this.props;
    this.setState({
      visible: false,
      selectedRowKeys: [],
    });
    message.success(intl.formatMessage(messagesMap.archiveSuccess));
  };

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  closeDrawerAndNotify = () => {
    const { intl } = this.props;
    this.setState({
      selectedRowKeys: [],
    });
    this.props.closeNextDrawer();
    message.success(intl.formatMessage(messagesMap.saveSuccess));
  };

  openEditAdGroupsDrawer = () => {
    const { allRowsAreSelected } = this.state;
    const additionalProps: {
      close: () => void;
      onSave: (formData: EditAdGroupsFormData) => Promise<any>;
      selectedRowKeys?: string[];
    } = {
      close: this.props.closeNextDrawer,
      onSave: this.saveAdGroups,
    };
    if (allRowsAreSelected) {
      additionalProps.selectedRowKeys = undefined;
    } else {
      additionalProps.selectedRowKeys = this.state.selectedRowKeys;
    }
    const options = {
      additionalProps: additionalProps,
    };
    this.props.openNextDrawer<EditAdGroupsFormProps>(EditAdGroupsForm, options);
  };

  makeEditAction = (adGroupIds: string[], formData: EditAdGroupsFormData) => {
    const {
      match: {
        params: { campaignId },
      },
    } = this.props;
    return this._adGroupFormService
      .saveAdGroups(campaignId, adGroupIds, formData)
      .then(result => {
        this.closeDrawerAndNotify();
        return result;
      })
      .catch(err => {
        this.props.notifyError(err);
        throw err;
      });
  };

  saveAdGroups = (formData: EditAdGroupsFormData) => {
    const { dataSet } = this.props;

    const { selectedRowKeys, allRowsAreSelected } = this.state;

    if (allRowsAreSelected && dataSet) {
      const allAdGroupsIds = dataSet.map(adGroup => {
        return adGroup.id;
      });
      return this.makeEditAction(allAdGroupsIds, formData);
    } else {
      return this.makeEditAction(selectedRowKeys, formData);
    }
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  selectAllItemIds = () => {
    this.setState({
      allRowsAreSelected: true,
    });
  };

  unselectAllItemIds = () => {
    this.setState({
      selectedRowKeys: [],
      allRowsAreSelected: false,
    });
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
  };

  handleStatusAction = (status: AdGroupStatus) => {
    const { allRowsAreSelected, selectedRowKeys } = this.state;
    const { dataSet, updateAdGroup } = this.props;
    this.setState({
      isUpdatingStatuses: true,
    });
    let adGroupIdsToUpdate: string[] = [];
    if (allRowsAreSelected && dataSet) {
      adGroupIdsToUpdate = dataSet.map(adGroup => {
        return adGroup.id;
      });
    } else {
      adGroupIdsToUpdate = selectedRowKeys;
    }

    const tasks: Task[] = [];
    adGroupIdsToUpdate.forEach(adGroupId => {
      tasks.push(() => {
        return updateAdGroup(adGroupId, {
          status,
        });
      });
    });
    executeTasksInSequence(tasks)
      .then(() => {
        this.setState({
          selectedRowKeys: [],
          allRowsAreSelected: false,
          isUpdatingStatuses: false,
        });
      })
      .catch((err: any) => {
        this.props.notifyError(err);
      });
  };

  buildMenu = () => {
    const onClick = (event: any) => {
      switch (event.key) {
        case 'pause':
          return this.handleStatusAction('PAUSED');
        case 'activate':
          return this.handleStatusAction('ACTIVE');
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
    const {
      history,
      match: {
        params: { campaignId, organisationId },
      },
      updateAdGroup,
      title,
      isFetching,
      isFetchingStat,
      dataSet,
      campaign,
    } = this.props;

    const { selectedRowKeys, allRowsAreSelected, isUpdatingStatuses } = this.state;

    const hasSelected = !!(selectedRowKeys && selectedRowKeys.length > 0);

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

    const onClick = () => {
      history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/create`, {
        from: `${location.pathname}${location.search}`,
      });
    };
    const adGroupButtons: JSX.Element = (
      <span className='mcs-modal_container'>
        {campaign && campaign.model_version !== 'V2014_06' && (
          <Button className='m-r-10' type='primary' onClick={onClick}>
            <FormattedMessage {...messages.newAdGroups} />
          </Button>
        )}
        {this.renderDatePicker()}
        <Slide
          toShow={hasSelected}
          horizontal={true}
          content={
            <Button className='m-r-10 button-slider button-glow' onClick={this.archiveAdGroups}>
              <McsIcon type='delete' />
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
        {campaign && campaign.model_version !== 'V2014_06' ? (
          <Slide
            toShow={hasSelected}
            horizontal={true}
            content={
              <Button
                className='m-r-10 button-slider button-glow'
                onClick={this.openEditAdGroupsDrawer}
              >
                <McsIcon type='pen' />
                <FormattedMessage {...messages.editAdGroup} />
              </Button>
            }
          />
        ) : null}
        <Slide toShow={hasSelected} horizontal={true} content={buildActionElement()} />
      </span>
    );

    const rowSelection = {
      selectedRowKeys,
      allRowsAreSelected,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onChange: this.onSelectChange,
      onSelect: this.unsetAllItemsSelectedFlag,
      onSelectAll: this.unsetAllItemsSelectedFlag,
    };

    return (
      <Card title={title} buttons={adGroupButtons} className='mcs-table-container'>
        <hr />
        <DisplayCampaignAdGroupTable
          isFetching={isFetching || isUpdatingStatuses}
          isFetchingStat={isFetchingStat}
          dataSet={dataSet}
          updateAdGroup={updateAdGroup}
          rowSelection={rowSelection}
          campaign={campaign}
        />
      </Card>
    );
  }
}

export default compose<AdGroupCardProps, AdGroupCardProps>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(AdGroupCard);
