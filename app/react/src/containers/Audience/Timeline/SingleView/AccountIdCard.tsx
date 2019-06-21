import * as React from 'react';
import { groupBy, Dictionary } from 'lodash';
import { Tag, Tooltip, Row } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '../../../../components/Card/index';
import messages from '../messages';
import DatamartService from '../../../../services/DatamartService';
import {
  UserAccountCompartmentDatamartSelectionResource,
  DatamartResource,
} from '../../../../models/datamart/DatamartResource';
import {
  UserAccountIdentifierInfo,
  isUserAccountIdentifier,
} from '../../../../models/timeline/timeline';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IUserDataService } from '../../../../services/UserDataService';

interface AccountIdCardProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

interface State {
  expandedItems: string[];
  userAccountCompartments?: UserAccountCompartmentDatamartSelectionResource[];
  userAccountsByCompartmentId?: Dictionary<UserAccountIdentifierInfo[]>;
}

type Props = AccountIdCardProps & InjectedIntlProps;

class AccountIdCard extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  constructor(props: Props) {
    super(props);
    this.state = {
      expandedItems: []
    };
  }

  componentDidMount() {
    const { selectedDatamart, userPointId } = this.props;

    this.fetchCompartments(selectedDatamart);

    this.fetchUserAccountsByCompartmentId(selectedDatamart, userPointId);
  }

  componentWillReceiveProps(nextProps: Props) {
    const { selectedDatamart, userPointId } = this.props;

    const {
      selectedDatamart: nextSelectedDatamart,
      userPointId: nextUserPointId,
    } = nextProps;

    if (
      selectedDatamart !== nextSelectedDatamart ||
      userPointId !== nextUserPointId
    ) {
      this.fetchUserAccountsByCompartmentId(
        nextSelectedDatamart,
        nextUserPointId,
      );
    }

    if (selectedDatamart !== nextSelectedDatamart) {
      this.fetchCompartments(nextSelectedDatamart);
    }
  }

  fetchCompartments = (datamart: DatamartResource) => {
    DatamartService.getUserAccountCompartments(datamart.id).then(resp => {
      this.setState({
        userAccountCompartments: resp.data,
      });
    });
  };

  fetchUserAccountsByCompartmentId = (
    datamart: DatamartResource,
    userPointId: string,
  ) => {
    const identifierType = 'user_point_id';

    this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userAccountIdentifierInfos = response.data.filter(
          isUserAccountIdentifier,
        );

        const userAccountsByCompartmentId = groupBy(
          userAccountIdentifierInfos,
          'compartment_id',
        );

        this.setState({
          userAccountsByCompartmentId: userAccountsByCompartmentId,
        });
      });
  };

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
      intl: { formatMessage },
    } = this.props;

    const { userAccountsByCompartmentId } = this.state;

    const handleShowMore = (expandedItemsKey: string) => () => {

      this.setState(state => {
        let expandedItems;
        if (state.expandedItems.indexOf(expandedItemsKey) === -1) {
          expandedItems = [...state.expandedItems, expandedItemsKey];
        } else {
          expandedItems = state.expandedItems.filter((e) => e !== expandedItemsKey)
        }   
        return {
          expandedItems
        };
      });
    };

    const isLoading = userAccountsByCompartmentId === undefined;

    return (
      <Card title={formatMessage(messages.accountTitle)} isLoading={isLoading}>
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
              const userAccountsByCompartmentIdCopy = userAccountsByCompartmentId[key].slice();
              const accountsFormatted =
                userAccountsLength > 5 && !this.state.expandedItems.find((e) => e === key)
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
                    !this.state.expandedItems.find((e) => e === key) ? (
                      <div className="mcs-card-footer">
                        <button
                          className="mcs-card-footer-link"
                          onClick={handleShowMore(key)}
                        >
                          <FormattedMessage {...messages.viewMore} />
                        </button>
                      </div>
                    ) : (
                      <div className="mcs-card-footer">
                        <button
                          className="mcs-card-footer-link"
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
