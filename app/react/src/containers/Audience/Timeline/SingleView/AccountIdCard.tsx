import * as React from 'react';
import { groupBy } from 'lodash';
import { Tag, Tooltip, Row, Spin } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '../../../../components/Card/index';
import messages from '../messages';
import { IdentifiersProps } from '../../../../models/timeline/timeline';
import DatamartService from '../../../../services/DatamartService';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../models/datamart/DatamartResource';

interface AccountIdCardProps {
  identifiers: IdentifiersProps;
  datamartId: string;
}

interface State {
  showMore: boolean;
  userAccountCompartments?: UserAccountCompartmentDatamartSelectionResource[];
}

type Props = AccountIdCardProps & InjectedIntlProps;

class AccountIdCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  componentDidMount() {
    const { datamartId } = this.props;
    DatamartService.getUserAccountCompartments(datamartId).then(resp => {
      this.setState({
        userAccountCompartments: resp.data,
      });
    });
  }

  renderCompartmentName = (compartmentId: string) => {
    const { userAccountCompartments } = this.state;
    if (userAccountCompartments) {
      const compartment = userAccountCompartments.find(
        c => c.compartment_id === compartmentId,
      );
      return compartment
        ? compartment.name
          ? compartment.name
          : compartment.token
            ? compartment.token
            : this.props.intl.formatMessage(messages.unknownCompartmentName)
        : '';
    }
    return '';
  };

  render() {
    const {
      identifiers,
      intl: { formatMessage },
    } = this.props;

    const handleShowMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };
    const userAccountsByCompartmentId = groupBy(
      identifiers.items.USER_ACCOUNT,
      'compartment_id',
    );
    return (
      <Card
        title={formatMessage(messages.accountTitle)}
        isLoading={identifiers.isLoading}
      >
        {userAccountsByCompartmentId ? (
          Object.keys(userAccountsByCompartmentId).map(key => {
            const userAccountsLength = userAccountsByCompartmentId[key].length;
            const compartmentName = this.renderCompartmentName(key);
            const accountsFormatted =
              userAccountsLength > 5 && !this.state.showMore
                ? userAccountsByCompartmentId[key].splice(0, 5)
                : userAccountsByCompartmentId[key];
            return (
              <Row gutter={10} key={key} className="table-line border-top">
                <div className="sub-title">{compartmentName}</div>
                {accountsFormatted &&
                  accountsFormatted.map(account => {
                    return (
                      <Tooltip
                        key={account.user_account_id}
                        placement="topRight"
                        title={account.user_account_id}
                      >
                        <Tag className="card-tag alone">
                          {account.user_account_id}
                        </Tag>{' '}
                      </Tooltip>
                    );
                  })}
                {userAccountsLength > 5 ? (
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
                {(accountsFormatted.length === 0 ||
                  identifiers.hasItems === false) && (
                  <span>
                    <FormattedMessage {...messages.emptyAccount} />
                  </span>
                )}
              </Row>
            );
          })
        ) : (
          <Spin />
        )}
      </Card>
    );
  }
}

export default injectIntl(AccountIdCard);
