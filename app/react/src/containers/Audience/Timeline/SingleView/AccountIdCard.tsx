import * as React from 'react';
import { groupBy, Dictionary } from 'lodash';
import { Tag, Tooltip, Row } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { Card } from '../../../../components/Card/index';
import messages from '../messages';
import DatamartService from '../../../../services/DatamartService';
import { UserAccountCompartmentDatamartSelectionResource, DatamartResource } from '../../../../models/datamart/DatamartResource';
import { UserAccountIdentifierInfo, isUserAccountIdentifier } from '../../../../models/timeline/timeline';
import UserDataService from '../../../../services/UserDataService';

interface AccountIdCardProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

interface State {
  showMore: boolean;
  userAccountCompartments?: UserAccountCompartmentDatamartSelectionResource[];
  userAccountsByCompartmentId?: Dictionary<UserAccountIdentifierInfo[]>;
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
    const {
      selectedDatamart,
      userPointId,
    } = this.props;

    this.fetchCompartments(selectedDatamart);

    this.fetchUserAccountsByCompartmentId(selectedDatamart, userPointId);

  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      selectedDatamart,
      userPointId
    } = this.props;

    const {
      selectedDatamart: nextSelectedDatamart,
      userPointId: nextUserPointId
    } = nextProps;

    if (selectedDatamart !== nextSelectedDatamart ||
      userPointId !== nextUserPointId) {
      this.fetchUserAccountsByCompartmentId(nextSelectedDatamart, nextUserPointId);
    }

    if (selectedDatamart !== nextSelectedDatamart) {
      this.fetchCompartments(nextSelectedDatamart);
    }
  }

  fetchCompartments = (datamart: DatamartResource) => {
    DatamartService.getUserAccountCompartments(datamart.id)
      .then(resp => {
        this.setState({
          userAccountCompartments: resp.data,
        });
      });
  };

  fetchUserAccountsByCompartmentId = (datamart: DatamartResource, userPointId: string) => {
    const identifierType = "user_point_id";

    UserDataService.getIdentifiers(
      datamart.organisation_id,
      datamart.id,
      identifierType,
      userPointId
    ).then(response => {
      const userAccountIdentifierInfos = response.data.filter(isUserAccountIdentifier);

      const userAccountsByCompartmentId = groupBy(
        userAccountIdentifierInfos,
        'compartment_id',
      );

      this.setState({
        userAccountsByCompartmentId: userAccountsByCompartmentId
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

    const {
      userAccountsByCompartmentId
    } = this.state;

    const handleShowMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };

    const isLoading = (userAccountsByCompartmentId === undefined);

    return (
      <Card
        title={formatMessage(messages.accountTitle)}
        isLoading={isLoading}
      >
        {userAccountsByCompartmentId ?
          Object.keys(userAccountsByCompartmentId).length === 0 ? (
            <span>
              <FormattedMessage {...messages.emptyAccount} />
            </span>
          ) : (
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
                  </Row>
                );
              })
            ) : (undefined)}
      </Card>
    );
  }
}

export default injectIntl(AccountIdCard);
