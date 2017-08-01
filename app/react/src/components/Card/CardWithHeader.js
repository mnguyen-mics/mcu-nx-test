import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import { HeaderItem } from './';

function CardWithHeader({ children, headerItems }) {

  const displayHeader = headerItems.map((element, i) => (
    <HeaderItem
      className={i !== headerItems.length - 1 ? 'section border' : 'section'}
      data={element}
      key={element.translationKey}
    />
  ));

  return (
    <Row className="mcs-table-container-full">
      <Row className="mcs-table-header">{ displayHeader }</Row>
      <Row className="mcs-table-body">
        <Col span={24}>
          {children}
        </Col>
      </Row>
    </Row>
  );
}

CardWithHeader.defaultProps = {
  buttons: <span />,
  hasHeader: true,
  headerItems: [],
};

CardWithHeader.propTypes = {
  headerItems: PropTypes.arrayOf(PropTypes.shape({
    iconType: PropTypes.string,
    translationKey: PropTypes.string,
    number: PropTypes.string,
  })),
};

export default CardWithHeader;
