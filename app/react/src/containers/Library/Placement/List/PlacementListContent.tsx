import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Modal } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { PlacementListResource } from '../../../../models/placement/PlacementListResource';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IPlacementListService } from '../../../../services/Library/PlacementListService';

interface PlacementListContentState {
  loading: boolean;
  data: PlacementListResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

type Props = RouteComponentProps<RouterProps> & InjectedIntlProps;

class PlacementListContent extends React.Component<
  Props,
  PlacementListContentState
> {
  @lazyInject(TYPES.IPlacementListService)
  private _placementListService: IPlacementListService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      data: [],
      total: 0,
    };
  }

  archivePlacementList = (placementId: string) => {
    return this._placementListService.deletePlacementList(placementId);
  };

  fetchPlacementList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._placementListService
        .getPlacementLists(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  };

  onClickArchive = (placement: PlacementListResource) => {
    const {
      location: { search, state, pathname },
      history,
      match: {
        params: { organisationId },
      },
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
    const { history } = this.props;

    history.push(`placementlist/${placement.id}/edit`);
  };

  render() {
    const actionsColumnsDefinition: Array<ActionsColumnDefinition<
      PlacementListResource
    >> = [
      {
        key: 'action',
        actions: () => [
          { intlMessage: messages.edit, callback: this.onClickEdit },
          { intlMessage: messages.archive, callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: PlacementListResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`placementlist/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string
    } = {
      iconType: 'library',
      message: this.props.intl.formatMessage(messages.empty)
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
