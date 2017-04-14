import React, { Component, PropTypes } from 'react';
import { Menu, Dropdown, Button, Icon, Checkbox, Layout } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { ScrollComponent } from '../../components/ScrollComponent';
import { Actionbar, ActionbarButton, SecondaryActionbar } from '../Actionbar';
import { LabelListView } from '../../components/LabelListView';
import CampaignsTableView from './CampaignsTableView';

import { ActionbarActions } from '../Actionbar/redux';

const { Content } = Layout;

class CampaignsDisplay extends Component {

  constructor(props) {
    super(props);
    this.buildFilterItems = this.buildFilterItems.bind(this);
    this.state = {
      archived: false,
      filters: {
        status: {
          visible: false,
          data: []
        },
        label: {
          visible: false,
          data: []
        },
        manager: {
          visible: false,
          data: []
        }
      }
    };
    this.initStateWithQuery = this.initStateWithQuery.bind(this);
  }

  componentWillMount() {

    const {
      translations,
      setBreadcrumb,
      router: {
        location: {
          query
        }
      }
    } = this.props;

    const breadcrumb = {
      name: translations.DISPLAY_CAMPAIGNS
    };

    setBreadcrumb(0, [breadcrumb]);
    this.initStateWithQuery(query);

  }

  initStateWithQuery(query) {

    const {
      filters,
      archived
    } = this.state;

    const buildFilters = () => {

      const builtFilters = {};

      const splitStr = str => str.split(',');

      Object.keys(filters).forEach(filter => {
        builtFilters[filter] = {
          visible: filters[filter].visible,
          data: query[filter] ? splitStr(query[filter]) : filters[filter].data
        };
      });

      return builtFilters;
    };

    this.setState({
      archived: query.archived ? (query.archived === 'true') : archived,
      filters: buildFilters()
    });

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const {
      filters,
      archived
    } = this.state;

    const addMenu = (
      <Menu>
        <Menu.Item key="DESKTOP_AND_MOBILE">
          <Link to={`${organisationId}/campaigns/display/expert/edit/T1`}>
            <FormattedMessage id="DESKTOP_AND_MOBILE" />
          </Link>
        </Menu.Item>
        <Menu.Item key="SIMPLIFIED_KEYWORDS_TARGETING">
          <Link to={`${organisationId}/campaigns/display/keywords`}>
            <FormattedMessage id="SIMPLIFIED_KEYWORDS_TARGETING" />
          </Link>
        </Menu.Item>
        <Menu.Item key="EXTERNAL_CAMPAIGN">
          <Link to={`${organisationId}/campaigns/display/external/edit/T1`}>
            <FormattedMessage id="EXTERNAL_CAMPAIGN" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const setVisibility = (type, visible) => {

      const {
        ...state
      } = this.state.filters[type];

      const {
        [type]: currentFilter,
        ...otherFilters
      } = this.state.filters;

      this.setState({
        filters: {
          ...otherFilters,
          [type]: {
            ...state,
            visible
          }
        }
      });
    };

    const handleChange = (type, value, withVisibility) => {

      const {
        key
      } = value;

      const {
        data,
        ...state
      } = this.state.filters[type];

      const {
        [type]: currentFilter,
        ...otherFilters
      } = this.state.filters;

      let newArray = [];
      const index = data.indexOf(key);

      if (index !== -1) {
        newArray = [
          ...data.slice(0, index),
          ...data.slice(index + 1)
        ];
      } else {
        newArray = [
          ...data,
          key
        ];
      }

      if (withVisibility) {
        setVisibility(type, true);
      }

      this.setState({
        filters: {
          ...otherFilters,
          [type]: {
            ...state,
            data: newArray
          }
        }
      });
    };

    const handleVisibleChange = (type, visible) => {
      setVisibility(type, visible);
    };

    const items = this.buildFilterItems();

    const onClickOnClose = value => {
      Object.keys(filters).forEach(filter => {
        handleChange(filter, value, false);
      });
    };

    const statusMenu = (
      <Menu onClick={value => handleChange('status', value, true)}>
        <Menu.Item key="ACTIVE">
          <FormattedMessage id="ACTIVE" />
        </Menu.Item>
        <Menu.Item key="PENDING">
          <FormattedMessage id="PENDING" />
        </Menu.Item>
        <Menu.Item key="PAUSED">
          <FormattedMessage id="PAUSED" />
        </Menu.Item>
      </Menu>
    );

    const onArchivedCheckboxChange = event => {
      this.setState({
        archived: event.target.checked
      });
    };

    const labelListView = items.length ? <LabelListView className="mcs-campaigns-filter-view" items={items} label="FILTERED_BY" onClickOnClose={onClickOnClose} /> : null;

    return (
      <Layout>
        <Actionbar {...this.props}>
          <Dropdown overlay={addMenu} trigger={['click']}>
            <ActionbarButton className="mcs-actionbar-button-add mcs-actionbar-button">
              <Icon type="plus" />
            </ActionbarButton>
          </Dropdown>

          <ActionbarButton secondaryBar="filterActionBar">
            <Icon type="filter" />
          </ActionbarButton>

          <SecondaryActionbar secondary id="filterActionBar">
            <div className="mcs-actionbar-button-wrapper">
              <Dropdown overlay={statusMenu} trigger={['click']} onVisibleChange={visible => handleVisibleChange('status', visible)} visible={filters.status.visible}>
                <Button>
                  <FormattedMessage id="STATUS" />
                  <Icon type="down" />
                </Button>
              </Dropdown>
            </div>

            <div className="mcs-actionbar-button-wrapper">
              <Checkbox className="mcs-campaigns-checkbox" checked={archived} onChange={onArchivedCheckboxChange}>
                <FormattedMessage id="ARCHIVED" />
              </Checkbox>
            </div>
          </SecondaryActionbar>

        </Actionbar>

        <Content>
          <ScrollComponent>
            { labelListView }
            <CampaignsTableView isSearchEnabled isDateRangePickerEnabled filters={filters} archived={archived} {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

  buildFilterItems() {
    const {
        filters
    } = this.state;

    const {
      translations
    } = this.props;

    const items = [];

    Object.keys(filters).forEach(filter => {
      return filters[filter].data.forEach(value => {
        items.push({
          key: value,
          value: translations[value],
          isClosable: true
        });
      });
    });

    return items;

  }

}

CampaignsDisplay.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  setBreadcrumb: PropTypes.func.isRequired,
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations,
  activeWorkspace: state.sessionState.activeWorkspace
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

CampaignsDisplay = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplay);

export default CampaignsDisplay;
