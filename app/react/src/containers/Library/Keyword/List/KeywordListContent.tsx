import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { McsIconType } from '../../../../components/McsIcons';
import ItemList, { Filters } from '../../../../components/ItemList';
import KeywordListsService from '../../../../services/Library/KeywordListsService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { Keyword } from '../../../../models/keywordList/keywordList';
import { PAGINATION_SEARCH_SETTINGS, parseSearch, updateSearch } from '../../../../utils/LocationSearchHelper';
import messages from './messages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface KeywordListContentState {
  loading: boolean;
  data: Keyword[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class KeywordListContent extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps, KeywordListContentState> {

  state = initialState;

  archiveKeywordList = (keywordId: string) => {
    return KeywordListsService.deleteKeywordLists(keywordId);
  }

  fetchKeywordList = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      KeywordListsService.getKeywordLists(organisationId, options)
        .then((results) => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  }

  onClickArchive = (keyword: Keyword) => {
    const {
      location: {
        search,
        pathname,
        state,
      },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const {
      data,
    } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.keywordArchiveTitle),
      content: formatMessage(messages.keywordArchiveMessage),
      okText: formatMessage(messages.keywordArchiveOk),
      cancelText: formatMessage(messages.keywordArchiveCancel),
      onOk: () => {
        this.archiveKeywordList(keyword.id)
        .then(() => {
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
  }

  onClickEdit = (keyword: Keyword) => {
    const {
      history,
      match: { params: { organisationId } },
    } = this.props;

    history.push(`/${organisationId}/library/keywordslists/${keyword.id}`);
  }

  resetKeywordList = () => {
    this.setState(initialState);
  }

  render() {
    const {
      match: { params: { organisationId } },
    } = this.props;

    const actions = {
      fetchList: this.fetchKeywordList,
      resetList: this.resetKeywordList,
    };

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'EDIT', callback: this.onClickEdit },
            { translationKey: 'ARCHIVE', callback: this.onClickArchive },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'NAME',
          intlMessage: messages.name,
          key: 'name',
          isHideable: false,
          render: (text: string, record: Keyword) => (
            <Link
              className="mcs-campaigns-link"
              to={`/${organisationId}/library/keywordslists/${record.id}`}
            >{text}
            </Link>
          ),
        },
      ],
    };

    const emptyTable: {
      iconType: McsIconType,
      intlMessage: FormattedMessage.Props,
      } = {
      iconType: 'library',
      intlMessage: messages.empty,
    };

    return (
      <ItemList
        actions={actions}
        dataSource={this.state.data}
        isLoading={this.state.loading}
        total={this.state.total}
        columnsDefinitions={columnsDefinitions}
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
