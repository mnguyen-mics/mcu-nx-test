import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import lodash from 'lodash';

import McsIcons from '../../../../components/McsIcons.tsx';
import messages from '../messages';

class EventActivity extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  formatIntoArray = (value) => {
    if (typeof value === 'object' && !Array.isArray(value)) {

      const formattedArray = Object.keys(value).map(key => { return { name: key, value: value[key] }; });
      return lodash.sortBy(formattedArray, [(o) => { return o.name; }]).map(item => {
        return [item.name, item.value || 'empty'];
      });
    } else if (Array.isArray(value)) {
      return value.sort((a, b) => {
        return a - b;
      });
    }
    return value;
  };

  renderSubList = (array) => {
    return array.map(items => {
      return (
        <div key={items[0]}>
          <Tooltip title={items[0]}><Tag className="card-tag">{items[0]}</Tag></Tooltip> :
          {items[1] === 'empty' ? (<i className="empty"><FormattedMessage {...messages.empty} /></i>) : this.renderList(this.formatIntoArray(items[1]))}
        </div>);
    });
  }

  renderList = (array) => {
    if (typeof array === 'object' && Array.isArray(array)) {
      return array.map(value => {
        if (typeof value === 'object') {
          return (
            <Col className="event-properties-sublist" span={24} style={{ marginLeft: '40px', marginTop: 5 }}>
              {this.renderSubList(this.formatIntoArray(value))}
            </Col>);
        }
        return (<span><Tooltip title={value}>{value}</Tooltip></span>);
      });
    }
    return (<span><Tooltip title={array}>{array}</Tooltip></span>);
  }

  render() {
    const {
      event,
    } = this.props;

    const changeVisibility = () => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.showMore = !this.state.showMore;
        return nextState;
      });
    };

    return (
      <Row className="section border-top">
        <Col className="section-ts" span={5}>
          {moment(event.$ts).format('HH:mm:ss')}
        </Col>
        <Col span={19}>
          <div className="section-title">
            {event.$event_name}
          </div>
          <div className="section-cta">
            {(Object.keys(event.$properties).length !== 0 && event.$properties.constructor === Object) ? (<button className="mcs-card-inner-action" onClick={changeVisibility}> {!this.state.showMore ? <span><McsIcons type="chevron" /> <FormattedMessage {...messages.detail} /></span> : <span><McsIcons className="icon-inverted" type="chevron" /> <FormattedMessage {...messages.less} /></span>}</button>) : null}
          </div>
        </Col>
        {this.state.showMore === true ? (<div className="event-properties-list">
          {event.$properties ? this.formatIntoArray(event.$properties).map(object => {
            return (
              <div className="event-properties-list-item" key={object}>
                <Tooltip title={object[0]}><Tag className="card-tag">{object[0]}</Tag></Tooltip> :
                { object[1] === 'empty' ? (<i className="empty"><FormattedMessage {...messages.empty} /></i>) : this.renderList(this.formatIntoArray(object[1]))}
              </div>);
          }) : null}
        </div>) : null}
      </Row>
    );
  }
}

EventActivity.propTypes = {
  event: PropTypes.shape({
    $event_name: PropTypes.string,
    $properties: PropTypes.object,
    $ts: PropTypes.number,
  }).isRequired,
};

export default EventActivity;
