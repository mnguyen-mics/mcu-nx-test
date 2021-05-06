import * as React from 'react';
import { Row, Col, Modal } from 'antd';
import moment from 'moment';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
import messages from '../messages';
import { Button, McsIcon } from '@mediarithmics-private/mcs-components-library';
import { UserActivityEventResource } from '../../../../models/datamart/UserActivityResource';
import CustomObjectRendererWrapper, {
  RenderingTemplates,
} from '../../../../components/CustomObjectRendererWrapper';

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
        <SyntaxHighlighter language='json' style={docco}>
          {JSON.stringify(event, undefined, 4)}
        </SyntaxHighlighter>
      ),
      onOk() {
        //
      },
    });
  };

  render() {
    const { event } = this.props;
    const { showMore } = this.state;

    const renderingTemplates: RenderingTemplates = {
      absoluteTemplates: {},
      relativeTemplates: {},
    };

    const changeVisibility = () => this.setState({ showMore: !showMore });

    return (
      <Row className='section border-top'>
        <Col className='section-ts' span={5}>
          {moment(event.$ts).format('HH:mm:ss')}
        </Col>
        <Col span={19}>
          <div className='section-title'>{event.$event_name}</div>
          <div className='section-cta'>
            {event.$properties && showMore ? (
              <div>
                <Button
                  onClick={this.handleJSONViewModal}
                  className='mcs-card-inner-action'
                  style={{ marginRight: '10px' }}
                >
                  <FormattedMessage {...messages.viewEventJson} />
                </Button>
                <button className='mcs-card-inner-action' onClick={changeVisibility}>
                  <McsIcon className='mcs-icon-inverted' type='chevron' />
                  &nbsp;
                  <FormattedMessage {...messages.less} />
                </button>
              </div>
            ) : (
              <div>
                <button className='mcs-card-inner-action' onClick={changeVisibility}>
                  <McsIcon type='chevron' />
                  &nbsp;
                  <FormattedMessage {...messages.detail} />
                </button>
              </div>
            )}
          </div>
        </Col>
        {event.$properties && showMore && (
          <div className='event-properties-list'>
            <CustomObjectRendererWrapper
              customObject={event.$properties}
              customRenderingTemplates={renderingTemplates}
            />
          </div>
        )}
      </Row>
    );
  }
}

export default injectIntl(EventActivity);
