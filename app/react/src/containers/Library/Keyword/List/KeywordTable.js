import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { EmptyTableView } from '../../../../components/TableView/index.ts';
import LibraryTable from '../../LibraryTable';
import * as KeywordListsActions from '../../../../state/Library/KeywordLists/actions';
import { parseSearch, PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state//Library/KeywordLists/selectors';

class KeywordListsTable extends Component {

  archiveKeyword = (keyword) => {
    const {
      archiveKeywordList,
      fetchKeywordLists,
      location: { search },
      match: { params: { organisationId } },
      translations,
    } = this.props;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.KEYWORD_MODAL_CONFIRM_ARCHIVED_BODY,
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk: () => (
        archiveKeywordList(keyword.id)
          .then(() => fetchKeywordLists(organisationId, filter))
      ),
      onCancel: () => {},
    });
  }

  editKeyword = (keyword) => {
    const {
      history,
      match: { params: { organisationId } },
    } = this.props;

    history.push(`/${organisationId}/library/keywordslists/${keyword.id}`);
  }

  getTableProps = () => {
    const {
      dataSource,
      match: { params: { organisationId } },
    } = this.props;

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'EDIT', callback: this.editKeyword },
            { translationKey: 'ARCHIVE', callback: this.archiveKeyword },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'NAME',
          key: 'name',
          isHideable: false,
          render: (text, record) => (
            <Link
              className="mcs-campaigns-link"
              to={`/${organisationId}/library/keywordslists/${record.id}`}
            >{text}
            </Link>
          )
        },
      ],
    };

    return { columnsDefinitions, dataSource };
  }

  render() {
    const {
      fetchKeywordLists,
      hasKeywordLists,
      isFetchingKeywordLists,
      resetKeywordLists,
      totalKeywords
    } = this.props;

    const actions = {
      fetchElements: fetchKeywordLists,
      resetElements: resetKeywordLists,
    };

    const libraryProps = {
      loading: isFetchingKeywordLists,
      total: totalKeywords,
    };

    const tableProps = this.getTableProps();

    return (!hasKeywordLists
      ? <EmptyTableView iconType="library" text="EMPTY_LIBRARY_KEYWORD" />
      : (
        <LibraryTable
          actions={actions}
          libraryProps={libraryProps}
          tableProps={tableProps}
        />
      )
    );
  }
}

KeywordListsTable.defaultProps = {
  archiveKeywordList: () => Promise.resolve(),
};

KeywordListsTable.propTypes = {
  archiveKeywordList: PropTypes.func.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchKeywordLists: PropTypes.func.isRequired,
  hasKeywordLists: PropTypes.bool.isRequired,
  history: PropTypes.shape().isRequired,
  isFetchingKeywordLists: PropTypes.bool.isRequired,
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  resetKeywordLists: PropTypes.func.isRequired,
  totalKeywords: PropTypes.number.isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  dataSource: getTableDataSource(state),
  hasKeywordLists: state.keywordListTable.keywordListsApi.hasItems,
  isFetchingKeywordLists: state.keywordListTable.keywordListsApi.isFetching,
  totalKeywords: state.keywordListTable.keywordListsApi.total,
  translations: state.translations,
});

const mapDispatchToProps = {
  // archiveKeywordList: EmailCampaignAction.archiveKeywordList,
  fetchKeywordLists: KeywordListsActions.fetchKeywordLists.request,
  resetKeywordLists: KeywordListsActions.resetKeywordLists,
};

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps),
)(KeywordListsTable);
