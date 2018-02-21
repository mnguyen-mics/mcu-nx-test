import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import PlacementListsService from '../../../../services/Library/PlacementListsService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { PlacementListResource } from '../../../../models/placement/PlacementListResource';
import messages from './messages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface PlacementListContentState {
  loading: boolean;
  data: PlacementListResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class PlacementListContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  PlacementListContentState
> {
  state = initialState;

  archivePlacementList = (placementId: string) => {
    return PlacementListsService.deletePlacementList(placementId);
  };

  fetchPlacementList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      PlacementListsService.getPlacementLists(organisationId, options).then(
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

  onClickArchive = (placement: PlacementListResource) => {
    const {
      location: { search, state, pathname },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.placementArchiveTitle),
      content: formatMessage(messages.placementArchiveMessage),
      okText: formatMessage(messages.placementArchiveOk),
      cancelText: formatMessage(messages.placementArchiveCancel),
      onOk: () => {
        this.archivePlacementList(placement.id).then(() => {
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
          return this.fetchPlacementList(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (placement: PlacementListResource) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(`/${organisationId}/library/placementlists/${placement.id}`);
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
        render: (text: string, record: PlacementListResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`v2/o/${organisationId}/library/placementlists/${record.id}`}
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
        fetchList={this.fetchPlacementList}
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

export default compose(withRouter, injectIntl)(PlacementListContent);
