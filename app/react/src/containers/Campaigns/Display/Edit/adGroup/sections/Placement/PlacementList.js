import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { arrayInsert, arrayRemove } from 'redux-form';

import { List } from '../../../../../../../components/index.ts';
import PlacementHeader from './PlacementHeader';
import PlacementRow from './PlacementRow';
import messages from '../../../messages';

class PlacementList extends Component {

  state = { displayTableOptions: true }

  updateDisplayOptions = (bool) => (e) => {
    this.setState({ displayTableOptions: bool });
    e.preventDefault();
  }

  updateAllCheckboxes = (bool) => () => {
    const { formName, placements, type } = this.props;

    placements.forEach((placement) => {
      if (placement.checked !== bool) {
        const tableName = `placements.${type}`;
        const newState = { ...placement, checked: bool };

        this.props.arrayRemove(formName, tableName, placement.index);
        this.props.arrayInsert(formName, tableName, placement.index, newState);
      }
    });
  }

  render() {
    const { displayHeaderTopBorder, formatMessage, placements, title } = this.props;
    const { displayTableOptions } = this.state;

    const placementsToDisplay = (displayTableOptions ? placements : null);
    const placementMapping = (placementsToDisplay && placementsToDisplay.length
      ? placements.map((elem) => <PlacementRow key={elem.index} {...elem} />)
      : <li className="empty-list">{formatMessage(messages.contentSectionPlacementSearchEmptyTable)}</li>
    );

    return (
      <div>
        <PlacementHeader
          className={displayHeaderTopBorder ? 'header-top-border' : ''}
          displayTableOptions={displayTableOptions}
          handlers={{
            updateAllCheckboxes: this.updateAllCheckboxes,
            updateDisplayOptions: this.updateDisplayOptions,
          }}
          placements={placements}
          title={formatMessage(title)}
        />

        {placementsToDisplay && (
          <List className="list scrolling">
            {placementMapping}
          </List>
        )}
      </div>
    );
  }
}

PlacementList.defaultProps = {
  displayHeaderTopBorder: false,
  placements: [],
};


PlacementList.propTypes = {
  arrayInsert: PropTypes.func.isRequired,
  arrayRemove: PropTypes.func.isRequired,
  displayHeaderTopBorder: PropTypes.bool,
  formatMessage: PropTypes.func.isRequired,
  formName: PropTypes.string.isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),

  title: PropTypes.shape({
    defaultMessage: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,

  type: PropTypes.string.isRequired,
};

const mapDispatchToProps = { arrayInsert, arrayRemove };

export default connect(null, mapDispatchToProps)(PlacementList);
