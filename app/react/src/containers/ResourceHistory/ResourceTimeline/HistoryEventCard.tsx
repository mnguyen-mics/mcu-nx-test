import * as React from 'react';
import { compose } from 'recompose';
import moment from 'moment';
import { HistoryEventShape, isHistoryUpdateEvent, isHistoryCreateEvent, isHistoryDeleteEvent, ResourceName } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { Row, Icon, Col } from 'antd';
import { Card } from '../../../components/Card';
import { McsIcon, ButtonStyleless } from '../../../components';
import messages from './messages';

interface HistoryEventCardProps {
  events: HistoryEventShape[];
  resourceName: ResourceName;
}

type Props = HistoryEventCardProps &
  InjectedIntlProps;

  interface State {
    showMore: boolean;
  }

class HistoryEventCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      showMore: false,
    };
  }

  renderMultiEdit = (events: HistoryEventShape[]) => {
    return events.map(event => {
      return isHistoryUpdateEvent(event) &&
        <div className="mcs-fields-list-item">
          <span className="name">{event.field_changed} </span>
          from
          <span className="value"> {event.old_value} </span>
          to
          <span className="value"> {event.new_value}</span>
        </div>
    });
  }

  render() {
    const { events, resourceName } = this.props;
    const { showMore } = this.state;

    const toggleDetails = () => {
      this.setState({
        showMore: !this.state.showMore
      });
    };

    return (
      <Card>
        <Row className="section">
          {events.length > 1
            ? <Col>
              <div style={{float: 'left'}}>{`${events[0].user_identification.user_name} has edited several fields.`}</div>
              <div className="section-cta">
                <ButtonStyleless
                  onClick={toggleDetails}
                  className="mcs-card-inner-action"
                >
                  {!showMore ? (
                    <span>
                      <McsIcon type="chevron" />{' '}
                      <FormattedMessage {...messages.expandEvents} />
                    </span>
                  ) : (
                    <span>
                      <McsIcon className="icon-inverted" type="chevron" />{' '}
                      <FormattedMessage {...messages.reduceEvents} />
                    </span>
                  )}
                </ButtonStyleless>
              </div>
                {showMore && (
                  <div className="mcs-fields-list">
                    {this.renderMultiEdit(events)}
                  </div>
                )}
              </Col>
            : <div>
                {events.map(event => {
                  return isHistoryCreateEvent(event)
                    ? <div>{`${event.user_identification.user_name} created the ${resourceName}.`}</div>
                    : isHistoryUpdateEvent(event)
                      ? <div className="mcs-fields-list-item">
                          {`${event.user_identification.user_name} changed `}
                          <span className="name">{event.field_changed} </span>
                          from
                          <span className="value"> {event.old_value} </span>
                          to
                          <span className="value"> {event.new_value}</span>
                        </div>
                      : isHistoryDeleteEvent(event)
                        ? <div>{`${event.user_identification.user_name}`}</div>
                        : <div/>
                })}
              </div>
          }
        </Row>
        <Row className="border-top sm-footer timed-footer text-left">
          <span>
            <Icon type="clock-circle-o" /> {moment(events[0].timestamp).format("MMMM Do [at] HH:mm:ss")}
          </span>
        </Row>
      </Card>
    );
  }
}

export default compose<Props, HistoryEventCardProps>(
  injectIntl,
  withRouter
)(HistoryEventCard);
