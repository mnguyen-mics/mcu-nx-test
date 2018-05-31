import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import DealListsService from '../../../../services/Library/DealListsService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { DealsListResource } from '../../../../models/dealList/dealList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import injectNotifications, { InjectedNotificationProps } from '../../../Notifications/injectNotifications';

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
  RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedNotificationProps,
  DealListContentState
> {
  state = initialState;

  archiveDealList = (dealListId: string) => {
    const { match: { params: { organisationId } }, notifyError } = this.props;
    this.setState({ loading: true })
    return DealListsService.deleteDealList(organisationId, dealListId)
      .then(r => this.fetchDealList(organisationId, { currentPage: 1, pageSize: 10 }))
      .catch(err => notifyError(err));
  };

  fetchDealList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      DealListsService.getDealLists(organisationId, options).then(
        results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        },
      );
    });
  };

  onClickArchive = (dealList: DealsListResource) => {
    const {
      location: { search, pathname, state },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
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
    const { match: { params: { organisationId } } } = this.props;

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [
          { translationKey: 'EDIT', callback: this.onClickEdit },
          { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: DealsListResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`v2/o/${organisationId}/library/deallist/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'library',
      intlMessage: messages.empty,
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

export default compose(withRouter, injectIntl, injectNotifications)(DealListContent);
