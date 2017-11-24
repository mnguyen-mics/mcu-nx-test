import React, { Component } from 'react';
import { split } from 'lodash';
import PropTypes from 'prop-types';
import { Col, Row } from 'antd';

import CreativeCard from '../../../../../Email/Edit/CreativeCard';
import { ButtonStyleless, McsIcons } from '../../../../../../../components/index.ts';
import { computeDimensionsByRatio } from '../../../../../../../utils/ShapeHelper';
import EditDisplayCreativeContent from '../../../../../../Creative/DisplayAds/Edit/EditPage/EditDisplayCreativeContent';
import AuditComponent from '../../../../../../Creative/DisplayAds/Edit/EditPage/AuditComponent';

class AdGroupCardList extends Component {

  openCreativeEditionDrawer = (creativeId) => (e) => {
    e.preventDefault();
    const { handlers } = this.props;
    const additionalProps = {
      openNextDrawer: handlers.openNextDrawer,
      closeNextDrawer: handlers.closeNextDrawer,
      onClose: handlers.closeNextDrawer,
      save: this.props.updateCreative,
      close: handlers.closeNextDrawer,
    };

    const options = {
      additionalProps: additionalProps,
      isModal: true,
      creativeId: creativeId,
    };
    handlers.openNextDrawer(EditDisplayCreativeContent, options);
  }

  render() {

    const {
      className,
      data,
      updateTableFieldStatus,
    } = this.props;

    const cardContent = (index) => ({
      title: {
        key: 'name',
        render: (text) => {
          return <div className="title"><span>{text}</span></div>;
        }
      },

      footer: {
        keys: ['id', 'format', 'audit_status', 'available_user_audit_actions'],
        render: (values) => {
          const format = split(values.format, 'x');
          const dimensions = computeDimensionsByRatio(Number(format[0]), Number(format[1]));

          const shapeStyle = {
            backgroundColor: '#e8e8e8',
            border: 'solid 1px #c7c7c7',
            height: `${dimensions.width}em`,
            width: `${dimensions.height}em`
          };

          const creativeId = values.id;

          return (
            <div>
              <Row className="footer">
                <Col className="inline formatWrapper" span={16}>
                  <div style={shapeStyle} />
                  <div className="dimensions">{values.format}</div>
                </Col>
                <Col className="inline buttons" span={6}>

                  <ButtonStyleless>
                    <McsIcons
                      type="pen"
                      className="button"
                      onClick={this.openCreativeEditionDrawer(creativeId)}
                    />
                  </ButtonStyleless>

                  <div className="button-separator" />

                  <ButtonStyleless>
                    <McsIcons
                      className="button"
                      onClick={updateTableFieldStatus({ index, tableName: 'adTable' })}
                      type="delete"
                    />
                  </ButtonStyleless>
                </Col>
              </Row>
              <Row className="footer">
                <Col className="inline formatWrapper" span={22}>
                  <AuditComponent creative={values} mode="creativeCard" />
                </Col>
              </Row>
            </div>
          );
        }
      },
    });

    const cards = data
      .map((card, index) => ({
        id: card.id,
        toBeRemoved: card.toBeRemoved,
        view: <CreativeCard key={card.id} item={card} {...cardContent(index)} />
      }))
      .filter(card => !card.toBeRemoved);

    return (
      <div className={`mcs-table-card ${className}`}>
        <Row gutter={20}>
          {cards.map(card => (
            <Col key={card.id} span={6}>
              <div className="ad-group-card">{ card.view }</div>
            </Col>
            )
          )}
        </Row>
      </div>
    );
  }
}

AdGroupCardList.defaultProps = {
  className: '',
  data: [],
};

AdGroupCardList.propTypes = {
  className: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape().isRequired),
  updateTableFieldStatus: PropTypes.func.isRequired,
  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
  }).isRequired,
  updateCreative: PropTypes.func.isRequired,
};

export default AdGroupCardList;
