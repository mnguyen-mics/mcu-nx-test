import React from 'react';
import { split } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import CreativeCard from '../../../../../Common/CreativeCard.tsx';
import {
  ButtonStyleless,
  McsIcons,
} from '../../../../../../../components/index.ts';
import { computeDimensionsByRatio } from '../../../../../../../utils/ShapeHelper';

function AdGroupCardList({ className, data, updateTableFieldStatus }) {
  const cardContent = index => ({
    renderTitle: creative => (
      <div className="title">
        <span>{creative.name}</span>
      </div>
    ),
    renderFooter: creative => {
      const format = split(creative.format, 'x');
      const dimensions = computeDimensionsByRatio(
        Number(format[0]),
        Number(format[1]),
      );

      const shapeStyle = {
        backgroundColor: '#e8e8e8',
        border: 'solid 1px #c7c7c7',
        height: `${dimensions.width}em`,
        width: `${dimensions.height}em`,
      };

      return (
        <Row className="footer">
          <Col className="inline formatWrapper" span={16}>
            <div style={shapeStyle} />
            <div className="dimensions">{creative.format}</div>
          </Col>
          <Col className="inline buttons" span={6}>
            <ButtonStyleless>
              <McsIcons type="pen" className="button" />
            </ButtonStyleless>

            <div className="button-separator" />

            <ButtonStyleless
              onClick={updateTableFieldStatus({ index, tableName: 'adTable' })}
            >
              <McsIcons className="button" type="delete" />
            </ButtonStyleless>
          </Col>
        </Row>
      );
    },
  });

  const cards = data
    .map((card, index) => ({
      id: card.id,
      toBeRemoved: card.toBeRemoved,
      view: (
        <CreativeCard key={card.id} creative={card} {...cardContent(index)} />
      ),
    }))
    .filter(card => !card.toBeRemoved);

  return (
    <div className={`mcs-table-card ${className}`}>
      <Row gutter={20}>
        {cards.map(card => (
          <Col key={card.id} span={6}>
            <div className="ad-group-card">{card.view}</div>
          </Col>
        ))}
      </Row>
    </div>
  );
}

AdGroupCardList.defaultProps = {
  className: '',
  data: [],
};

AdGroupCardList.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape().isRequired),
  updateTableFieldStatus: PropTypes.func.isRequired,
};

export default AdGroupCardList;
