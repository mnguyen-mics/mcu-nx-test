import * as React from 'react';
import { Row, Tooltip, Modal, Col, Button } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import { Card } from '../../../../components/Card/index';
import McsIcon from '../../../../components/McsIcon';
import { TableView } from '../../../../components/TableView/index';
import messages from '../messages';
import {
  UserEmailIdentifierInfo,
  isUserEmailIdentifier,
} from '../../../../models/timeline/timeline';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import { IUserDataService } from '../../../../services/UserDataService';

interface EmailCardProps {
  selectedDatamart: DatamartResource;
  userPointId: string;
}

interface State {
  selectedAgent: UserEmailIdentifierInfo;
  showModal: boolean;
  showMore: boolean;
  userEmailsIdentifierInfo?: UserEmailIdentifierInfo[];
  hasItems?: boolean;
}

type Props = EmailCardProps & InjectedIntlProps;

class EmailCard extends React.Component<Props, State> {
  @lazyInject(TYPES.IUserDataService)
  private _userDataService: IUserDataService;

  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
      showModal: false,
      selectedAgent: {
        providers: [],
        hash: '',
        creation_ts: 0,
        last_activity_ts: 0,
        type: 'USER_EMAIL',
      },
    };
  }

  componentDidMount() {
    const { selectedDatamart, userPointId } = this.props;

    this.fetchUserEmails(selectedDatamart, userPointId);
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
      this.fetchUserEmails(nextSelectedDatamart, nextUserPointId);
    }
  }

  fetchUserEmails = (datamart: DatamartResource, userPointId: string) => {
    const identifierType = 'user_point_id';

    this._userDataService
      .getIdentifiers(
        datamart.organisation_id,
        datamart.id,
        identifierType,
        userPointId,
      )
      .then(response => {
        const userEmailsIdentifierInfo = response.data.filter(
          isUserEmailIdentifier,
        );

        const hasItems = Object.keys(response.data).length > 0;

        this.setState({
          userEmailsIdentifierInfo: userEmailsIdentifierInfo,
          hasItems: hasItems,
        });
      });
  };

  renderModal = () => {
    const { selectedAgent, showModal } = this.state;

    const {
      intl: { formatMessage },
    } = this.props;

    const renderTableCell = (key: string, text: string) => {
      if (key.indexOf('_ts') > -1) {
        if (text !== null) {
          return <span>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>;
        }
        return (
          <span>
            <i>
              <FormattedMessage {...messages.nullEmail} />
            </i>
          </span>
        );
      }
      if (typeof text === 'boolean') {
        return (
          <span>
            {text ? <McsIcon type="check" /> : <McsIcon type="close" />}
          </span>
        );
      }
      return (
        <span>
          {text ? (
            text
          ) : (
            <i>
              <FormattedMessage {...messages.nullEmail} />
            </i>
          )}
        </span>
      );
    };

    const dataSource = selectedAgent.providers
      ? selectedAgent.providers
      : undefined;
    const columnsDefinitions =
      selectedAgent.providers && selectedAgent.providers.length > 0
        ? Object.keys(selectedAgent.providers[0]).map(key => {
            const upperCaseKey: any = key.toUpperCase();
            return {
              intlMessage: messages[upperCaseKey],
              key: key,
              isHiddable: false,
              render: (text: string) => renderTableCell(key, text),
            };
          })
        : [];
    return (
      showModal && (
        <Modal
          title={formatMessage(messages.titleModalEmail)}
          visible={showModal}
          width="70%"
          onOk={this.handleClose}
          onCancel={this.handleClose}
          footer={[
            <Button
              key="submit"
              type="primary"
              size="large"
              onClick={this.handleClose}
            >
              <FormattedMessage {...messages.okModalEmail} />
            </Button>,
          ]}
        >
          <Row gutter={10} className="table-line">
            <Col span={24} className="title">
              <FormattedMessage {...messages.emailInfo} />
            </Col>
            <Col className="table-left" span={12}>
              <FormattedMessage {...messages.emailAddress} />
            </Col>
            <Col className="table-right" span={12}>
              {selectedAgent.email}
            </Col>
            <Col className="table-left" span={12}>
              <FormattedMessage {...messages.emailHash} />
            </Col>
            <Col className="table-right" span={12}>
              {selectedAgent.hash}
            </Col>
            <Col className="table-left" span={12}>
              <FormattedMessage {...messages.emailCreation} />
            </Col>
            <Col className="table-right" span={12}>
              {moment(selectedAgent.creation_ts).format('YYYY-MM-DD HH:mm:ss')}
            </Col>
            <Col className="table-left" span={12}>
              <FormattedMessage {...messages.emailActivity} />
            </Col>
            <Col className="table-right" span={12}>
              {moment(selectedAgent.last_activity_ts).format(
                'YYYY-MM-DD HH:mm:ss',
              )}
            </Col>
          </Row>
          <Row>
            {selectedAgent.providers ? (
              <div>
                <Col span={24} className="title">
                  <FormattedMessage {...messages.emailConsent} />
                </Col>
                <Col span={24}>
                  <TableView
                    dataSource={dataSource}
                    columns={columnsDefinitions}
                    loading={false}
                  />
                </Col>
              </div>
            ) : null}
          </Row>
        </Modal>
      )
    );
  };

  initModal = (selectedAgent: UserEmailIdentifierInfo) => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
        selectedAgent: {
          ...selectedAgent,
        },
      };
      nextState.showModal = true;
      return nextState;
    });
  };

  handleClose = () => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.showModal = false;
      return nextState;
    });
  };

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const { userEmailsIdentifierInfo, hasItems } = this.state;

    const userAgents = userEmailsIdentifierInfo || [];
    const accountsFormatted =
      userAgents.length > 5 && !this.state.showMore
        ? userAgents.splice(0, 5)
        : userAgents;
    const canViewMore = userAgents.length > 5 ? true : false;

    const handleModal = (agent: UserEmailIdentifierInfo) => () => {
      this.initModal(agent);
    };

    const handleShowMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };

    const isLoading =
      userEmailsIdentifierInfo === undefined || hasItems === undefined;

    return (
      <Card title={formatMessage(messages.emailTitle)} isLoading={isLoading}>
        {this.renderModal()}
        {accountsFormatted &&
          accountsFormatted.map(agent => {
            return (
              <div key={agent.email + agent.hash}>
                <Row gutter={10} className="table-line">
                  <div className="icon-left">
                    <McsIcon type="email" />
                  </div>
                  <div className="info-right">
                    <div>
                      <Tooltip placement="topRight" title={agent.email}>
                        {agent.email}
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip placement="topRight" title={agent.hash}>
                        {agent.hash}
                      </Tooltip>
                    </div>
                  </div>
                </Row>
                <Row className="text-right">
                  <button className="button-sm" onClick={handleModal(agent)}>
                    <FormattedMessage {...messages.viewMore} />
                  </button>
                </Row>
              </div>
            );
          })}
        {(accountsFormatted.length === 0 || hasItems === false) && (
          <span>
            <FormattedMessage {...messages.emptyEmail} />
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

export default injectIntl(EmailCard);
