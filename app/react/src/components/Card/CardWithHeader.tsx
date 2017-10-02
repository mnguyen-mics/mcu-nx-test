import * as React from 'react';
import PropTypes from 'prop-types';
import { Card } from './';
import { Row, Col } from 'antd';
import { HeaderItem } from './';

interface CardWithHeaderProps {
  headerItems?: [{
    iconType?: string;
    translationKey?: string;
    number?: number;
  }];
  buttons?: JSX.Element;
  hasHeader?: boolean;
}

const CardWithHeader: React.SFC<CardWithHeaderProps> = ({children, headerItems }) => {

  const displayHeader = headerItems.map((element, i) => (
    <HeaderItem
      className={i !== headerItems.length - 1 ? 'section border' : 'section'}
      data={element}
      key={element.translationKey}
    />
  ));

  return (
    <Row className="mcs-table-container-full">
      <Row className="mcs-table-header">{displayHeader}</Row>
      <Row className="mcs-table-body">
        <Col span={24}>
          {children}
        </Col>
      </Row>
    </Row>
  );
};

CardWithHeader.defaultProps = {
  headerItems: [{
    iconType: '',
    translationKey: '',
    number: 0,
  }],
  buttons: <span />,
  hasHeader: true,
};

export default CardWithHeader;
