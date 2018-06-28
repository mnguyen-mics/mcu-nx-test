import * as React from 'react';
import { Tag, Tooltip } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '../../../../components/Card/index';
import messages from '../messages';
import { IdentifiersProps } from '../../../../models/timeline/timeline';

interface AccountIdCardProps {
  identifiers: IdentifiersProps;
}

interface State {
  showMore: boolean;
}

type Props = AccountIdCardProps & InjectedIntlProps;

class AccountIdCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  render() {
    const {
      identifiers,
      intl: { formatMessage },
    } = this.props;

    const userAccounts = identifiers.items.USER_ACCOUNT || [];
    const accountsFormatted =
      userAccounts.length > 5 && !this.state.showMore
        ? userAccounts.splice(0, 5)
        : userAccounts;
    const canViewMore = userAccounts.length > 5 ? true : false;

    const handleShowMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };

    return (
      <Card
        title={formatMessage(messages.accountTitle)}
        isLoading={identifiers.isLoading}
      >
        {accountsFormatted &&
          accountsFormatted.map(account => {
            return (
              <Tooltip
                key={account.user_account_id}
                placement="topRight"
                title={account.user_account_id}
              >
                <Tag className="card-tag alone">{account.user_account_id}</Tag>
              </Tooltip>
            );
          })}
        {(accountsFormatted.length === 0 || identifiers.hasItems === false) && (
          <span>
            <FormattedMessage {...messages.emptyAccount} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={handleShowMore(true)}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className="mcs-card-footer">
              <button
                className="mcs-card-footer-link"
                onClick={handleShowMore(false)}
              >
                <FormattedMessage {...messages.viewLess} />
              </button>
            </div>
          )
        ) : null}
      </Card>
    );
  }
}

export default injectIntl(AccountIdCard);
