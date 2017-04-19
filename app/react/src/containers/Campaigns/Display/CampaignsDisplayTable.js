import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Link from 'react-router/lib/Link';
import { Icon, Dropdown, Menu, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import * as CampaignsDisplayActions from '../../../state/Campaigns/Display/actions';

import { TableView } from '../../../components/TableView';

const confirm = Modal.confirm;
const dateFormat = 'DD/MM/YYYY';

class CampaignsDisplayTable extends Component {

  constructor(props) {
    super(props);
    this.fetchCampaignsDisplayWithProps = this.fetchCampaignsDisplayWithProps.bind(this);
    this.fetchCampaignsPerformanceWithProps = this.fetchCampaignsPerformanceWithProps.bind(this);
    this.onDateRangeChange = this.onDateRangeChange.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.state = {
      startDate: moment(moment().subtract(20, 'days').calendar()).format(dateFormat),
      endDate: moment(new Date()).format(dateFormat)
    };
  }

  componentDidMount() {

    const {
      filters,
      archived,
      router: {
        location: {
          query
        }
      }
    } = this.props;

    const params = query;

    Object.keys(filters).forEach(filter => {
      if (filters[filter].data.length) {
        params[filter] = filters[filter].data.join();
      }
    });

    params.archived = archived;

    this.fetchCampaignsDisplayWithProps(params);
  }

  componentWillReceiveProps(nextProps) {

    const {
      filters,
      archived,
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const {
      filters: nextFilters,
      archived: nextArchived,
      activeWorkspace: {
        organisationId: nextOrganisationId
      }
    } = nextProps;

    const params = {};

    Object.keys(filters).forEach(filter => {
      if (filters[filter].data && nextFilters[filter] && nextFilters[filter].data) {
        if (filters[filter].data.length !== nextFilters[filter].data.length) {
          params[filter] = nextFilters[filter].data.join();
        }
      }
    });

    if (archived !== nextArchived) {
      params.archived = nextArchived;
    }

    if (organisationId !== nextOrganisationId) {
      params.organisation_id = nextOrganisationId;
    }

    if (Object.keys(params).length) {
      this.fetchCampaignsDisplayWithProps(params);
    }

  }

  render() {
    const {
      campaignsDisplay,
      campaignsDisplayPerformance,
      isFetchingCampaignsDisplay,
      isFetchingCampaignsDisplayPerformance,
      searchCampaignsDisplay,
      hasSearched,
      filteredCampaignsDisplay,
      translations
    } = this.props;

    const {
      startDate,
      endDate
    } = this.state;

    this.formatCampaigns(campaignsDisplay, campaignsDisplayPerformance.report_view);
    const columns = this.renderCol();

    const searchOptions = {
      isEnabled: true,
      placeholder: translations.SEARCH_CAMPAIGNS_DISPLAY,
      onSearch: searchCampaignsDisplay
    };

    const dateRangePickerOptions = {
      isEnabled: true,
      onChange: this.onDateRangeChange,
      isRangePickerDisabled: isFetchingCampaignsDisplayPerformance,
      startDate,
      endDate,
      dateFormat
    };

    return (<TableView
      columns={columns}
      dataSource={hasSearched ? filteredCampaignsDisplay : campaignsDisplay}
      loading={isFetchingCampaignsDisplay}
      searchOptions={searchOptions}
      onChange={() => {}}
      dateRangePickerOptions={dateRangePickerOptions}
    />);

  }

  renderCol() {
    const {
      activeWorkspace: {
        workspaceId
      },
      isFetchingCampaignsDisplayPerformance,
      translations
    } = this.props;

    const renderText = (text, number = false) => {
      if (!text || isFetchingCampaignsDisplayPerformance) {
        return (<span>loading...</span>);
      }
      if (text === '-') {
        return text;
      }
      return number ? (Math.round(text * 100) / 100) : text;
    };

    const columns = [{
      title: translations.STATUS,
      dataIndex: 'status',
      key: 'status',
      render: text => <span className={`mcs-campaigns-status-${text.toLowerCase()}`}><FormattedMessage id={text} /></span>
    }, {
      title: translations.NAME,
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link className="mcs-campaigns-link" to={`/${workspaceId}/campaigns/display/report/${record.id}/basic`}>{text}</Link>
    }, {
      title: translations.Impression,
      dataIndex: 'impressions',
      key: 'impression',
      render: text => renderText(text)
    }, {
      title: translations.Clicks,
      dataIndex: 'clicks',
      key: 'clicks',
      render: text => renderText(text, true)
    }, {
      title: translations.Spent,
      dataIndex: 'impressions_cost',
      key: 'spent',
      render: text => renderText(text, true)
    }, {
      title: translations.CPM,
      dataIndex: 'cpm',
      key: 'cpm',
      render: text => renderText(text, true)
    }, {
      title: translations.CTR,
      dataIndex: 'ctr',
      key: 'ctr',
      render: text => renderText(text, true)
    }, {
      title: translations.CPC,
      dataIndex: 'cpc',
      key: 'cpc',
      render: text => renderText(text, true)
    }, {
      title: translations.CPA,
      dataIndex: 'cpa',
      key: 'cpa',
      render: text => renderText(text, true)
    }, {
      key: 'action',
      render: (text, record) => (
        <Dropdown overlay={this.renderColMenu(workspaceId, record)} trigger={['click']}>
          <a className="ant-dropdown-link">
            <Icon type="down" />
          </a>
        </Dropdown>
      ),
    }];

    return columns;
  }

  renderColMenu(workspace, record) {
    let editUrl;
    switch (record.editor_artifact_id) {
      case 'default-editor':
        editUrl = `/${workspace}/campaigns/display/expert/edit/${record.id}`;
        break;
      case 'external-campaign-editor':
        editUrl = `/${workspace}/campaigns/display/external/edit/${record.id}`;
        break;
      case 'keywords-targeting-editor':
        editUrl = `/${workspace}/campaigns/display/keywords/${record.id}`;
        break;
      default:
        break;
    }

    const onClick = item => {
      if (item.key === '1') {
        this.archiveCampaign(record.id);
      }
    };

    return (
      <Menu onClick={onClick}>
        <Menu.Item key="0">
          <Link to={editUrl}>
            <FormattedMessage id="EDIT" />
          </Link>
        </Menu.Item>
        <Menu.Item key="1">
          <a>
            <FormattedMessage id="ARCHIVE" />
          </a>
        </Menu.Item>
      </Menu>
    );
  }

  archiveCampaign(id) {
    const {
      deleteCampaignsDisplay,
      translations
    } = this.props;

    const it = this;
    confirm({
      title: translations.MODAL_CONFIRM_ARCHIVED_TITLE,
      content: translations.MODAL_CONFIRM_ARCHIVED_BODY,
      iconType: 'exclamation-circle',
      okText: translations.MODAL_CONFIRM_ARCHIVED_OK,
      cancelText: translations.MODAL_CONFIRM_ARCHIVED_CANCEL,
      onOk() {
        return deleteCampaignsDisplay(id).then(() => { it.fetchCampaignsDisplayWithProps(); });
      },
      onCancel() {},
    });
  }

  onDateRangeChange(date) {
    this.setState({
      startDate: date[0],
      endDate: date[1],
    });
    this.fetchCampaignsPerformanceWithProps();
  }

  formatCampaigns(campaignsDisplay, campaignsDisplayPerformance) {
    const newArray = [];
    campaignsDisplayPerformance.rows.map((row) => {
      const newObject = {};
      let i = 0;
      campaignsDisplayPerformance.columns_headers.forEach((value) => {
        if (row[i]) {
          newObject[value] = row[i];
        } else {
          newObject[value] = '-';
        }
        i += 1;
      });
      return newArray.push(newObject);
    });

    campaignsDisplay.map((campaign) => {
      const objectToAdd = newArray.find((element) => {
        return element.campaign_id === campaign.id;
      });
      const objetTemp = Object.assign(campaign, objectToAdd);
      campaignsDisplayPerformance.columns_headers.forEach((value) => {
        if (!campaign[value]) {
          objetTemp[value] = '-';
        }
      });
      objetTemp.key = campaign.id;
      return objetTemp;
    });
  }

  fetchCampaignsDisplayWithProps(props) {
    const {
      fetchCampaignsDisplay,
      activeWorkspace: {
        organisationId
      },
      router
    } = this.props;
    const first_result = 0; // eslint-disable-line camelcase
    const max_results = 300; // eslint-disable-line camelcase
    const campaign_type = 'DISPLAY'; // eslint-disable-line camelcase
    const organisation_id = organisationId; // eslint-disable-line camelcase

    const params = {
      first_result,
      max_results,
      campaign_type,
      organisation_id
    };

    if (props) {
      Object.keys(props).forEach(key => {
        params[key] = props[key];
      });
    }

    const updateUrl = () => {
      const location = router.getCurrentLocation();
      const query = Object.assign({}, location.query, params);
      router.replace({
        pathname: location.pathname,
        query
      });
    };

    fetchCampaignsDisplay(params).then(updateUrl).then(this.fetchCampaignsPerformanceWithProps());

  }

  fetchCampaignsPerformanceWithProps(props) {

    const {
      fetchCampaignsDisplayPerformance,
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const {
      startDate,
      endDate
    } = this.state;

    const startD = moment(startDate, dateFormat).format('YYYY-MM-DD');
    const endD = moment(endDate, dateFormat).format('YYYY-MM-DD');

    const dimension = ''; // eslint-disable-line camelcase
    const end_date = endD; // eslint-disable-line camelcase
    const filters = `organisation%3D%3D${organisationId}`; // eslint-disable-line camelcase
    const metrics = ['impressions', 'clicks', 'cpm', 'ctr', 'cpc', 'impressions_cost', 'cpa']; // eslint-disable-line camelcase
    const organisation_id = organisationId; // eslint-disable-line camelcase
    const start_date = startD; // eslint-disable-line camelcase

    const params = {
      dimension,
      end_date,
      filters,
      metrics,
      organisation_id,
      start_date
    };

    if (props) {
      Object.keys(props).forEach(key => {
        params[key] = props[key];
      });
    }
    return fetchCampaignsDisplayPerformance(params);

  }

}

CampaignsDisplayTable.propTypes = {
  isFetchingCampaignsDisplay: PropTypes.bool.isRequired,
  campaignsDisplay: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchCampaignsDisplay: PropTypes.func.isRequired,
  searchCampaignsDisplay: PropTypes.func.isRequired,
  fetchCampaignsDisplayPerformance: PropTypes.func.isRequired,
  isFetchingCampaignsDisplayPerformance: PropTypes.bool.isRequired,
  campaignsDisplayPerformance: PropTypes.shape({ report_view: PropTypes.shape({ items_per_page: PropTypes.number, total_items: PropTypes.number, columns_headers: PropTypes.array, rows: PropTypes.array }) }).isRequired,
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  archived: PropTypes.bool.isRequired, // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasSearched: PropTypes.bool.isRequired,
  filteredCampaignsDisplay: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteCampaignsDisplay: PropTypes.func.isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

const mapStateToProps = state => ({
  campaignsDisplay: state.campaignsDisplayState.campaignsDisplay,
  campaignsDisplayPerformance: state.campaignsDisplayState.campaignsDisplayPerformance,
  filteredCampaign: state.campaignsDisplayState.filteredCampaign,
  isFetchingCampaignsDisplay: state.campaignsDisplayState.isFetchingCampaignsDisplay,
  isFetchingCampaignsDisplayPerformance: state.campaignsDisplayState.isFetchingCampaignsDisplayPerformance,
  activeWorkspace: state.sessionState.activeWorkspace,
  hasSearched: state.campaignsDisplayState.hasSearched,
  filteredCampaignsDisplay: state.campaignsDisplayState.filteredCampaignsDisplay,
  translations: state.translationsState.translations
});

const mapDispatchToProps = {
  fetchCampaignsDisplay: CampaignsDisplayActions.fetchCampaignsDisplay,
  fetchCampaignsDisplayPerformance: CampaignsDisplayActions.fetchCampaignsDisplayPerformance,
  searchCampaignsDisplay: CampaignsDisplayActions.searchCampaignsDisplay,
  deleteCampaignsDisplay: CampaignsDisplayActions.deleteCampaignsDisplay,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplayTable);
