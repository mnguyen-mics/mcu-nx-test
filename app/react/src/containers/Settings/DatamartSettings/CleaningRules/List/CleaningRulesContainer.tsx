import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView';
import messages from './messages';
import { UserEventCleaningRuleResource } from '../../../../../models/cleaningRules/CleaningRules';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IDatamartService } from '../../../../../services/DatamartService';
import { PaginationSearchSettings } from '../../../../../utils/LocationSearchHelper';
import { Layout, Row } from 'antd';
import * as moment from 'moment';
import 'moment-duration-format';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

const { Content } = Layout;

interface CleaningRulesContainerState {
  loading: boolean;
  data: UserEventCleaningRuleResource[];
  total: number;
}

export interface CleaningRulesContainerProps {
  filter: PaginationSearchSettings;
  onFilterChange: (newFilter: PaginationSearchSettings) => void;
  datamartId: string;
}

type Props = CleaningRulesContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class CleaningRulesContainer extends React.Component<Props, CleaningRulesContainerState> {

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  componentDidMount() {
    const {
      datamartId,
      filter
    } = this.props;

    this.fetchCleaningRules(datamartId, filter);
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      datamartId,
      filter,
    } = this.props;

    const {
      datamartId: nextDatamartId,
      filter: nextFilter,
    } = nextProps;

    if (
      (filter !== nextFilter) ||
      (datamartId !== nextDatamartId)
    ) {
      this.fetchCleaningRules(nextDatamartId, nextFilter);
    }
  }

  fetchCleaningRules = (datamartId: string, filter: PaginationSearchSettings) => {
    this.setState({ loading: true, }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._datamartService.getCleaningRules(datamartId, options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  }

  render() {

    const {
      filter,
      onFilterChange,
    } = this.props;

    const {
      data,
      loading,
    } = this.state;

    const dataColumns = [
      {
        intlMessage: messages.id,
        key: 'id',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResource) => (<span>{text}</span>),
      },
      {
        intlMessage: messages.lifeDuration,
        key: 'life_duration',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResource) => (
          <span>
            {moment.duration(text).format()}
          </span>
        ),
      },
      {
        intlMessage: messages.type,
        key: 'type',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResource) => (<span>{text}</span>),
      },
      {
        intlMessage: messages.activityTypeFilter,
        key: 'activity_type_filter',
        isHideable: false,
        render: (text: string, record: UserEventCleaningRuleResource) => {
          return record.activity_type_filter && (
            <span>{record.activity_type_filter}</span>
          )
        },
      },
    ];

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: this.state.total,
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
                dataSource={data}
                loading={loading}
                pagination={pagination}
              />
            </div>
          </Row>
        </Content>
      </div>
    )
  }
}

export default compose<Props, CleaningRulesContainerProps>(
  withRouter,
  injectIntl,
)(CleaningRulesContainer);