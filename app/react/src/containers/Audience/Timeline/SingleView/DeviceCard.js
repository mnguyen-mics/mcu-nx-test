import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Card } from '../../../../components/Card/index.ts';
import Device from './Device';
import messages from '../messages';

class DeviceCard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  render() {
    const {
      identifiers,
      intl: {
        formatMessage,
      },
    } = this.props;

    const userAgents = identifiers.items.USER_AGENT || [];
    let accountsFormatted = [];
    if (userAgents.length > 5 && !this.state.showMore) {
      accountsFormatted = accountsFormatted.concat(userAgents).splice(0, 5);
    } else {
      accountsFormatted = accountsFormatted.concat(userAgents);
    }
    const canViewMore = userAgents.length > 5 ? true : false;


    return (
      <Card title={formatMessage(messages.deviceTitle)} isLoading={identifiers.isLoading}>
        { accountsFormatted && accountsFormatted.map(agent => {
          return agent.device ? (
            <Device key={agent.vector_id} vectorId={agent.vector_id} device={agent.device} />
          ) : <div key={agent.vector_id}>{agent.vector_id}</div>;
        })}
        { (accountsFormatted.length === 0 || identifiers.hasItems === false) && (<span><FormattedMessage {...messages.emptyDevice} /></span>) }
        { (canViewMore) ? (
          (!this.state.showMore) ? (
            <div className="mcs-card-footer">
              <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: true }); }}><FormattedMessage {...messages.viewMore} /></button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button className="mcs-card-footer-link" onClick={(e) => { e.preventDefault(); this.setState({ showMore: false }); }}><FormattedMessage {...messages.viewLess} /></button>
            </div>
          )
        ) : null }
      </Card>
    );
  }
}

DeviceCard.propTypes = {
  intl: intlShape.isRequired,
  identifiers: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
};

DeviceCard = injectIntl(DeviceCard);

export default DeviceCard;
