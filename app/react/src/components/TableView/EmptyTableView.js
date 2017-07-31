import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { Col } from 'antd';

import { McsIcons } from '../McsIcons';

const messages = defineMessages({
  emptyMsg: {
    id: 'generic.table.empty.information_message',
    defaultMessage: 'No data found'
  }
});

class EmptyTableView extends Component {

  render() {
    const {
      className,
      iconType,
      text,
      intlMessage
    } = this.props;

    // support new intl message obj and legacy translation key (en/fr.json)
    const formattedMessageProps = {
      id: intlMessage.id ? intlMessage.id : text ? text : messages.emptyMsg.id,
      defaultMessage: intlMessage.defaultMessage ? intlMessage.defaultMessage : messages.emptyMsg.defaultMessage
    };

    return (
      <Col span={24} className={className}>
        <div className="logo">
          <McsIcons type={iconType} />
        </div>
        <FormattedMessage {...formattedMessageProps} />
      </Col>);
  }

}

EmptyTableView.defaultProps = {
  iconType: 'exclamation',
  className: 'mcs-table-view-empty',
  intlMessage: {},
  text: null
};

EmptyTableView.propTypes = {
  text: PropTypes.string,
  intlMessage: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  iconType: PropTypes.string,
  className: PropTypes.string
};


export default EmptyTableView;
