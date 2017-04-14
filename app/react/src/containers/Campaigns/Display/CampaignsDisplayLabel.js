import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { LabelListView } from '../../../components/LabelListView';

class CampaignsDisplayLabel extends Component {

  constructor(props) {
    super(props);
    this.buildFilterItems = this.buildFilterItems.bind(this);
  }

  render() {

    const {
      onClickOnClose
    } = this.props;


    const items = this.buildFilterItems();

    return items.length ? <LabelListView className="mcs-campaigns-filter-view" items={items} label="FILTERED_BY" onClickOnClose={onClickOnClose} /> : null;

  }

  buildFilterItems() {

    const {
      filters,
      translations
    } = this.props;

    const items = [];

    Object.keys(filters).forEach(filter => {
      return filters[filter].data.forEach(value => {
        items.push({
          key: value,
          type: filter,
          value: translations[value],
          isClosable: filters[filter].closable
        });
      });
    });

    return items;

  }

}

CampaignsDisplayLabel.propTypes = {
  translations: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  filters: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onClickOnClose: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  translations: state.translationsState.translations
});

const mapDispatchToProps = {};

CampaignsDisplayLabel = connect(
  mapStateToProps,
  mapDispatchToProps
)(CampaignsDisplayLabel);

export default CampaignsDisplayLabel;
