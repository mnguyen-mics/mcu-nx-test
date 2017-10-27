import * as React from 'react';
import { Icon } from 'antd';

export interface EmptyRecordsProps {
  iconType: string;
  message: string;
  className: string;
}

const EmptyRecords: React.SFC<EmptyRecordsProps> = props => {
  return (
    <div className={`empty-related-records ${props.className}`}>
      <Icon type={props.iconType} />
      {props.message}
    </div>
  );
};

EmptyRecords.defaultProps = {
  iconType: 'exclamation-circle-o',
  className: '',
};

export default EmptyRecords;
