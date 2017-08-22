import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import { Row, Col, Tooltip } from 'antd';

import messages from '../messages';

function Origin(props) {
  const {
    origin,
  } = props;

  const renderLine = (key, value) => {
    return (
      <div key={key}>
        <Col className="table-left" span={12}>
          <span><Tooltip title={key}>{key}</Tooltip></span>
        </Col>
        <Col className="table-right" span={12}>
          <span><Tooltip title={key === '$ts' ? moment(value).format('YYYY MM DD, hh:mm:ss') : value}>{key === '$ts' ? moment(value).format('YYYY MM DD, hh:mm:ss') : value}</Tooltip></span>
        </Col>
      </div>);
  };


  return (
    <Row gutter={10} key={origin} className="section table-line border-top">
      <Col span={5} className="section-title"><FormattedMessage {...messages.origin} /></Col>
      <Col span={19}>
        {origin ? Object.keys(origin).map(key => {
          return origin[key] ? renderLine(key, origin[key]) : null;
        }) : (<span><FormattedMessage {...messages.direct} /></span>)}
      </Col>
    </Row>
  );
}

Origin.defaultProps = {
  origin: null,
};

Origin.propTypes = {
  origin: PropTypes.shape({
    $channel: PropTypes.string,
    $campaign_name: PropTypes.string,
    $campaign_id: PropTypes.number,
    $source: PropTypes.string,
    $referral_path: PropTypes.string,
    $gclid: PropTypes.string,
  }),
};

export default Origin;
