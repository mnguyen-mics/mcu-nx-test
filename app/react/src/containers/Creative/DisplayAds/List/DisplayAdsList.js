import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import lodash from 'lodash';
import Link from 'react-router/lib/Link';
import { Modal } from 'antd';

import { TableView } from '../../../../components/TableView';

import * as CreativeDisplayActions from '../../../../state/Creatives/Display/actions';

import {
  CREATIVE_DISPLAY_LIST_SETTINGS,

  updateQueryWithParams,
  deserializeQuery
} from '../../RouteQuerySelector';

import {
  getTableDataSource
 } from '../../../../state/Creatives/Display/selectors';

class CreativeDisplayTable extends Component {

  constructor(props) {
    super(props);
    this.updateQueryParams = this.updateQueryParams.bind(this);
    this.archiveCreativeDisplay = this.archiveCreativeDisplay.bind(this);
    this.editCreativeDisplay = this.editCreativeDisplay.bind(this);
  }

  componentDidMount() {
    const {
      activeWorkspace: {
        organisationId
      },
      query,

      fetchCreativeDisplay
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_DISPLAY_LIST_SETTINGS);
    filter.type = 'DISPLAY_AD';
    fetchCreativeDisplay(organisationId, filter);
  }

  componentWillReceiveProps(nextProps) {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },

      fetchCreativeDisplay
    } = this.props;

    const {
      query: nextQuery,
      activeWorkspace: {
        workspaceId: nextWorkspaceId,
        organisationId
      },
    } = nextProps;

    if (!lodash.isEqual(query, nextQuery) || workspaceId !== nextWorkspaceId) {
      const filter = deserializeQuery(nextQuery, CREATIVE_DISPLAY_LIST_SETTINGS);
      filter.type = 'DISPLAY_AD';
      fetchCreativeDisplay(organisationId, filter);
    }
  }

  componentWillUnmount() {
    this.props.resetCreativeDisplayTable();
  }

  updateQueryParams(params) {
    const {
      router,
      query: currentQuery
    } = this.props;

    const location = router.getCurrentLocation();
    router.replace({
      pathname: location.pathname,
      query: updateQueryWithParams(currentQuery, params, CREATIVE_DISPLAY_LIST_SETTINGS)
    });
  }

  render() {
    const {
      query,
      activeWorkspace: {
        workspaceId
      },
      isFetchingCreativeDisplay,
      dataSource,
      totalCreativeDisplay
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_DISPLAY_LIST_SETTINGS);

    const pagination = {
      currentPage: filter.currentPage,
      pageSize: filter.pageSize,
      total: totalCreativeDisplay,
      onChange: (page) => this.updateQueryParams({
        currentPage: page
      }),
      onShowSizeChange: (current, size) => this.updateQueryParams({
        pageSize: size
      })
    };


    const dataColumns = [
      {
        translationKey: 'PREVIEW',
        key: 'asset_path',
        isHiddable: false,
        className: 'mcs-table-image-col',
        render: (text, record) => <div className="mics-small-thumbnail"><a target="_blank" rel="noreferrer noopener" href={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} ><span className="thumbnail-helper" /><img src={`https://ads.mediarithmics.com/ads/screenshot?rid=${record.id}`} alt={record.name} /></a></div>
      },
      {
        translationKey: 'NAME',
        key: 'name',
        isHiddable: false,
        render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/creatives/display-ad/default-editor/edit/${record.id}`}>{text}</Link>
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

    return (<TableView
      columnsDefinitions={columnsDefinitions}
      dataSource={dataSource}
      loading={isFetchingCreativeDisplay}
      onChange={() => {}}
      pagination={pagination}
    />);

  }

  editCreativeDisplay(campaign) {
    const {
      activeWorkspace: {
        workspaceId
      },
      router
    } = this.props;

    router.push(`/${workspaceId}/creatives/display-ad/default-editor/edit/${campaign.id}`);
  }

  archiveCreativeDisplay(campaign) {
    const {
      activeWorkspace: {
        organisationId
      },
      archiveCreativeDisplay,
      fetchCreativeDisplay,
      translations,
      query
    } = this.props;

    const filter = deserializeQuery(query, CREATIVE_DISPLAY_LIST_SETTINGS);

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
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  isFetchingCreativeDisplay: PropTypes.bool.isRequired,
  dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalCreativeDisplay: PropTypes.number.isRequired,

  fetchCreativeDisplay: PropTypes.func.isRequired,
  archiveCreativeDisplay: PropTypes.func.isRequired,
  resetCreativeDisplayTable: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations,

  isFetchingCreativeDisplay: state.creativeDisplayTable.creativeDisplayApi.isFetching,
  dataSource: getTableDataSource(state),
  totalCreativeDisplay: state.creativeDisplayTable.creativeDisplayApi.total,
});

const mapDispatchToProps = {
  fetchCreativeDisplay: CreativeDisplayActions.fetchCreativeDisplay.request,
  // archiveCreativeDisplay: CreativeDisplayActions.archiveCreativeDisplay,
  resetCreativeDisplayTable: CreativeDisplayActions.resetCreativeDisplayTable
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreativeDisplayTable);
