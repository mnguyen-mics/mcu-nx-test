import React, { Component, PropTypes } from 'react';
import { Layout } from 'antd';
import { connect } from 'react-redux';

import { ScrollComponent } from '../../../components/ScrollComponent';

import CampaignsDisplayActionbar from './CampaignsDisplayActionbar';
import CampaignsDisplayLabel from './CampaignsDisplayLabel';
import CampaignsDisplayTable from './CampaignsDisplayTable';

const { Content } = Layout;

class CampaignsDisplay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      archived: false,
      filters: {
        status: {
          visible: false,
          closable: true,
          data: []
        },
        label: {
          visible: false,
          closable: true,
          data: []
        },
        manager: {
          visible: false,
          closable: true,
          data: []
        }
      }
    };
    this.initStateWithQuery = this.initStateWithQuery.bind(this);
  }

  componentWillMount() {

    const {
      router: {
        location: {
          query
        }
      }
    } = this.props;

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
          closable: filters[filter].closable,
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
      filters,
      archived
    } = this.state;

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

    const onClickOnClose = value => {
      handleChange(value.type, value, false);
    };

    const onArchivedCheckboxChange = event => {
      this.setState({
        archived: event.target.checked
      });
    };

    return (
      <Layout>
        <CampaignsDisplayActionbar
          filters={filters}
          archived={archived}
          handleChange={handleChange}
          handleVisibleChange={handleVisibleChange}
          onArchivedCheckboxChange={onArchivedCheckboxChange}
        />
        <Content>
          <ScrollComponent>
            <CampaignsDisplayLabel filters={filters} onClickOnClose={onClickOnClose} />
            <CampaignsDisplayTable filters={filters} archived={archived} {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

CampaignsDisplay.propTypes = {
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

CampaignsDisplay = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplay);

export default CampaignsDisplay;
