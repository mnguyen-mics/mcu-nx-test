import * as React from 'react';
import EmptyRecords, { EmptyRecordsProps } from './EmptyRecords';

interface RelatedRecordsProps {
  emptyOption: EmptyRecordsProps;
}

const RelatedRecords: React.SFC<RelatedRecordsProps> = ({ emptyOption, children }) => {
  return React.Children.count(children) > 0
    ? (
    <div className="related-records-container">
      {children}
    </div>)
    : <EmptyRecords {...emptyOption} />;
};

export default RelatedRecords;
