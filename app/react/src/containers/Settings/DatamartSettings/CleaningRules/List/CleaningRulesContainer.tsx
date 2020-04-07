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
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IDatamartService } from '../../../../../services/DatamartService';
import { Layout, Row, Icon } from 'antd';
import 'moment-duration-format';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
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

class CleaningRulesContainer extends React.Component<
  Props> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;


  // componentDidMount() {
  //   const { filter } = this.props;

  //   this.fetchCleaningRules(filter);
  // }

  // componentDidUpdate(previousProps: Props, previousState: CleaningRulesContainerState) {
  //   const { filter } = this.props;

  //   const { filter: previousFilter } = previousProps;

  //   const { isFetchingCleaningRules } = this.state;

  //   if (filter !== previousFilter && !isFetchingCleaningRules) {
  //     this.fetchCleaningRules(filter);
  //   }
  // }

  fetchCleaningRules = (filter: CleaningRulesFilter) => {
    const { notifyError } = this.props;
    this.setState(
      {
        isFetchingCleaningRules: true,
      },
      () => {
        const options = {
          ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
          type: filter.type,
        };
        this._datamartService
          .getCleaningRules(filter.datamartId, options)
          .then(results => {
            const cleaningRulesP: Array<Promise<
              ExtendedCleaningRuleResourceWithFilter
            >> = results.data.map(cleaningRule => {
              return filter.type === 'USER_EVENT_CLEANING_RULE'
                ? this._datamartService
                    .getContentFilter(filter.datamartId, cleaningRule.id)
                    .then(resFilter => {
                      const contentFilter = resFilter.data;

                      const cleaningRuleWithFilter: ExtendedCleaningRuleResourceWithFilter = {
                        ...cleaningRule,
                        ...contentFilter,
                      };

                      return cleaningRuleWithFilter;
                    })
                    .catch(err => {
                      return Promise.resolve(cleaningRule);
                    })
                : Promise.resolve(cleaningRule);
            });

            Promise.all(cleaningRulesP).then(cleaningRules => {
              this.setState({
                isFetchingCleaningRules: false,
                cleaningRules: cleaningRules,
                total: results.total || results.count,
              });
            });
          })
          .catch(err => {
            notifyError(err);
            this.setState({ isFetchingCleaningRules: false });
          });
      },
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
      workspace,
      intl,
    } = this.props;

    const datamartItems = workspace(organisationId).datamarts.map(d => ({
      key: d.id,
      value: d.name || d.token,
    }));

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
