import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import { IKeywordListService } from '../../../../services/Library/KeywordListsService';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { KeywordListResource } from '../../../../models/keywordList/keywordList';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import messages from './messages';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface KeywordListContentState {
  loading: boolean;
  data: KeywordListResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class KeywordListContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  KeywordListContentState
> {
  state = initialState;

  @lazyInject(TYPES.IKeywordListService)
  private _keywordListService: IKeywordListService;

  archiveKeywordList = (keywordId: string) => {
    return this._keywordListService.deleteKeywordLists(keywordId);
  };

  fetchKeywordList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._keywordListService
        .getKeywordLists(organisationId, options)
        .then(results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  };

  onClickArchive = (keyword: KeywordListResource) => {
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
      iconType: 'exclamation-circle',
      title: formatMessage(messages.keywordArchiveTitle),
      content: formatMessage(messages.keywordArchiveMessage),
      okText: formatMessage(messages.keywordArchiveOk),
      cancelText: formatMessage(messages.keywordArchiveCancel),
      onOk: () => {
        this.archiveKeywordList(keyword.id).then(() => {
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
          return this.fetchKeywordList(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (keyword: KeywordListResource) => {
    const { history } = this.props;

    history.push(`keywordslist/${keyword.id}/edit`);
  };

  render() {
    const actionsColumnsDefinition: Array<
      ActionsColumnDefinition<KeywordListResource>
    > = [
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
        render: (text: string, record: KeywordListResource) => (
          <Link
            className="mcs-campaigns-link"
            to={`keywordslist/${record.id}/edit`}
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
        fetchList={this.fetchKeywordList}
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
)(KeywordListContent);
