import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';

import messages from './messages';
import ContentHeader from '../../../components/ContentHeader.tsx';

class TimelineHeader extends Component {
  render() {
    const { userId } = this.props;
    const lastSeen =
      userId.lastSeen !== '' ? (
        <span>
          <FormattedMessage {...messages.lastSeen} />{' '}
          {moment(parseInt(userId.lastSeen, 0)).format('YYYY-MM-DD, HH:mm:ss')}
        </span>
      ) : null;

    return userId.id && userId.lastSeen ? (
      <ContentHeader title={userId.id} subTitle={lastSeen} />
    ) : null;
  }
}

TimelineHeader.propTypes = {
  userId: PropTypes.shape({
    id: PropTypes.string.isRequired,
    lastSeen: PropTypes.number.isRequired,
  }).isRequired,
};

export default TimelineHeader;
