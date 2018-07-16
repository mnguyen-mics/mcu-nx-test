import * as React from 'react';
import McsIcon, { McsIconType } from '../McsIcon';

export interface EmptyRecordsProps {
  iconType?: McsIconType;
  message: string;
  className?: string;
}

const EmptyRecords: React.SFC<EmptyRecordsProps> = props => {
  return (
    <div className={`empty-related-records ${props.className ? props.className : ''}`}>
      <McsIcon type={props.iconType!} />
      {props.message}
    </div>
  );
};

EmptyRecords.defaultProps = {
  iconType: 'warning',
  className: '',
};

export default EmptyRecords;
