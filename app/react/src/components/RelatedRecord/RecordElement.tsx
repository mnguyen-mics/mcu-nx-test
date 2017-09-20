import * as React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Icon, Row } from 'antd';

import McsIcons from '../McsIcons';

interface RecordElementProps {
  recordIconType: string;
  title: string;
  actionButtons?: object;
}

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


export default RecordElement;
