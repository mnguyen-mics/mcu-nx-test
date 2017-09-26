import React from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import CreativeCard from '../../../Email/Edit/CreativeCard';

function CardList({ data }) {
  const cardContent = {
    title: {
      key: 'name',
      render: (text) => {
        return <span>{text}</span>;
      }
    },

    footer: {
      key: 'selected',
      render: () => {
        return (
          <div>ad footer</div>
        );
      }
    }
  };

  const cards = data.map(elem => <CreativeCard item={elem} {...cardContent} />);

  return (
    <Row className="mcs-table-card">
      <Row gutter={20}>
        {cards.map(card => <Col span={6} key={card.id}>{ card }</Col>)}
      </Row>
    </Row>
  );
}

CardList.defaultProps = {
  data: [],
};

CardList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
};

export default CardList;
