import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tag, Tooltip } from 'antd';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { Card } from '../../../../components/Card/index.ts';
import messages from '../messages';

class AccountIdCard extends Component {

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

    const userAccounts = identifiers.items.USER_ACCOUNT || [];
    const accountsFormatted = (userAccounts.length > 5 && !this.state.showMore) ? userAccounts.splice(0, 5) : userAccounts;
    const canViewMore = userAccounts.length > 5 ? true : false;

    return (
      <Card title={formatMessage(messages.accountTitle)} isLoading={identifiers.isLoading}>
        { accountsFormatted && accountsFormatted.map(account => {
          return (
            <Tooltip key={account.user_account_id} placement="topRight" title={account.user_account_id}><Tag className="card-tag alone">{account.user_account_id}</Tag></Tooltip>);
        })}
        { (accountsFormatted.length === 0 || identifiers.hasItems === false) && (<span><FormattedMessage {...messages.emptyAccount} /></span>) }
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

AccountIdCard.propTypes = {
  intl: intlShape.isRequired,
  identifiers: PropTypes.shape({
    isLoading: PropTypes.bool.isRequired,
    hasItems: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
};

AccountIdCard = injectIntl(AccountIdCard);

export default AccountIdCard;
