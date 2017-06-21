import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'antd';
import { FormattedMessage } from 'react-intl';
import { McsIcons } from '../McsIcons';


class CardWithHeader extends Component {

  render() {

    const {
      title,
      buttons,
      headerItems
    } = this.props;

    return (
      <Row className="mcs-table-container-full">
        <Row className="mcs-table-header">
          { headerItems.map((element, i) => {
            return (<Col key={element.translationKey} span={6} className={i !== headerItems.length - 1 ? 'section border' : 'section'}>
              <McsIcons type={element.iconType} />
              <div className="title"><FormattedMessage id={element.translationKey} /></div>
              <div className="number">{element.number}</div>
            </Col>);
          }) }
        </Row>
        <Row className="mcs-table-body">
          <Col span={24}>
            {this.props.children}
          </Col>
        </Row>
      </Row>
    );
  }

}

CardWithHeader.defaultProps = {
  buttons: <span />,
  hasHeader: true,
  headerItems: [{
    iconType: 'full-users',
    translationKey: 'USERPOINTS',
    number: '999,999,999'
  },
  {
    iconType: 'email-inverted',
    translationKey: 'EMAILS',
    number: '3,654'
  },
  {
    iconType: 'display',
    translationKey: 'DISPLAY',
    number: '65,876'
  },
  {
    iconType: 'phone',
    translationKey: 'PHONE',
    number: '342'
  }]
};

CardWithHeader.propTypes = {
  title: PropTypes.string.isRequired,
  buttons: PropTypes.element,
  hasHeader: PropTypes.bool,
  headerItems: PropTypes.arrayOf(PropTypes.shape({
    iconType: PropTypes.string,
    translationKey: PropTypes.string,
    number: PropTypes.string
  }))
};

export default CardWithHeader;
