import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, Icon } from 'antd';

import { McsIcons } from '../McsIcons';

const EmptyRecords = ({ iconType, message, className }) => {
  return (
    <Row className={`empty-related-records ${className}`}>
      <Col span={24}>
        <Icon type={iconType} />
      </Col>
      <Col span={24}>
        {message}
      </Col>
    </Row>
  );
};

EmptyRecords.defaultProps = {
  iconType: 'exclamation-circle-o',
  className: ''
};

EmptyRecords.propTypes = {
  iconType: PropTypes.string,
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const RecordElement = ({ recordIconType, title, actionButtons, children }) => {
  return (
    <Row className="related-record">
      <Col span={1}>
        <McsIcons type={recordIconType} />
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

RecordElement.defaultProps = {
  title: '',
  actionButtons: []
};

RecordElement.propTypes = {
  recordIconType: PropTypes.string.isRequired,
  title: PropTypes.string,
  actionButtons: PropTypes.arrayOf(
    PropTypes.shape({
      iconType: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    })
  )
};

const RelatedRecords = ({ emptyOption, children }) => {
  return children.length > 0
    ? <div className="related-records-container">
      {children}
    </div>
    : <EmptyRecords {...emptyOption} />;
};

RelatedRecords.propTypes = {
  emptyOption: PropTypes.shape({
    iconType: PropTypes.string,
    message: PropTypes.string.isRequired
  }).isRequired
};

export { RelatedRecords, RecordElement };
