import React from 'react';
import { split } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import CreativeCard from '../../../Email/Edit/CreativeCard';

function AdGroupCardList({ data }) {
  const cardContent = {
    title: {
      key: 'name',
      render: (text) => {
        return <span>{text}</span>;
      }
    },

    footer: {
      keys: ['id', 'format'],
      render: (values) => {
        const format = split(values.format, 'x');
        const width = `${Number(format[0]) / 220}em`;
        const height = `${Number(format[1]) / 220}em`;

        return (
          <div>
            <Row>
              <Col span={3}>
                <div style={{ backgroundColor: '#e8e8e8', border: 'solid 1px #c7c7c7', height, width }} />
              </Col>
              <Col span={18}>
                <div className="format">{values.format}</div>
              </Col>
              <Col span={4} />
            </Row>
          </div>
        );
      }
    }
  };

  console.log('CARD data = ', data);

  const cards = data.map(card => ({
    id: card.id,
    view: <CreativeCard key={card.id} item={card} {...cardContent} />
  }));

  return (
    <Row className="mcs-table-card">
      <Row gutter={20}>
        {cards.map(card => (
          <Col key={card.id} span={6}>
            <div className="adGroupCard">{ card.view }</div>
          </Col>
        ))}
      </Row>
    </Row>
  );
}

AdGroupCardList.defaultProps = {
  data: [],
};

AdGroupCardList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

export default AdGroupCardList;
