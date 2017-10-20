import React from 'react';
import PropTypes from 'prop-types';

import EmptyRecords from './EmptyRecords.tsx';

function RelatedRecords({ emptyOption, children }) {

  return (children
    ? <div className="related-records-container">
      {children}
    </div>
    : <EmptyRecords {...emptyOption} />
  );
}

RelatedRecords.propTypes = {
  emptyOption: PropTypes.shape({
    iconType: PropTypes.string,
    message: PropTypes.string.isRequired,
  }).isRequired,
};

export default RelatedRecords;
