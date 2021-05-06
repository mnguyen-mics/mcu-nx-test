import * as React from 'react';
import { Row, Tooltip, Modal, Col, Button } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import moment from 'moment';
import { Card, McsIcon } from '@mediarithmics-private/mcs-components-library';
import messages from '../messages';
import { UserEmailIdentifierInfo } from '../../../../models/timeline/timeline';
import { TableViewWrapper } from '../../../../components/TableView';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { UserEmailIdentifierProviderResource } from '@mediarithmics-private/mcs-components-library/lib/models/timeline/timeline';

interface EmailCardProps {
  dataSource: UserEmailIdentifierInfo[];
  isLoading: boolean;
}

interface State {
  selectedAgent: UserEmailIdentifierInfo;
  showModal: boolean;
  showMore: boolean;
}

type Props = EmailCardProps & InjectedIntlProps;

class EmailCard extends React.Component<Props, State> {
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
        return <span>{text ? <McsIcon type='check' /> : <McsIcon type='close' />}</span>;
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

    const dataSource = selectedAgent.providers ? selectedAgent.providers : undefined;
    const columnsDefinitions: Array<DataColumnDefinition<UserEmailIdentifierProviderResource>> =
      selectedAgent.providers && selectedAgent.providers.length > 0
        ? Object.keys(selectedAgent.providers[0]).map(key => {
            const upperCaseKey: any = key.toUpperCase();
            return {
              title: formatMessage(messages[upperCaseKey]),
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
          width='70%'
          onOk={this.handleClose}
          onCancel={this.handleClose}
          footer={[
            <Button key='submit' type='primary' size='large' onClick={this.handleClose}>
              <FormattedMessage {...messages.okModalEmail} />
            </Button>,
          ]}
        >
          <Row gutter={10} className='table-line' style={{ display: 'block' }}>
            <Col span={24} className='title'>
              <FormattedMessage {...messages.emailInfo} />
            </Col>
            <Row>
              <Col className='table-left' span={12}>
                <FormattedMessage {...messages.emailAddress} />
              </Col>
              <Col className='table-right' span={12}>
                {selectedAgent.email}
              </Col>
            </Row>
            <Row>
              <Col className='table-left' span={12}>
                <FormattedMessage {...messages.emailHash} />
              </Col>
              <Col className='table-right' span={12}>
                {selectedAgent.hash}
              </Col>
            </Row>
            <Row>
              <Col className='table-left' span={12}>
                <FormattedMessage {...messages.emailCreation} />
              </Col>
              <Col className='table-right' span={12}>
                {moment(selectedAgent.creation_ts).format('YYYY-MM-DD HH:mm:ss')}
              </Col>
            </Row>
            <Row>
              <Col className='table-left' span={12}>
                <FormattedMessage {...messages.emailActivity} />
              </Col>
              <Col className='table-right' span={12}>
                {moment(selectedAgent.last_activity_ts).format('YYYY-MM-DD HH:mm:ss')}
              </Col>
            </Row>
          </Row>
          <Row style={{ display: 'block' }}>
            {selectedAgent.providers ? (
              <div>
                <Col span={24} className='title'>
                  <FormattedMessage {...messages.emailConsent} />
                </Col>
                <Col span={24}>
                  <TableViewWrapper
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
      dataSource,
      isLoading,
    } = this.props;

    const userAgents = dataSource || [];
    const accountsFormatted =
      userAgents.length > 5 && !this.state.showMore ? userAgents.splice(0, 5) : userAgents;
    const canViewMore = userAgents.length > 5 ? true : false;

    const handleModal = (agent: UserEmailIdentifierInfo) => () => {
      this.initModal(agent);
    };

    const handleShowMore = (visible: boolean) => () => {
      this.setState({ showMore: visible });
    };

    return (
      <Card
        title={formatMessage(messages.emailTitle)}
        isLoading={isLoading}
        className={'mcs-emailCard'}
      >
        {this.renderModal()}
        {accountsFormatted &&
          accountsFormatted.map(agent => {
            return (
              <div key={agent.email + agent.hash}>
                <Row gutter={10} className='table-line'>
                  <div className='mcs-icon-left'>
                    <McsIcon type='email' />
                  </div>
                  <div className='info-right'>
                    <div>
                      <Tooltip placement='topRight' title={agent.email}>
                        {agent.email}
                      </Tooltip>
                    </div>
                    <div>
                      <Tooltip placement='topRight' title={agent.hash}>
                        {agent.hash}
                      </Tooltip>
                    </div>
                  </div>
                </Row>
                <Row className='text-right' style={{ display: 'block' }}>
                  <button className='button-sm' onClick={handleModal(agent)}>
                    <FormattedMessage {...messages.viewMore} />
                  </button>
                </Row>
              </div>
            );
          })}
        {(accountsFormatted.length === 0 || dataSource.length === 0) && (
          <span>
            <FormattedMessage {...messages.emptyEmail} />
          </span>
        )}
        {canViewMore ? (
          !this.state.showMore ? (
            <div className='mcs-card-footer'>
              <button
                className='mcs-card-footer-link mcs-emailCard_viewMoreLink'
                onClick={handleShowMore(true)}
              >
                <FormattedMessage {...messages.viewMore} />
              </button>
            </div>
          ) : (
            <div className='mcs-card-footer'>
              <button
                className='mcs-card-footer-link mcs-emailCard_viewLessLink'
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
