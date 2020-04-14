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
import { Layout, Row, Icon } from 'antd';
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

  render() {
    const {
      filter,
      onFilterChange,
      cleaningRules,
      isFetchingCleaningRules,
      total,
      intl,
    } = this.props;

    const { datamartItems } = this.state;

    const filtersOptions: Array<MultiSelectProps<any>> = [];

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
        ) => <span>{record.life_duration}</span>,
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
              </div>
              <hr className="mcs-separator" />
              <TableViewFilters
                columns={dataColumns}
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
