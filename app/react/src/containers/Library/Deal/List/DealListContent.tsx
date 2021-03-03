import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import ItemList, { Filters } from '../../../../components/ItemList';
import { IDealListService } from '../../../../services/Library/DealListService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { DealsListResource } from '../../../../models/dealList/dealList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface DealListContentState {
  loading: boolean;
  data: DealsListResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class DealListContent extends React.Component<
  RouteComponentProps<RouterProps> &
    InjectedIntlProps &
    InjectedNotificationProps,
  DealListContentState
> {
  state = initialState;

  @lazyInject(TYPES.IDealListService)
  private _dealsListService: IDealListService;

  archiveDealList = (dealListId: string) => {
    const {
      match: {
        params: { organisationId },
      },
      notifyError,
    } = this.props;
    this.setState({ loading: true });
    return this._dealsListService
      .deleteDealList(organisationId, dealListId)
      .then((r) =>
        this.fetchDealList(organisationId, { currentPage: 1, pageSize: 10 }),
      )
      .catch((err) => notifyError(err));
  };

  fetchDealList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._dealsListService
        .getDealLists(organisationId, options)
        .then((results) => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  };

  onClickArchive = (dealList: DealsListResource) => {
    const {
      location: { search, pathname, state },
      history,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.dealListArchiveTitle),
      content: formatMessage(messages.dealListArchiveMessage),
      okText: formatMessage(messages.dealListArchiveOk),
      cancelText: formatMessage(messages.dealListArchiveCancel),
      onOk: () => {
        this.archiveDealList(dealList.id).then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchDealList(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (dealList: DealsListResource) => {
    const { history } = this.props;

    history.push(`deallist/${dealList.id}/edit`);
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<
      ActionsColumnDefinition<DealsListResource>
    > = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.edit),
            callback: this.onClickEdit,
          },
          {
            message: formatMessage(messages.archive),
            callback: this.onClickArchive,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<
      DataColumnDefinition<DealsListResource>
    > = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: DealsListResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`deallist/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'library',
      message: this.props.intl.formatMessage(messages.empty),
    };

    return (
      <ItemList
        fetchList={this.fetchDealList}
        dataSource={this.state.data}
        loading={this.state.loading}
        total={this.state.total}
        columns={dataColumnsDefinition}
        actionsColumnsDefinition={actionsColumnsDefinition}
        pageSettings={PAGINATION_SEARCH_SETTINGS}
        emptyTable={emptyTable}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
)(DealListContent);
