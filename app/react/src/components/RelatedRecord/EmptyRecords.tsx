import * as React from 'react';
import { Row, Col,  Icon } from 'antd';

export interface EmptyRecordsProps {
  iconType: string;
  message: string;
  className: string;
}

const EmptyRecords: React.SFC<EmptyRecordsProps> = props => {
  return (
    <Row className={`empty-related-records ${props.className}`}>
      <Col span={24}>
        <Icon type={props.iconType} />
      </Col>
      <Col span={24}>
        {props.message}
      </Col>
    </Row>
  );
};

EmptyRecords.defaultProps = {
  iconType: 'exclamation-circle-o',
  className: '',
};

export default EmptyRecords;
