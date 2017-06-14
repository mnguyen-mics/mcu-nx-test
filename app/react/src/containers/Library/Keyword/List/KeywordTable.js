import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { TableView } from '../../../../components/TableView';

import * as KeywordListsActions from '../../../../state/Library/KeywordLists/actions';

import { KEYWORDS_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state//Library/KeywordLists/selectors';

class KeywordListsTable extends Component {

  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveKeyword = this.archiveKeyword.bind(this);
    this.editKeyword = this.editKeyword.bind(this);
  }


  componentDidMount() {
    const {
      history,
      location: {
        search,
        pathname
      },
      match: {
        params: {
          organisationId
        }
      },
      fetchKeywordLists
    } = this.props;

    if (!isSearchValid(search, KEYWORDS_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, KEYWORDS_SEARCH_SETTINGS)
      });
    } else {
      const filter = parseSearch(search, KEYWORDS_SEARCH_SETTINGS);
      fetchKeywordLists(organisationId, filter);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search
      },
      match: {
        params: {
          organisationId
        }
      },
      history,
      fetchKeywordLists
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch
      },
      match: {
        params: {
          organisationId: nextOrganisationId
        }
      }
    } = nextProps;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, KEYWORDS_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, KEYWORDS_SEARCH_SETTINGS)
        });
      } else {
        const filter = parseSearch(nextSearch, KEYWORDS_SEARCH_SETTINGS);
        fetchKeywordLists(nextOrganisationId, filter);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetKeywordListsTable();
  }

  updateLocationSearch(params) {
    const {
      history,
      location: {
        search: currentSearch,
        pathname
      }
    } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, KEYWORDS_SEARCH_SETTINGS)
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      isFetchingKeywordLists,
      dataSource,
      totalPlacements
    } = this.props;

    const filter = parseSearch(search, KEYWORDS_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${organisationId}/library/keywordslists/${record.id}`}>{text}</Link>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editKeyword
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveKeyword
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingKeywordLists}
      onChange={() => {}}
      pagination={pagination}
    />);

  }

  editKeyword(keyword) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history
    } = this.props;

    history.push(`/${organisationId}/library/keywordslists/${keyword.id}`);
  }

  archiveKeyword(keyword) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      archiveKeywordList,
      fetchKeywordLists,
      translations
    } = this.props;

    const filter = parseSearch(search, KEYWORDS_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveKeywordList(keyword.id).then(() => {
          fetchKeywordLists(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

}

KeywordListsTable.defaultProps = {
  archiveKeywordList: () => { }
};

KeywordListsTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  isFetchingKeywordLists: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,

  fetchKeywordLists: PropTypes.func.isRequired,
  archiveKeywordList: PropTypes.func.isRequired,
  resetKeywordListsTable: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,

  isFetchingKeywordLists: state.placementListTable.placementListsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.placementListTable.placementListsApi.total,
});

const mapDispatchToProps = {
  fetchKeywordLists: KeywordListsActions.fetchKeywordLists.request,
  // archiveKeywordList: CampaignEmailAction.archiveKeywordList,
  resetKeywordListsTable: KeywordListsActions.resetKeywordListsTable
};

KeywordListsTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(KeywordListsTable);

KeywordListsTable = withRouter(KeywordListsTable);

export default KeywordListsTable;
