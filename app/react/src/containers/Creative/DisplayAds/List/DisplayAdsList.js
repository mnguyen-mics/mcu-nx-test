import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { Modal } from 'antd';

import { TableViewFilters, TableView, EmptyTableView } from '../../../../components/TableView';

import * as CreativeDisplayActions from '../../../../state/Creatives/Display/actions';

import { CREATIVE_DISPLAY_SEARCH_SETTINGS } from './constants';
import {
  updateSearch,
  parseSearch,
  isSearchValid,
  buildDefaultSearch,
  compareSearchs
} from '../../../../utils/LocationSearchHelper';

import { getTableDataSource } from '../../../../state/Creatives/Display/selectors';

class CreativeDisplayTable extends Component {

  constructor(props) {
    super(props);
    this.updateLocationSearch = this.updateLocationSearch.bind(this);
    this.archiveCreativeDisplay = this.archiveCreativeDisplay.bind(this);
    this.editCreativeDisplay = this.editCreativeDisplay.bind(this);
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
      fetchCreativeDisplay
    } = this.props;

    if (!isSearchValid(search, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
      history.replace({
        pathname: pathname,
        search: buildDefaultSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS),
        state: { reloadDataSource: true }
      });
    } else {
      const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);
      fetchCreativeDisplay(organisationId, filter, true);
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
      fetchCreativeDisplay
    } = this.props;

    const {
      location: {
        pathname: nextPathname,
        search: nextSearch,
        state
      },
      match: {
        params: {
          organisationId: nextOrganisationId
        }
      },
    } = nextProps;

    const checkEmptyDataSource = state && state.reloadDataSource;

    if (!compareSearchs(search, nextSearch) || organisationId !== nextOrganisationId) {
      if (!isSearchValid(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS)) {
        history.replace({
          pathname: nextPathname,
          search: buildDefaultSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS),
          state: { reloadDataSource: organisationId !== nextOrganisationId }
        });
      } else {
        const filter = parseSearch(nextSearch, CREATIVE_DISPLAY_SEARCH_SETTINGS);
        fetchCreativeDisplay(nextOrganisationId, filter, checkEmptyDataSource);
      }
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeDisplayTable();
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
      search: updateSearch(currentSearch, params, CREATIVE_DISPLAY_SEARCH_SETTINGS)
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
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay,
      hasCreativeDisplay
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeDisplay,
      onChange: (page) => this.updateLocationSearch({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateLocationSearch({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHiddable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => <div className="mcs-table-cell-thumbnail"><a target="_blank" rel="noreferrer noopener" href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} ><span className="thumbnail-helper" /><img src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} /></a></div>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${organisationId}/creatives/display-ad/default-editor/edit/${record.id}`}>{text}</Link>
      },
      {
        translationKey: 'AUDIT_STATUS',
        key: 'audit_status',
        isHiddable: false,
        render: (text) => <span>{text}</span>
      },
      {
        translationKey: 'PUBLISHED_VERSION',
        key: 'published_version',
        isHiddable: false,
        render: (text) => <span>{text}</span>
      }
    ];

    const actionColumns = [
      {
        key: 'action',
        actions: [
          {
            translationKey: 'EDIT',
            callback: this.editCreativeDisplay
          }, {
            translationKey: 'ARCHIVE',
            callback: this.archiveCreativeDisplay
          }
        ]
      }
    ];

    const columnsDefinitions = {
      dataColumnsDefinition: dataColumns,
      actionsColumnsDefinition: actionColumns
    };

    return hasCreativeDisplay ? (
      <TableViewFilters
        columnsDefinitions={columnsDefinitions}
      >
        <TableView
          columnsDefinitions={columnsDefinitions}
          dataSource={dataSource}
          loading={isFetchingCreativeDisplay}
          pagination={pagination}
        />
      </TableViewFilters>) : (<EmptyTableView iconType="display" text="EMPTY_CREATIVES_DISPLAY" />);

  }

  editCreativeDisplay(campaign) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      history
    } = this.props;

    history.push(`/${organisationId}/creatives/display-ad/default-editor/edit/${campaign.id}`);
  }

  archiveCreativeDisplay(campaign) {
    const {
      match: {
        params: {
          organisationId
        }
      },
      location: {
        search
      },
      archiveCreativeDisplay,
      fetchCreativeDisplay,
      translations
    } = this.props;

    const filter = parseSearch(search, CREATIVE_DISPLAY_SEARCH_SETTINGS);

    Modal.confirm({
      title: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.CAMPAIGN_MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return archiveCreativeDisplay(campaign.id).then(() => {
          fetchCreativeDisplay(organisationId, filter);
        });
      },
      onCancel() { },
    });
  }

}

CreativeDisplayTable.defaultProps = {
  archiveCreativeDisplay: () => { }
};

CreativeDisplayTable.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,

  isFetchingCreativeDisplay: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCreativeDisplay: PropTypes.number.isRequired,
  hasCreativeDisplay: PropTypes.bool.isRequired,
  fetchCreativeDisplay: PropTypes.func.isRequired,
  archiveCreativeDisplay: PropTypes.func.isRequired,
  resetCreativeDisplayTable: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  hasCreativeDisplay: state.creativeDisplayTable.creativeDisplayApi.hasItems,
  isFetchingCreativeDisplay: state.creativeDisplayTable.creativeDisplayApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCreativeDisplay: state.creativeDisplayTable.creativeDisplayApi.total,
});

const mapDispatchToProps = {
  fetchCreativeDisplay: CreativeDisplayActions.fetchCreativeDisplay.request,
  // archiveCreativeDisplay: CreativeDisplayActions.archiveCreativeDisplay,
  resetCreativeDisplayTable: CreativeDisplayActions.resetCreativeDisplayTable
};

CreativeDisplayTable = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreativeDisplayTable);

CreativeDisplayTable = withRouter(CreativeDisplayTable);

export default CreativeDisplayTable;

