import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { TableViewFilters } from '../../../../../components/TableView';
import messages from './messages';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { IDatamartService } from '../../../../../services/DatamartService';
import { PaginationSearchSettings } from '../../../../../utils/LocationSearchHelper';
import { Layout, Row } from 'antd';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../models/datamart/DatamartResource';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';

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
  InjectedIntlProps &
  InjectedNotificationProps;

class CompartmentsContainer extends React.Component<Props, CompartmentsContainerState> {
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
    const { datamartId, filter } = this.props;

    this.fetchCompartments(datamartId, filter);
  }

  componentDidUpdate(previousProps: Props) {
    const { datamartId, filter } = this.props;

    const { datamartId: previousDatamartId, filter: previousFilter } = previousProps;

    if (filter !== previousFilter || datamartId !== previousDatamartId) {
      this.fetchCompartments(datamartId, filter);
    }
  }

  fetchCompartments = (datamartId: string, filter: PaginationSearchSettings) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._datamartService
        .getUserAccountCompartmentDatamartSelectionResources(datamartId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        })
        .catch(err => {
          this.setState({ loading: false });
          this.props.notifyError(err);
        });
    });
  };

  render() {
    const { filter, onFilterChange } = this.props;

    const { data, loading } = this.state;

    const dataColumns = [
      {
        intlMessage: messages.compartment_id,
        key: 'compartment_id',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>{text}</span>
        ),
      },
      {
        intlMessage: messages.default,
        key: 'default',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>{record.default ? 'yes' : 'no'}</span>
        ),
      },
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>{text}</span>
        ),
      },
      {
        intlMessage: messages.token,
        key: 'token',
        isHideable: false,
        render: (text: string, record: UserAccountCompartmentDatamartSelectionResource) => (
          <span>{text}</span>
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
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <Row className='mcs-table-container'>
            <div>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...messages.compartments} />
                </span>
              </div>
              <hr className='mcs-separator' />
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
    );
  }
}

export default compose<Props, CompartmentsContainerProps>(
  withRouter,
  injectIntl,
  injectNotifications,
)(CompartmentsContainer);
