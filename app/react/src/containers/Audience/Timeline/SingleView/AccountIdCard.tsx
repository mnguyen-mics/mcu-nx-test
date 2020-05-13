import * as React from 'react';
import { Dictionary } from 'lodash';
import { Tag, Tooltip, Row } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '@mediarithmics-private/mcs-components-library';
import messages from '../messages';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../models/datamart/DatamartResource';
import { UserAccountIdentifierInfo } from '../../../../models/timeline/timeline';

interface AccountIdCardProps {
  userAccountCompartments: UserAccountCompartmentDatamartSelectionResource[];
  userAccountsByCompartmentId: Dictionary<UserAccountIdentifierInfo[]>;
  isLoading: boolean;
}

interface State {
  expandedItems: string[];
  showMore: boolean;
}

type Props = AccountIdCardProps & InjectedIntlProps;

class AccountIdCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      expandedItems: [],
      showMore: false,
    };
  }

  renderCompartmentName = (compartmentId: string) => {
    const { userAccountCompartments } = this.props;
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
      intl: { formatMessage },
    } = this.props;

    const { userAccountsByCompartmentId } = this.props;

    const handleShowMore = (expandedItemsKey: string) => () => {
      this.setState(state => {
        let expandedItems;
        if (state.expandedItems.indexOf(expandedItemsKey) === -1) {
          expandedItems = [...state.expandedItems, expandedItemsKey];
        } else {
          expandedItems = state.expandedItems.filter(
            e => e !== expandedItemsKey,
          );
        }
        return {
          expandedItems,
        };
      });
    };

    const isLoading = userAccountsByCompartmentId === undefined;

    return (
      <Card title={formatMessage(messages.accountTitle)} isLoading={isLoading}  className={"mcs-accountIdCard"}>
        {userAccountsByCompartmentId ? (
          Object.keys(userAccountsByCompartmentId).length === 0 ? (
            <span>
              <FormattedMessage {...messages.emptyAccount} />
            </span>
          ) : (
            Object.keys(userAccountsByCompartmentId).map(key => {
              const userAccountsLength =
                userAccountsByCompartmentId[key].length;
              const compartmentName = this.renderCompartmentName(key);
              const userAccountsByCompartmentIdCopy = userAccountsByCompartmentId[
                key
              ].slice();
              const accountsFormatted =
                userAccountsLength > 5 &&
                !this.state.expandedItems.find(e => e === key)
                  ? userAccountsByCompartmentIdCopy.splice(0, 5)
                  : userAccountsByCompartmentId[key];
              return (
                <Row gutter={10} key={key} className="table-line border-top">
                  <div className="sub-title">{compartmentName}</div>
                  {accountsFormatted.map(account => {
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
                    !this.state.expandedItems.find(e => e === key) ? (
                      <div className="mcs-card-footer">
                        <button
                          className="mcs-card-footer-link mcs-accountIdCard_viewMoreLink"
                          onClick={handleShowMore(key)}
                        >
                          <FormattedMessage {...messages.viewMore} />
                        </button>
                      </div>
                    ) : (
                      <div className="mcs-card-footer">
                        <button
                          className="mcs-card-footer-link mcs-accountIdCard_viewLessLink"
                          onClick={handleShowMore(key)}
                        >
                          <FormattedMessage {...messages.viewLess} />
                        </button>
                      </div>
                    )
                  ) : null}
                </Row>
              );
            })
          )
        ) : (
          undefined
        )}
      </Card>
    );
  }
}

export default injectIntl(AccountIdCard);
