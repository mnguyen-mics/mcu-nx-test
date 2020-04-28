import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView';
import messages from './messages';
import {
  ExtendedCleaningRuleResource,
  ExtendedCleaningRuleResourceWithFilter,
  UserEventCleaningRuleResourceWithFilter,
} from '../../../../../models/cleaningRules/CleaningRules';
import { Layout, Row, Icon, Modal, Button } from 'antd';
import 'moment-duration-format';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { connect } from 'react-redux';
import { CleaningRulesFilter } from '../domain';
import { MultiSelectProps } from '../../../../../components/MultiSelect';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartService } from '../../../../../services/DatamartService';
import { Link } from 'react-router-dom';
import moment from 'moment';

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
  total: number;
}

type Props = CleaningRulesContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps &
  MapStateToProps &
  InjectedNotificationProps;

interface State {
  datamartItems: DatamartItems[];
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
    } = this.props;

    history.push({
      pathname: `/v2/o/${organisationId}/settings/datamart/${cleaningRule.datamart_id}/cleaning_rules/${cleaningRule.id}/edit`,
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  onDeleteCleaningRule = (cleaningRule: ExtendedCleaningRuleResource) => {
    const {
      match: {
        params: { organisationId },
      },
      location,
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.deleteCleaningRuleModalTitle),
      okText: formatMessage(messages.deleteCleaningRuleModalOk),
      cancelText: formatMessage(messages.deleteCleaningRuleModalCancel),
      onOk: () => {
        this._datamartService
          .deleteCleaningRule(cleaningRule.datamart_id, cleaningRule.id)
          .then(() => {
            history.push({
              pathname: `/v2/o/${organisationId}/settings/datamart/cleaning_rules`,
              state: { from: `${location.pathname}${location.search}` },
            });
          })
          .catch(err => {
            notifyError(err);
            history.push({
              pathname: `/v2/o/${organisationId}/settings/datamart/cleaning_rules`,
              state: { from: `${location.pathname}${location.search}` },
            });
          });
      },
      onCancel: () => {
        // Cancel
      },
    });
  };

  buildNewActionElement = (organisationId: string) => {
    const url = `/v2/o/${organisationId}/settings/datamart/cleaning_rules/create`;

    return (
      <Link key={messages.newCleaningRule.id} to={url}>
        <Button key={messages.newCleaningRule.id} type="primary">
          <FormattedMessage {...messages.newCleaningRule} />
        </Button>
      </Link>
    );
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
      intl,
    } = this.props;

    const { datamartItems } = this.state;

    const filtersOptions: Array<MultiSelectProps<any>> = [];

    // New temporarily disabled
    const allowNew = false;

    const button =
      ((filter.type === 'USER_EVENT_CLEANING_RULE') && allowNew) ? (
        <span className="mcs-card-button">
          {this.buildNewActionElement(organisationId)}
        </span>
      ) : (
        undefined
      );

    if (datamartItems.length > 1) {
      const datamartFilter = {
        displayElement: (
          <div>
            <FormattedMessage {...messages.datamartFilter} />
            <Icon type="down" />
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

    const eventBasedAddedDataColumns = [
      {
        intlMessage: messages.lifeDuration,
        key: 'life_duration',
        isHideable: false,
        render: (
          text: string,
          record: UserEventCleaningRuleResourceWithFilter,
        ) => {
          if (record.life_duration) {
            const duration = moment.duration(record.life_duration);
            const durationList = [
              { number: duration.years(), unit: 'year' },
              { number: duration.months(), unit: 'month' },
              { number: duration.days(), unit: 'day' },
            ];

            const durationStr = durationList.reduce(
              (accumulator, currentValue) => {
                if (currentValue.number !== 0) {
                  const prefixCurrentValue =
                    accumulator !== undefined ? `${accumulator}, ` : '';
                  const strCurrentValue = `${currentValue.number} ${currentValue.unit}`;
                  const suffixCurrentValue =
                    currentValue.number === 1 ? '' : 's';
                  return `${prefixCurrentValue}${strCurrentValue}${suffixCurrentValue}`;
                } else return accumulator;
              },
              undefined,
            );

            return <span>{durationStr}</span>;
          }
          return <span>{'No duration'}</span>;
        },
      },
      {
        intlMessage: messages.channelFilter,
        key: 'channel_filter',
        isHideable: false,
        render: (
          text: string,
          record: UserEventCleaningRuleResourceWithFilter,
        ) => (
          <span>
            {record.channel_filter
              ? record.channel_filter
              : intl.formatMessage(messages.all)}
          </span>
        ),
      },
      {
        intlMessage: messages.activityTypeFilter,
        key: 'activity_type_filter',
        isHideable: false,
        render: (
          text: string,
          record: UserEventCleaningRuleResourceWithFilter,
        ) => (
          <span>
            {record.activity_type_filter
              ? record.activity_type_filter
              : intl.formatMessage(messages.all)}
          </span>
        ),
      },
      // No other content_type is implemented for the moment, that
      {
        intlMessage: messages.contentFilterValue,
        key: 'filter',
        isHideable: false,
        render: (
          text: string,
          record: UserEventCleaningRuleResourceWithFilter,
        ) => (
          <span>
            {record.filter
              ? record.filter
              : intl.formatMessage(messages.noFilter)}
          </span>
        ),
      },
    ];

    const baseDataColumns = [
      {
        intlMessage: messages.status,
        key: 'status',
        isHideable: false,
        render: (text: string, record: ExtendedCleaningRuleResource) => (
          <span>{record.status}</span>
        ),
      },
      {
        intlMessage: messages.action,
        key: 'action',
        isHideable: false,
        render: (text: string, record: ExtendedCleaningRuleResource) => (
          <span>{record.action}</span>
        ),
      },
    ];

    const dataColumns = baseDataColumns.concat(
      filter.type === 'USER_EVENT_CLEANING_RULE'
        ? eventBasedAddedDataColumns
        : [],
    );

    const actionColumns:
      | Array<ActionsColumnDefinition<ExtendedCleaningRuleResource>>
      | undefined =
      filter.type === 'USER_EVENT_CLEANING_RULE'
        ? [
            {
              key: 'action',
              actions: (record: ExtendedCleaningRuleResource) => [
                {
                  intlMessage: messages.editCleaningRule,
                  disabled: record.status !== 'DRAFT',
                  callback: this.onEditCleaningRule,
                },
                {
                  intlMessage: messages.deleteCleaningRule,
                  disabled: record.status !== 'DRAFT',
                  callback: this.onDeleteCleaningRule,
                },
              ],
            },
          ]
        : undefined;

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

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <Row className="mcs-table-container">
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.cleaningRules} />
                </span>
                {button}
              </div>
              <hr className="mcs-separator" />
              <TableViewFilters
                columns={dataColumns}
                actionsColumnsDefinition={actionColumns}
                dataSource={cleaningRules}
                loading={isFetchingCleaningRules}
                pagination={pagination}
                filtersOptions={filtersOptions}
              />
            </div>
          </Row>
        </Content>
      </div>
    );
  }
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
