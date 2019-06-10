import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView';
import messages from './messages';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import DatamartService from '../../../../../services/DatamartService';
import { PaginationSearchSettings } from '../../../../../utils/LocationSearchHelper';
import { Layout, Row } from 'antd';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';

const { Content } = Layout;

interface CompartmentsContainerState {
  loading: boolean;
  data: UserAccountCompartmentDatamartSelectionResource[];
  total: number;
}

export interface CompartmentsContainerProps {
  filter: PaginationSearchSettings;
  onFilterChange: (newFilter: PaginationSearchSettings) => void;
  datamartId: string;
}

type Props = CompartmentsContainerProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedIntlProps;

class CompartmentsContainer extends React.Component<Props, CompartmentsContainerState> {

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

    this.fetchCompartments(datamartId, filter);
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
      this.fetchCompartments(nextDatamartId, nextFilter);
    }
  }

  fetchCompartments = (datamartId: string, filter: PaginationSearchSettings) => {
    this.setState({ loading: true, }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      DatamartService.getUserAccountCompartments(datamartId, options).then(results => {
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
        key: 'compartment_id',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (<span>{text}</span>),
      },
      {
        intlMessage: messages.default,
        key: 'default',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>
            {record.default ? 'yes' : 'no'}
          </span>
        ),
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>
            {text}
          </span>
        ),
      },
      {
        intlMessage: messages.token,
        key: 'token',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>
            {text}
          </span>
        ),
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
                  <FormattedMessage {...messages.compartments} />
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

export default compose<Props, CompartmentsContainerProps>(
  withRouter,
  injectIntl,
)(CompartmentsContainer);