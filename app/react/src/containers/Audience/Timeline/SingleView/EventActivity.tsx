import * as React from 'react';
import { Row, Col, Tag, Tooltip, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import McsIcon from '../../../../components/McsIcon';
import messages from '../messages';
import { ButtonStyleless } from '../../../../components';
import { UserActivityEventResource, AnyJson } from '../../../../models/datamart/UserActivityResource';

interface EventActivityProps {
  event: UserActivityEventResource;
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

  renderAnyJson = (json: AnyJson, isRoot = false): React.ReactNode => {
    let returnValue: React.ReactNode = '';
    if (!json && json !== 0 && json !== false) return (
      <i className="empty">
        <FormattedMessage {...messages.empty} />
      </i>
    );

    if (Array.isArray(json)) {
      if (json.length === 0) return '[]';      
      returnValue = json.map((o, i) => (
        <div className="m-b-10" key={i}>{this.renderAnyJson(o)}</div>
      )); 
    } else if (typeof json === 'string' || typeof json === 'number' || typeof json === 'boolean') {
      returnValue = (
        <span>
          <Tooltip title={json}>{typeof json === 'boolean' ? json.toString() : json}</Tooltip>
        </span>
      );
    } else {
      // json is a JsonMap (ie: {  [key: string]: AnyJson; })
      returnValue = Object.keys(json).map(key => {
        return (
          <div key={key}>
            <Tooltip title={key}>
              <Tag className="card-tag">{key}</Tag>
            </Tooltip>
            &nbsp;:&nbsp;
            {this.renderAnyJson(json[key])}
          </div>
        );
      });

      returnValue = isRoot ? (
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

    return isRoot ? <div className="event-properties-list-item">{returnValue}</div> : returnValue;
  };

  render() {
    const { event } = this.props;
    const { showMore } = this.state;

    const changeVisibility = () => this.setState({ showMore: !showMore });

    return (
      <Row className="section border-top">
        <Col className="section-ts" span={5}>
          {moment(event.$ts).format('HH:mm:ss')}
        </Col>
        <Col span={19}>
          <div className="section-title">{event.$event_name}</div>
          <div className="section-cta">
            { event.$properties && showMore ? 
              <div>
                <ButtonStyleless
                  onClick={this.handleJSONViewModal}
                  className="mcs-card-inner-action"
                  style={{ marginRight: '10px' }}
                >
                  <FormattedMessage {...messages.viewEventJson} />
                </ButtonStyleless>
                <button
                  className="mcs-card-inner-action"
                  onClick={changeVisibility}
                >
                  <McsIcon className="icon-inverted" type="chevron" />&nbsp;
                  <FormattedMessage {...messages.less} />
                </button>
              </div> : 
              <div>
                <button
                  className="mcs-card-inner-action"
                  onClick={changeVisibility}
                >
                  <McsIcon type="chevron" />&nbsp;
                  <FormattedMessage {...messages.detail} />
                </button>
              </div>
            }            
          </div>
        </Col>
        { event.$properties && showMore && (
          <div className="event-properties-list">
            {this.renderAnyJson(event.$properties, true)}
          </div>
        )}
      </Row>
    );
  }
}

export default injectIntl(EventActivity);
