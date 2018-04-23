import * as React from 'react';
import { Row, Col, Tag, Tooltip } from 'antd';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';

import McsIcon from '../../../../components/McsIcon';
import messages from '../messages';

interface EventActivityProps {
  event: {
    $event_name: string;
    $properties: object; // type it better
    $ts: number;
  };
}

interface State {
  showMore: boolean;
}

class EventActivity extends React.Component<EventActivityProps, State> {
  constructor(props: EventActivityProps) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  renderProperties = (object: any, isInitial = false) => {
    let returnValue: any = <div />;

    if (typeof object === 'string' || typeof object === 'number') {
      // string;
      returnValue = (
        <span>
          <Tooltip title={object}>{object}</Tooltip>
        </span>
      );
    }

    if (Array.isArray(object)) {
      // array;
      if (object.length > 0) {
        returnValue = object.map(o => (
          <div className="m-b-10">{this.renderProperties(o)}</div>
        ));
      } else {
        returnValue = '[]';
      }
    }

    if (typeof object === 'object' && !Array.isArray(object)) {
      // object;
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

    const changeVisibility = () => {
      this.setState(prevState => {
        const nextState = {
          ...prevState,
        };
        nextState.showMore = !this.state.showMore;
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
            {Object.keys(event.$properties).length !== 0 ? (
              <button
                className="mcs-card-inner-action"
                onClick={changeVisibility}
              >
                {' '}
                {!this.state.showMore ? (
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
            ) : null}
          </div>
        </Col>
        {this.state.showMore === true ? (
          <div className="event-properties-list">
            {this.renderProperties(event.$properties, true)}
          </div>
        ) : null}
      </Row>
    );
  }
}

export default EventActivity;
