import * as React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Icon } from 'antd';

//import { McsIcons } from '../McsIcons';

interface EmptyRecordsProps {
  iconType: string;
  message: string;
  className: string
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
  className: ''
};

interface RecordElementActionButtonsProps { iconType: string, onClick: () => void }
interface RecordElementProps { recordIconType: string, title: string, actionButtons: RecordElementActionButtonsProps[]  }

const RecordElement = ({ recordIconType, title, actionButtons, children }) => {
  return (
    <Row className="related-record">
      <Col span={1}>

      </Col>
      <Col span={7}>
        {title}
      </Col>
      <Col span={15}>
        {children}
      </Col>
      <Col span={1}>
        {actionButtons.map(({ iconType, onClick }) => {
          return (
            <Button key={Math.random()} className="invisible-button" onClick={onClick}>
              <Icon type={iconType} />
            </Button>
          );
        })}
      </Col>
    </Row>
  );
};

const RelatedRecords = ({ emptyOption, children }) => {
  return children.length > 0
    ? <div className="related-records-container">
      {children}
    </div>
    : <EmptyRecords {...emptyOption} />;
};

export { RelatedRecords, RecordElement };
