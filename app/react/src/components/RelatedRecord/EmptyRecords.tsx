import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import * as React from 'react';
import { Icon } from 'antd';
import { IconProps } from 'antd/lib/icon';

export interface EmptyRecordsProps  {
  iconType?: McsIconType;
  genericIconProps?: IconProps;
  message: string;
  className?: string;
}

const EmptyRecords: React.SFC<EmptyRecordsProps> = props => {
  const { iconType, genericIconProps } = props;

  return (
    <div className={`empty-related-records ${props.className ? props.className : ''}`}>
      {iconType && <McsIcon type={iconType} />}
      {genericIconProps && <Icon {...genericIconProps} />}
      {!iconType && !genericIconProps && <McsIcon type='warning' />}
      {props.message}
    </div>
  );
};

EmptyRecords.defaultProps = {
  className: '',
};

export default EmptyRecords;
