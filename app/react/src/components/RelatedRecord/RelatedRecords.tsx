import * as React from 'react';
import { Spin } from 'antd';
import EmptyRecords, { EmptyRecordsProps } from './EmptyRecords';

interface RelatedRecordsProps {
  emptyOption: EmptyRecordsProps;
  isLoading?: boolean;
}

class RelatedRecords extends React.Component<RelatedRecordsProps> {
  static defaultProps = {
    isLoading: false,
  };

  render() {
    const { children, emptyOption, isLoading } = this.props;

    return (
      <Spin spinning={isLoading}>
        {React.Children.count(children) > 0 ? (
          <div className='related-records-container'>{children}</div>
        ) : (
          <EmptyRecords {...emptyOption} />
        )}
      </Spin>
    );
  }
}

export default RelatedRecords;
