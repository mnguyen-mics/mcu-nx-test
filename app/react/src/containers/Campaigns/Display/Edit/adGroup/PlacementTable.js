import React from 'react';
import { filter } from 'lodash';
import PropTypes from 'prop-types';

// import { Field } from 'redux-form';
// import { Table } from 'antd';

/*
<Table
  className={tableStyle}
  columns={columns}
  dataSource={dataSource}
  loading={loading}
  pagination={false}
  showHeader={false}
/>
*/

function PlacementTable({ placements }) {
  // const getPlacements = (type) => placements.filter(placement => placement.type === type);
  //
  // const webPlacements = getPlacements('web');
  // const mobilePlacements = getPlacements('mobile');

  const webPlacements = filter(placements, { type: 'web' });
  const mobilePlacements = filter(placements, { type: 'mobile' });

  console.log('webPlacements = ', webPlacements);
  console.log('mobilePlacements = ', mobilePlacements);

  return (
    <div>Inside Placement Table</div>
  );
}

PlacementTable.defaultProps = {
  placements: [],
};


PlacementTable.propTypes = {
  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired),
};

export default PlacementTable;
