import * as React from 'react';
import EmptyRecords from './EmptyRecords';

const RelatedRecords = ({ emptyOption, children }) => {
  return children.length > 0
    ? <div className="related-records-container">
      {children}
    </div>
    : <EmptyRecords {...emptyOption} />;
};

export default RelatedRecords;
