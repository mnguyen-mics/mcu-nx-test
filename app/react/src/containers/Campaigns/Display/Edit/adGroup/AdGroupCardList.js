import React from 'react';
import { split } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import CreativeCard from '../../../Email/Edit/CreativeCard';
import { ButtonStyleless, McsIcons } from '../../../../../components';
import { computeDimensionsByRatio } from '../../../../../utils/ShapeHelper';

function AdGroupCardList({ data, updateTableFieldState }) {
  const cardContent = (index) => ({
    title: {
      key: 'name',
      render: (text) => {
        return <div className="title"><span>{text}</span></div>;
      }
    },

    footer: {
      keys: ['id', 'format'],
      render: (values) => {
        const format = split(values.format, 'x');
        const dimensions = computeDimensionsByRatio(Number(format[0]), Number(format[1]));

        const shapeStyle = {
          backgroundColor: '#e8e8e8',
          border: 'solid 1px #c7c7c7',
          height: `${dimensions.width}em`,
          width: `${dimensions.height}em`
        };

        return (
          <div>
            <Row className="footer">
              <Col className="inline formatWrapper" span={16}>
                <div style={shapeStyle} />
                <div className="dimensions">{values.format}</div>
              </Col>
              <Col className="inline buttons" span={6}>
                <ButtonStyleless>
                  <McsIcons type="pen" className="button" />
                </ButtonStyleless>

                <div className="button-separator" />

                <ButtonStyleless>
                  <McsIcons
                    className="button"
                    onClick={updateTableFieldState({ index, tableName: 'ads' })}
                    type="delete"
                  />
                </ButtonStyleless>
              </Col>
            </Row>
          </div>
        );
      }
    }
  });

  const cards = data
    .map((card, index) => ({
      id: card.id,
      toBeRemoved: card.toBeRemoved,
      view: <CreativeCard key={card.id} item={card} {...cardContent(index)} />
    }))
    .filter(card => !card.toBeRemoved);

  return (
    <Row className="mcs-table-card">
      <Row gutter={20}>
        {cards.map(card => (
          <Col key={card.id} span={6}>
            <div className="adGroupCard">{ card.view }</div>
          </Col>
          )
        )}
      </Row>
    </Row>
  );
}

AdGroupCardList.defaultProps = {
  data: [],
};

AdGroupCardList.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({})),
  updateTableFieldState: PropTypes.func.isRequired,
};

export default AdGroupCardList;
