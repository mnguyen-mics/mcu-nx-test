import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Link from 'react-router/lib/Link';
import { Row, Col, Table, Icon, Input, DatePicker, Dropdown, Menu, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';

import * as CampaignsTableViewActions from './redux/CampaignsTableViewActions';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const confirm = Modal.confirm;

const dateFormat = 'DD/MM/YYYY';
const twentyDaysAgo = moment(moment().subtract(20, 'days').calendar()).format(dateFormat);
const now = moment(new Date()).format(dateFormat);


class CampaignTableView extends Component {

  constructor(props) {
    super(props);
    this.fetchCampaignsWithProps = this.fetchCampaignsWithProps.bind(this);
    this.fetchCampaignsPerformanceWithProps = this.fetchCampaignsPerformanceWithProps.bind(this);
    this.onDateRangeChange = this.onDateRangeChange.bind(this);
    this.archiveCampaign = this.archiveCampaign.bind(this);
    this.state = {
      inputVisible: false,
      startDate: twentyDaysAgo,
      endDate: now,
      inputValue: '',
      modalVisible: false,
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

    this.fetchCampaignsWithProps(params);
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
      this.fetchCampaignsWithProps(params);
    }

  }

  render() {
    const {
      campaigns,
      campaignsPerformance,
      isSearchEnabled,
      isDateRangePickerEnabled,
      isFetching,
      isFetchingCampaignsPerformance,
      hasSearched,
      filteredCampaigns,
    } = this.props;

    campaigns.sort((a, b) => {
      if (a.name.toUpperCase() < b.name.toUpperCase()) {
        return -1;
      }
      if (a.name.toUpperCase() > b.name.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    campaigns.sort((a, b) => {
      if (a.status.toUpperCase() < b.status.toUpperCase()) {
        return -1;
      }
      if (a.status.toUpperCase() > b.status.toUpperCase()) {
        return 1;
      }
      return 0;
    });

    this.formatCampaigns(campaigns, campaignsPerformance.report_view);

    return (
      <Row className="mcs-table-container">
        <Row className="mcs-table-header">
          {isSearchEnabled && (<Col span={12}>
            <Search
              placeholder="Search Display Campaigns"
              className="mcs-search-input"
              onSearch={(value) => { return this.searchThroughTable(value); }}
            />
          </Col>)}
          {isDateRangePickerEnabled && (<Col span={12} className="text-right" >
            <RangePicker
              defaultValue={[moment(twentyDaysAgo, dateFormat), moment(now, dateFormat)]}
              format={dateFormat}
              onChange={this.onDateRangeChange}
              disabled={isFetchingCampaignsPerformance}
            />
          </Col>)}
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            <Table columns={this.renderCol()} dataSource={hasSearched ? filteredCampaigns : campaigns} onChange={this.handleChange} loading={isFetching} pagination={{ size: 'small', showSizeChanger: true }} />
          </Col>
        </Row>
      </Row>
    );
  }

  renderCol() {
    const {
      activeWorkspace: {
        workspaceId
      },
      isFetchingCampaignsPerformance,
      translations
    } = this.props;

    const renderText = (text, number = false) => {
      if (!text || isFetchingCampaignsPerformance) {
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

    return (
      <Menu onClick={(item) => { if (item.key === '1') { this.archiveCampaign(record.id); } }}>
        <Menu.Item key="0">
          <Link to={editUrl}>Edit</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <a>Archive</a>
        </Menu.Item>
      </Menu>
    );
  }

  archiveCampaign(id) {
    const {
      deleteCampaigns,
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
        return deleteCampaigns(id).then(() => { it.fetchCampaignsWithProps(); });
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

  searchThroughTable(value) {
    const {
      searchCampaigns
    } = this.props;

    searchCampaigns(value);
  }

  formatCampaigns(campaigns, campaignsPerformance) {
    const newArray = [];
    campaignsPerformance.rows.map((row) => {
      const newObject = {};
      let i = 0;
      campaignsPerformance.columns_headers.forEach((value) => {
        if (row[i]) {
          newObject[value] = row[i];
        } else {
          newObject[value] = '-';
        }
        i += 1;
      });
      return newArray.push(newObject);
    });

    campaigns.map((campaign) => {
      const objectToAdd = newArray.find((element) => {
        return element.campaign_id === campaign.id;
      });
      const objetTemp = Object.assign(campaign, objectToAdd);
      campaignsPerformance.columns_headers.forEach((value) => {
        if (!campaign[value]) {
          objetTemp[value] = '-';
        }
      });
      objetTemp.key = campaign.id;
      return objetTemp;
    });
  }

  fetchCampaignsWithProps(props) {
    const {
      fetchCampaigns,
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

    fetchCampaigns(params).then(updateUrl).then(this.fetchCampaignsPerformanceWithProps());

  }

  fetchCampaignsPerformanceWithProps(props) {

    const {
      fetchCampaignsPerformance,
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
    return fetchCampaignsPerformance(params);

  }

}

CampaignTableView.propTypes = {
  isSearchEnabled: PropTypes.bool,
  isDateRangePickerEnabled: PropTypes.bool,
  isFetching: PropTypes.bool.isRequired,
  campaigns: PropTypes.arrayOf(PropTypes.object).isRequired,
  fetchCampaigns: PropTypes.func.isRequired,
  searchCampaigns: PropTypes.func.isRequired,
  fetchCampaignsPerformance: PropTypes.func.isRequired,
  isFetchingCampaignsPerformance: PropTypes.bool.isRequired,
  campaignsPerformance: PropTypes.shape({ report_view: PropTypes.shape({ items_per_page: PropTypes.number, total_items: PropTypes.number, columns_headers: PropTypes.array, rows: PropTypes.array }) }).isRequired,
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  archived: PropTypes.bool.isRequired, // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  hasSearched: PropTypes.bool.isRequired,
  filteredCampaigns: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteCampaigns: PropTypes.func.isRequired,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
};

CampaignTableView.defaultProps = {
  isSearchEnabled: false,
  isDateRangePickerEnabled: false
};

const mapStateToProps = state => ({
  campaigns: state.campaignsState.campaigns,
  campaignsPerformance: state.campaignsState.campaignsPerformance,
  filteredCampaign: state.campaignsState.filteredCampaign,
  isFetching: state.campaignsState.isFetching,
  isFetchingCampaignsPerformance: state.campaignsState.isFetchingCampaignsPerformance,
  activeWorkspace: state.sessionState.activeWorkspace,
  hasSearched: state.campaignsState.hasSearched,
  filteredCampaigns: state.campaignsState.filteredCampaigns,
  translations: state.translationsState.translations,
});

const mapDispatchToProps = {
  fetchCampaigns: CampaignsTableViewActions.fetchCampaigns,
  fetchCampaignsPerformance: CampaignsTableViewActions.fetchCampaignsPerformance,
  searchCampaigns: CampaignsTableViewActions.searchCampaigns,
  deleteCampaigns: CampaignsTableViewActions.deleteCampaigns,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignTableView);

/*
¨*<CampaignsTableView isSearchEnabled isDateRangePickerEnabled filters={[]} />
*/
