import * as React from 'react';
import { Row, Col, Tag, Tooltip, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import McsIcon from '../../../../components/McsIcon';
import messages from '../messages';
import { ButtonStyleless } from '../../../../components';

interface EventActivityProps {
  event: {
    $event_name: string;
    $properties: object;
    $ts: number;
  };
}

interface State {
  showMore: boolean;
}

type Props = EventActivityProps & InjectedIntlProps;

class EventActivity extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  handleJSONViewModal = () => {
    const { event, intl } = this.props;
    Modal.info({
      title: intl.formatMessage(messages.eventJson),
      okText: intl.formatMessage(messages.eventJsonModalOkText),
      width: '650px',
      content: (
        <SyntaxHighlighter language="json" style={docco}>
          {JSON.stringify(event, undefined, 4)}
        </SyntaxHighlighter>
      ),
      onOk() {
        //
      },
    });
  };

  renderProperties = (object: any, isInitial = false) => {
    let returnValue: any = <div />;

    if (typeof object === 'string' || typeof object === 'number') {
      returnValue = (
        <span>
          <Tooltip title={object}>{object}</Tooltip>
        </span>
      );
    }

    if (Array.isArray(object)) {
      if (object.length > 0) {
        returnValue = object.map(o => (
          <div className="m-b-10">{this.renderProperties(o)}</div>
        ));
      } else {
        returnValue = '[]';
      }
    }

    if (typeof object === 'object' && !Array.isArray(object)) {
      returnValue = Object.keys(object).map(key => {
        const value = object[key];
        const generatedValue = (
          <div>
            <Tooltip title={key}>
              <Tag className="card-tag">{key}</Tag>
            </Tooltip>
            &nbsp;:&nbsp;
            {!value ? (
              <i className="empty">
                <FormattedMessage {...messages.empty} />
              </i>
            ) : (
              this.renderProperties(value)
            )}
          </div>
        );
        return generatedValue;
      });
      returnValue = isInitial ? (
        <div>{returnValue}</div>
      ) : (
        <Col
          className="event-properties-sublist"
          span={24}
          style={{ marginLeft: '40px', marginTop: 10, marginRight: '40px' }}
        >
          {returnValue}
        </Col>
      );
    }

    return isInitial ? (
      <div className="event-properties-list-item">{returnValue}</div>
    ) : (
      returnValue
    );
  };

  render() {
    const { event } = this.props;
    const { showMore } = this.state;

    const changeVisibility = () => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.showMore = !showMore;
        return nextState;
      });
    };

    return (
      <Row className="section border-top">
        <Col className="section-ts" span={5}>
          {moment(event.$ts).format('HH:mm:ss')}
        </Col>
        <Col span={19}>
          <div className="section-title">{event.$event_name}</div>
          <div className="section-cta">
            {showMore && (
              <ButtonStyleless
                onClick={this.handleJSONViewModal}
                className="mcs-card-inner-action"
                style={{ marginRight: '10px' }}
              >
                <FormattedMessage {...messages.viewEventJson} />
              </ButtonStyleless>
            )}
            {Object.keys(event.$properties).length !== 0 && (
              <button
                className="mcs-card-inner-action"
                onClick={changeVisibility}
              >
                {!showMore ? (
                  <span>
                    <McsIcon type="chevron" />{' '}
                    <FormattedMessage {...messages.detail} />
                  </span>
                ) : (
                  <span>
                    <McsIcon className="icon-inverted" type="chevron" />{' '}
                    <FormattedMessage {...messages.less} />
                  </span>
                )}
              </button>
            )}
          </div>
        </Col>
        {showMore && (
          <div className="event-properties-list">
            {this.renderProperties(event.$properties, true)}
          </div>
        )}
      </Row>
    );
  }
}

export default injectIntl(EventActivity);
