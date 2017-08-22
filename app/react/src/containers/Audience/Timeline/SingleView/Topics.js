import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { FormattedMessage } from 'react-intl';

import messages from '../messages';

const Topics = (props) => {
  const {
    topics,
  } = props;


  const renderLine = (key, subKey, value) => {
    return (
      <Row key={key + subKey + value}>
        <Col className="" span={8}>
          <span>{key}</span>
        </Col>
        <Col className="" span={8}>
          <span>{subKey}</span>
        </Col>
        <Col className="" span={8}>
          <span>{value}</span>
        </Col>
      </Row>);
  };

  return (topics && Object.keys(topics).length) ? (
    <Row gutter={10} className="section table-line border-top">
      <Col span={5} className="section-title"><FormattedMessage {...messages.topics} /></Col>
      <Col span={19}>
        {topics ? Object.keys(topics).map(key => {
          if (typeof topics[key] === 'object' && !Array.isArray(topics[key])) {
            if (Object.keys(topics[key]).length === 0) {
              return renderLine(key, null, null);
            }
            return Object.keys(topics[key]).map(subKey => {
              return renderLine(key, subKey, topics[key][subKey]);
            });
          } else if (Array.isArray(topics[key])) {
            topics[key].map(value => {
              return renderLine(key, null, value);
            });
          }
          return renderLine(key, null, topics[key]);
        }) : null}
      </Col>
    </Row>
  ) : null;
};

Topics.defaultProps = {
  topics: {},
};

Topics.propTypes = {
  topics: PropTypes.object, // eslint-disable-line react/forbid-prop-types
};

export default Topics;
