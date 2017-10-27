import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon, Input } from 'antd';

import { List } from '../../../../../../../components/index.ts';
import PlacementRow from './PlacementRow';
import { toLowerCaseNoAccent } from '../../../../../../../utils/StringHelper';
import messages from '../../../messages';

class PlacementSearch extends Component {

  state = { keyword: '' }

  onClose = (e) => {
    this.updateSearch();
    this.props.updateDisplayOptions(false)(e);
    e.preventDefault();
  }

  updateSearch = (e) => {
    this.setState({
      keyword: (e && e.target.value ? toLowerCaseNoAccent(e.target.value) : '')
    });
  }

  render() {
    const { displaySearchOptions, formatMessage, placements, updateDisplayOptions } = this.props;
    const { keyword } = this.state;

    const suffix = (displaySearchOptions ? <Icon type="close-circle" onClick={this.onClose} /> : null);
    const placementsToDisplay = (displaySearchOptions
      ? placements.filter(elem => toLowerCaseNoAccent(elem.text).includes(this.state.keyword))
      : null
    );

    const searchMapping = (placementsToDisplay && placementsToDisplay.length
      ? placementsToDisplay.map((elem) => (
        <PlacementRow key={elem.id} {...elem} text={`${elem.type} > ${elem.text}`} />
      ))
      : <li className="empty-list">{formatMessage(messages.contentSectionPlacementSearchEmptyTable)}</li>
    );

    return (
      <div>
        <Input
          size="large"
          className="search-input"
          placeholder={formatMessage(messages.contentSectionPlacementSearchPlaceholder)}
          prefix={<Icon type="search" />}
          suffix={suffix}
          value={keyword}
          onChange={this.updateSearch}
          onFocus={updateDisplayOptions(true)}
        />

        {displaySearchOptions && (
          <List className="list scrolling">
            {searchMapping}
          </List>
        )}
      </div>
    );
  }
}

PlacementSearch.defaultProps = {
  placements: [],
};

PlacementSearch.propTypes = {
  displaySearchOptions: PropTypes.bool.isRequired,
  formatMessage: PropTypes.func.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  updateDisplayOptions: PropTypes.func.isRequired,
};

export default PlacementSearch;
