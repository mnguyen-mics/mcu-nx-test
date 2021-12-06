import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import {
  Button as McsButton,
  McsIcon,
  TableViewFilters,
} from '@mediarithmics-private/mcs-components-library';
import messages from './messages';
import {
  ExtendedCleaningRuleResource,
  ExtendedCleaningRuleResourceWithFilter,
  UserEventCleaningRuleResourceWithFilter,
  CleaningRuleStatus,
  getNextCleaningRuleStatus,
  UserProfileCleaningRuleResource,
} from '../../../../../models/cleaningRules/CleaningRules';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Layout, Row, Modal, Button } from 'antd';
import 'moment-duration-format';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { connect } from 'react-redux';
import { CleaningRulesFilter } from '../domain';
import { MultiSelectProps } from '@mediarithmics-private/mcs-components-library/lib/components/multi-select';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartService } from '../../../../../services/DatamartService';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Loading } from '../../../../../components';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

interface DatamartItems {
  key: string;
  value: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

interface CleaningRulesContainerProps {
  filter: CleaningRulesFilter;
  onFilterChange: (newFilter: Partial<CleaningRulesFilter>) => void;
  isFetchingCleaningRules: boolean;
  cleaningRules: ExtendedCleaningRuleResourceWithFilter[];
  onCleaningRuleUpdate: () => void;
  total: number;
}

type Props = CleaningRulesContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps;

interface State {
  datamartItems: DatamartItems[];
  isLoading: boolean;
}

class CleaningRulesContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);

    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.state = {
      datamartItems: this.getDatamartItemsFromOrganisationId(organisationId),
      isLoading: false,
    };
  }

  getDatamartItemsFromOrganisationId = (organisationId: string) => {
    const { workspace } = this.props;

    return workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));
  };

  componentDidUpdate(previousProps: Props) {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      match: {
        params: { organisationId: previousOrganisationId },
      },
    } = previousProps;

    if (organisationId !== previousOrganisationId) {
      this.setState({
        datamartItems: this.getDatamartItemsFromOrganisationId(organisationId),
      });
    }
  }

  onEditCleaningRule = (cleaningRule: ExtendedCleaningRuleResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
      filter,
    } = this.props;

    const cleaningRuleType =
      filter.type === 'USER_EVENT_CLEANING_RULE' ? 'user_event' : 'user_profile';

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${cleaningRule.datamart_id}/cleaning_rules/${cleaningRuleType}/${cleaningRule.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  onDeleteCleaningRule = (cleaningRule: ExtendedCleaningRuleResource) => {
    const {
      intl: { formatMessage },
      notifyError,
      onCleaningRuleUpdate,
    } = this.props;

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.deleteCleaningRuleModalTitle),
      okText: formatMessage(messages.deleteCleaningRuleModalOk),
      cancelText: formatMessage(messages.deleteCleaningRuleModalCancel),
      okButtonProps: { className: 'mcs-cleaningRulesContainer_confirm_delete' },
      onOk: () => {
        this._datamartService
          .deleteCleaningRule(cleaningRule.datamart_id, cleaningRule.id)
          .then(() => {
            onCleaningRuleUpdate();
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel: () => {
        // Cancel
      },
    });
  };

  buildNewActionElement = (organisationId: string) => {
    const { filter } = this.props;

    const cleaningRuleType =
      filter.type === 'USER_EVENT_CLEANING_RULE' ? 'user_event' : 'user_profile';

    const url = `/v2/o/${organisationId}/settings/datamart/cleaning_rules/${cleaningRuleType}/create`;

    return (
      <Link key={messages.newCleaningRule.id} to={url}>
        <Button
          key={messages.newCleaningRule.id}
          className='mcs-cleaningRules_creation_button'
          type='primary'
        >
          <FormattedMessage {...messages.newCleaningRule} />
        </Button>
      </Link>
    );
  };

  renderModal = (record: ExtendedCleaningRuleResource) => {
    const {
      intl: { formatMessage },
      onCleaningRuleUpdate,
      notifyError,
    } = this.props;

    const contentText = this.getUpdateStatusModalText(record.status);

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.updateStatusModalTitle),
      content: contentText,
      okText: formatMessage(messages.updateStatusModalConfirm),
      okButtonProps: { className: 'mcs-cleaningRulesContainer_status_confirm_modal' },
      cancelText: formatMessage(messages.updateCleaningRuleModalCancel),
      onOk: () => {
        this.setState({ isLoading: true });
        record.status = getNextCleaningRuleStatus(record.status);
        this._datamartService
          .updateCleaningRule(record.datamart_id, record.id, record)
          .then(() => {
            this.setState({ isLoading: false });
            onCleaningRuleUpdate();
          })
          .catch(err => {
            this.setState({ isLoading: false });
            notifyError(err);
          });
      },
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      filter,
      onFilterChange,
      cleaningRules,
      isFetchingCleaningRules,
      total,
      intl: { formatMessage },
    } = this.props;

    const { datamartItems, isLoading } = this.state;

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    const button = (
      <span className='mcs-card-button'>{this.buildNewActionElement(organisationId)}</span>
    );

    if (datamartItems.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage {...messages.datamartFilter} />
            <DownOutlined />
          </div>
        ),
        selectedItems: filter.datamartId
          ? [datamartItems.find(di => di.key === filter.datamartId)]
          : [datamartItems[0]],
        items: datamartItems,
        singleSelectOnly: true,
        getKey: (item: any) => (item && item.key ? item.key : ''),
        display: (item: any) => item.value,
        handleItemClick: (datamartItem: { key: string; value: string }) => {
          onFilterChange({
            datamartId: datamartItem.key,
            currentPage: 1,
          });
        },
      };

      filtersOptions.push(datamartFilter);
    }

    const eventBasedAddedDataColumns: Array<DataColumnDefinition<ExtendedCleaningRuleResource>> = [
      {
        title: formatMessage(messages.channelFilter),
        key: 'channel_filter',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResourceWithFilter) => (
          <span>{record.channel_filter ? record.channel_filter : formatMessage(messages.all)}</span>
        ),
      },
      {
        title: formatMessage(messages.activityTypeFilter),
        key: 'activity_type_filter',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResourceWithFilter) => (
          <span>
            {record.activity_type_filter
              ? record.activity_type_filter
              : formatMessage(messages.all)}
          </span>
        ),
      },
      // No other content_type is implemented for the moment
      {
        title: formatMessage(messages.contentFilterValue),
        key: 'filter',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResourceWithFilter) => (
          <span>{record.filter ? record.filter : formatMessage(messages.noFilter)}</span>
        ),
      },
    ];

    const profileBasedAddedDataColumns: Array<DataColumnDefinition<ExtendedCleaningRuleResource>> =
      [
        {
          title: formatMessage(messages.compartmentFilter),
          key: 'compartment_filter',
          isHideable: false,
          render: (text: string, record: UserProfileCleaningRuleResource) => (
            <span>
              {record.compartment_filter ? record.compartment_filter : formatMessage(messages.all)}
            </span>
          ),
        },
      ];

    const baseDataColumns: Array<DataColumnDefinition<ExtendedCleaningRuleResource>> = [
      {
        title: formatMessage(messages.status),
        key: 'status',
        isHideable: false,
        render: (text: string, record: ExtendedCleaningRuleResource) => {
          const updateStatusButton = this.getUpdateStatusButton(record);
          return (
            <span>
              <McsIcon type='status' className={this.getStatusColor(record.status)} />
              <span>{record.status}</span>
              {updateStatusButton !== undefined ? updateStatusButton : ''}
            </span>
          );
        },
      },
      {
        title: formatMessage(messages.action),
        key: 'action',
        isHideable: false,
        render: (text: string, record: ExtendedCleaningRuleResource) => (
          <span>{record.action}</span>
        ),
      },
      {
        title: formatMessage(messages.lifeDuration),
        key: 'life_duration',
        isHideable: false,
        render: (text: string, record: ExtendedCleaningRuleResource) => {
          if (record.life_duration) {
            const duration = moment.duration(record.life_duration);
            const durationList = [
              { number: duration.years(), unit: 'year' },
              { number: duration.months(), unit: 'month' },
              { number: duration.days(), unit: 'day' },
            ];

            const durationStr = durationList.reduce((accumulator, currentValue) => {
              if (currentValue.number !== 0) {
                const prefixCurrentValue = accumulator !== undefined ? `${accumulator}, ` : '';
                const strCurrentValue = `${currentValue.number} ${currentValue.unit}`;
                const suffixCurrentValue = currentValue.number === 1 ? '' : 's';
                return `${prefixCurrentValue}${strCurrentValue}${suffixCurrentValue}`;
              } else return accumulator;
            }, undefined);

            return <span>{durationStr}</span>;
          }
          return <span>{'No duration'}</span>;
        },
      },
    ];

    const dataColumns = baseDataColumns.concat(
      filter.type === 'USER_EVENT_CLEANING_RULE'
        ? eventBasedAddedDataColumns
        : profileBasedAddedDataColumns,
    );

    const actionColumns: Array<ActionsColumnDefinition<ExtendedCleaningRuleResource>> = [
      {
        key: 'action',
        actions: (record: ExtendedCleaningRuleResource) => [
          {
            message: formatMessage(messages.editCleaningRule),
            disabled: record.status !== 'DRAFT',
            callback: this.onEditCleaningRule,
            className: 'mcs-cleaningRulesActions_EDIT',
          },
          {
            message: formatMessage(messages.deleteCleaningRule),
            disabled: record.status !== 'DRAFT',
            callback: this.onDeleteCleaningRule,
            className: 'mcs-cleaningRulesActions_DELETE',
          },
        ],
      },
    ];

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: total,
      onChange: (page: number, size: number) =>
        onFilterChange({
          currentPage: page,
          pageSize: size,
        }),
      onShowSizeChange: (current: number, size: number) =>
        onFilterChange({
          currentPage: 1,
          pageSize: size,
        }),
    };

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    } else
      return (
        <div className='ant-layout'>
          <Content className='mcs-content-container'>
            <Row className='mcs-table-container'>
              <div>
                <div className='mcs-card-header mcs-card-title'>
                  <span className='mcs-card-title'>
                    <FormattedMessage {...messages.cleaningRules} />
                  </span>
                  {button}
                </div>
                <hr className='mcs-separator' />
                <TableViewFilters
                  columns={dataColumns}
                  actionsColumnsDefinition={actionColumns}
                  dataSource={cleaningRules}
                  loading={isFetchingCleaningRules}
                  pagination={pagination}
                  filtersOptions={filtersOptions}
                  className='mcs-cleaningRules_table'
                />
              </div>
            </Row>
          </Content>
        </div>
      );
  }

  getStatusColor = (status: CleaningRuleStatus) => {
    switch (status) {
      case 'LIVE':
        return 'mcs-cleaning-rules-status-live';
      case 'DRAFT':
        return 'mcs-cleaning-rules-status-draft';
      case 'ARCHIVED':
        return 'mcs-cleaning-rules-status-archived';
    }
  };

  getButtonText = (status: CleaningRuleStatus) => {
    const { intl } = this.props;

    switch (status) {
      case 'DRAFT':
        return intl.formatMessage(messages.updateStatusToLiveButton);
      case 'LIVE':
        return intl.formatMessage(messages.updateStatusToArchivedButton);
      default:
        return '';
    }
  };

  getUpdateStatusModalText = (status: CleaningRuleStatus) => {
    const { intl } = this.props;

    switch (status) {
      case 'DRAFT':
        return intl.formatMessage(messages.updateStatusToLiveModalText);
      case 'LIVE':
        return intl.formatMessage(messages.updateStatusToArchivedText);
      default:
        return '';
    }
  };

  getUpdateStatusButton = (record: ExtendedCleaningRuleResource) => {
    if (record.status !== 'ARCHIVED') {
      const buttonText = this.getButtonText(record.status);
      const displayModal = () => this.renderModal(record);
      return (
        <McsButton
          className='update-cleaning-rule-status mcs-cleaningRulesContainer_update_status'
          onClick={displayModal}
        >
          {buttonText}
        </McsButton>
      );
    } else {
      return undefined;
    }
  };
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
});

export default compose<Props, CleaningRulesContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(CleaningRulesContainer);
