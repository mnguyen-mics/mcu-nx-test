import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import { Col } from 'antd';

import McsIcons from '../McsIcons';

const messages = defineMessages({
  emptyMsg: {
    id: 'generic.table.empty.information_message',
    defaultMessage: 'No data found',
  },
});

function EmptyTableView({
    className,
    iconType,
    text,
    intlMessage,
  }) {

  /* Support new intl message obj and legacy translation key (en/fr.json) */
  const formattedMessageProps = {
    id: intlMessage.id ? intlMessage.id : text ? text : messages.emptyMsg.id,
    defaultMessage: (intlMessage.defaultMessage
      ? intlMessage.defaultMessage
      : messages.emptyMsg.defaultMessage
    ),
  };

  return (
    <div className="mcs-aligner">
      <Col span={24} className={className}>
        <div className="logo">
          <McsIcons type={iconType} />
        </div>
        <FormattedMessage {...formattedMessageProps} />
      </Col>
    </div>
  );
}

EmptyTableView.defaultProps = {
  iconType: 'exclamation',
  className: 'mcs-table-view-empty',
  intlMessage: {},
  text: null,
};

EmptyTableView.propTypes = {
  text: PropTypes.string,
  intlMessage: PropTypes.shape(),
  iconType: PropTypes.string,
  className: PropTypes.string,
};

export default EmptyTableView;
