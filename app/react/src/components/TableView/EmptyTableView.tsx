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

interface EmptyTableViewProps {
  text?: string;
  intlMessage?: {
    id?: string;
    defaultMessage?: string;
  };
  iconType?: string;
  className?: string;
}

const EmptyTableView:React.SFC<EmptyTableViewProps> = props => {


  /* Support new intl message obj and legacy translation key (en/fr.json) */
  const formattedMessageProps = {
    id: props.intlMessage.id ? props.intlMessage.id : props.text ? props.text : messages.emptyMsg.id,
    defaultMessage: (props.intlMessage.defaultMessage
      ? props.intlMessage.defaultMessage
      : messages.emptyMsg.defaultMessage
    ),
  };

  return (
    <div className="mcs-aligner">
      <Col span={24} className={props.className}>
        <div className="logo">
          <McsIcons type={props.iconType} />
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

export default EmptyTableView;
