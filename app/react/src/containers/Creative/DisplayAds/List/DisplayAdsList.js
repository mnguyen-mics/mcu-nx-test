import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { TableViewFilters, EmptyTableView } from '../../../../components/TableView/index.ts';
import * as CreativeDisplayActions from '../../../../state/Creatives/Display/actions';
import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import { updateSearch, parseSearch, isSearchValid, buildDefaultSearch, compareSearches } from '../../../../utils/LocationSearchHelper';
import { getDisplayCreatives, getDisplayCreativesTotal, hasDisplayCreatives, isFetchingDisplayCreatives } from '../../../../state/Creatives/Display/selectors';
import CreativeScreenshot from '../../CreativeScreenshot';
import messages from './message.ts';
import CreativeService from '../../../../services/CreativeService.ts';

class CreativeDisplayTable extends Component {
  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCreativeDisplay = this.archiveCreativeDisplay.bind(this);
    this.editCreativeDisplay = this.editCreativeDisplay.bind(this);
  }

  componentDidMount() {
    const { history, location: { search, pathname }, match: { params: { organisationId } }, fetchCreativeDisplay } = this.props;

    if (!isSearchValid(search, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true },
      });
    } else {
      const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
      fetchCreativeDisplay(organisationId, filter, true);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: {
        search,
      },
      match: {
        params: {
          organisationId,
        },
      },
      history,
      fetchCreativeDisplay,
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state,
      },
      match: {
        params: {
          organisationId: nextOrganisationId,
        },
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearches(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId },
        });
      } else {
        const filter = parseSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS);
        fetchCreativeDisplay(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeDisplay();
  }

  updateLocationSearch(params) {
    const { history, location: { search: currentSearch, pathname } } = this.props;

    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, CREATIVE_DISPLAY_SEARCH_SETTINGS),
    };

    history.push(nextLocation);
  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      location: {
        search,
      },
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      hasCreativeDisplay,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const pagination = {
      current: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeDisplay,
      onChange: page =>
        this.updateLocationSearch({
          currentPage: page,
        }),
      onShowSizeChange: (current, size) =>
        this.updateLocationSearch({
          pageSize: size,
          currentPage: 1,
        }),
    };

    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHideable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => (
          <CreativeScreenshot item={record} />
        ),
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHideable: false,
        render: (text, record) => (
          <Link className="mcs-campaigns-link" to={`/v2/o/${organisationId}/creatives/display/edit/${record.id}`}>{text}</Link>
        ),
      },
      {
        translationKey: 'AUDIT_STATUS',
        key: 'audit_status',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
      {
        translationKey: 'PUBLISHED_VERSION',
        key: 'published_version',
        isHideable: false,
        render: text => <span>{text}</span>,
      },
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCreativeDisplay,
          },
          {
            translationKey: 'ARCHIVE',
            callback: this.archiveCreativeDisplay,
          },
        ],
      },
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns,
    };

    return hasCreativeDisplay ? (
      <div className="mcs-table-container">
        <TableViewFilters
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSource}
          loading={isFetchingCreativeDisplay}
          pagination={pagination}
        />
      </div>) : (<EmptyTableView iconType="display" text="EMPTY_CREATIVES_DISPLAY" />);

  }

  editCreativeDisplay(creative) {
    const { match: { params: { organisationId } }, history } = this.props;

    history.push(`/v2/o/${organisationId}/creatives/display/edit/${creative.id}`);
  }

  archiveCreativeDisplay(creative) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search,
        pathname,
        state,
      },
      fetchCreativeDisplay,
      intl: { formatMessage },
      history,
      dataSource,
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    Modal.confirm({
      title: formatMessage(messages.creativeModalConfirmArchivedTitle),
      content: formatMessage(messages.creativeModalConfirmArchivedContent),
      iconType: 'exclamation-circle',
      okText: formatMessage(messages.creativeModalConfirmArchivedOk),
      cancelText: formatMessage(messages.cancelText),
      onOk() {
        CreativeService.updateDisplayCreative(creative.id, { ...creative, archived: true }).then(() => {
          if (dataSource.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            fetchCreativeDisplay(organisationId, filter, true);
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state
            });
            return Promise.resolve();
          }
          fetchCreativeDisplay(organisationId, filter, true);
          return Promise.resolve();
        });
      },
      onCancel() {},
    });
  }
}

CreativeDisplayTable.defaultProps = {
  archiveCreativeDisplay: () => {},
};

CreativeDisplayTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  intl: intlShape.isRequired,
  isFetchingCreativeDisplay: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCreativeDisplay: PropTypes.number.isRequired,
  hasCreativeDisplay: PropTypes.bool.isRequired,
  fetchCreativeDisplay: PropTypes.func.isRequired,
  archiveCreativeDisplay: PropTypes.func.isRequired,
  resetCreativeDisplay: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasCreativeDisplay: hasDisplayCreatives(state),
  isFetchingCreativeDisplay: isFetchingDisplayCreatives(state),
  dataSource: getDisplayCreatives(state),
  totalCreativeDisplay: getDisplayCreativesTotal(state),
});

const mapDispatchToProps = {
  fetchCreativeDisplay: CreativeDisplayActions.fetchCreativeDisplay.request,
  resetCreativeDisplay: CreativeDisplayActions.resetCreativeDisplay,
};

CreativeDisplayTable = connect(mapStateToProps, mapDispatchToProps)(CreativeDisplayTable);

CreativeDisplayTable = withRouter(CreativeDisplayTable);

export default injectIntl(CreativeDisplayTable);
