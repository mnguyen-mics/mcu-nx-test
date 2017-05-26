import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import { TableView } from '../../../../components/TableView';

import * as KeywordListsActions from '../../../../state/Library/KeywordLists/actions';

import {
  KEYWORD_LISTS_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../../state//Library/KeywordLists/selectors';

class KeywordListsTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveKeyword = this.archiveKeyword.bind(this);
    this.editKeyword = this.editKeyword.bind(this);
  }


  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,

      fetchKeywordLists
    } = this.props;
    const filter = deserializeQuery(query, KEYWORD_LISTS_SETTINGS);
    fetchKeywordLists(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchKeywordLists
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, KEYWORD_LISTS_SETTINGS);
      fetchKeywordLists(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetKeywordListsTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, KEYWORD_LISTS_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      isFetchingKeywordLists,
      dataSource,
      totalPlacements
    } = this.props;

    const filter = deserializeQuery(query, KEYWORD_LISTS_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalPlacements,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/library/keywordslists/${record.id}`}>{text}</Link>
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
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/library/keywordslists/${keyword.id}`);
  }

  archiveKeyword(keyword) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveKeywordList,
      fetchKeywordLists,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, KEYWORD_LISTS_SETTINGS);

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
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingKeywordLists: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalPlacements: PropTypes.number.isRequired,

  fetchKeywordLists: PropTypes.func.isRequired,
  archiveKeywordList: PropTypes.func.isRequired,
  resetKeywordListsTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingKeywordLists: state.placementListTable.placementListsApi.isFetching,
  dataSource: getTableDataSource(state),
  totalPlacements: state.placementListTable.placementListsApi.total,
});

const mapDispatchToProps = {
  fetchKeywordLists: KeywordListsActions.fetchKeywordLists.request,
  // archiveKeywordList: CampaignEmailAction.archiveKeywordList,
  resetKeywordListsTable: KeywordListsActions.resetKeywordListsTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeywordListsTable);
