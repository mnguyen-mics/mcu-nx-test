import * as React from 'react';
import { compose } from 'recompose';
import lodash from 'lodash';
import moment from 'moment';
import { HistoryEventShape, isHistoryUpdateEvent, isHistoryCreateEvent, isHistoryDeleteEvent } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import { Row, Icon } from 'antd';
import { Card } from '../../../components/Card';
import { ButtonStyleless } from '../../../components';
import messages from './messages';
import { FieldToMessageFormatMap } from './domain';

interface HistoryEventCardProps {
  events: HistoryEventShape[];
  messagesProps: FieldToMessageFormatMap;
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
  
  renderField = (field: string) => {
    const { messagesProps } = this.props;
    const fieldToSnakeCase = lodash.snakeCase(field);
    return messagesProps[fieldToSnakeCase]
      ? <span className="name"><FormattedMessage {...messagesProps[fieldToSnakeCase].message} /></span>
      : <span className="unknown-name"><FormattedMessage {...messages.unknownField} /></span>;
  }

  renderValue = (field: string, value: string) => {
    const { messagesProps } = this.props;
    const fieldToSnakeCase = lodash.snakeCase(field);

    return value
      ? <span className="value">
          {messagesProps[fieldToSnakeCase].formatValue(value)}
        </span>
      : <span className="empty-value"><FormattedMessage {...messages.noValue} /></span>;
  }

  // formatValue = (messagesProps: FieldToMessageFormatMap, fieldToSnakeCase: string, value: string) => {
  //   switch (messagesProps[fieldToSnakeCase].formattingFunction(value).type) {
  //     case 'STRING':
  //       return value;
  //     case 'INTEGER':
  //       return value;
  //     case 'FLOAT':
  //       return formatMetric(value, '0.00');
  //     case 'MESSAGE':
  //       return <FormattedMessage {...messagesProps[fieldToSnakeCase].formattingFunction(value).value}/>;
  //   }
  // }

  renderMultiEdit = (events: HistoryEventShape[]) => {
    return events.map(event => {
      return isHistoryUpdateEvent(event) &&
        <div className="mcs-fields-list-item">
          <FormattedMessage
            {...{...messages.fieldInMultiEditList, values: {
              field: this.renderField(event.field_changed),
              oldValue: this.renderValue(event.field_changed, event.old_value),
              newValue: this.renderValue(event.field_changed, event.new_value),
            }}}
          />
        </div>
    });
  }

  render() {
    const { events, messagesProps } = this.props;
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
            ? <Row>
                <div style={{float: 'left'}}>
                  <FormattedMessage
                    {...{...messages.severalFieldsEdited, values: {
                      userName: events[0].user_identification.user_name
                    }}}
                  />
                </div>
                <div className="section-cta">
                  <ButtonStyleless
                    onClick={toggleDetails}
                    className="mcs-card-inner-action"
                  >
                    {!showMore ? (
                      <span>
                        <FormattedMessage {...messages.expandEvents} />
                      </span>
                    ) : (
                      <span>
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
              </Row>
            : <div>
                {events.map(event => {
                  return isHistoryCreateEvent(event)
                    ? <div className="mcs-fields-list-item">
                        <FormattedMessage
                          {...{...messages.resourceCreated, values: {
                            userName: event.user_identification.user_name,
                            resourceName: <span className="name"><FormattedMessage {...messagesProps.historyResourceName.message} /></span>,
                          }}}
                        />
                      </div>
                    : isHistoryUpdateEvent(event)
                      ? <div className="mcs-fields-list-item">
                          <FormattedMessage
                            {...{...messages.singleFieldEdited, values: {
                              userName: event.user_identification.user_name,
                              field: this.renderField(event.field_changed),
                              oldValue: this.renderValue(event.field_changed, event.old_value),
                              newValue: this.renderValue(event.field_changed, event.new_value),
                            }}}
                          />
                        </div>
                      : isHistoryDeleteEvent(event) &&
                        <div>
                          <FormattedMessage
                            {...{...messages.resourceDeleted, values: {
                              userName: event.user_identification.user_name,
                              resourceName: <span className="name"><FormattedMessage {...messagesProps.historyResourceName.message} /></span>,
                            }}}
                          />
                        </div>
                })}
              </div>
          }
        </Row>
        <Row style={{padding: '15px 0px 0px', fontWeight: 'bold',}} className="timed-footer text-left">
          <span>
            <Icon type="clock-circle-o" style={{paddingRight: '5px'}}/> 
            <FormattedMessage
              {...{...messages.date, values: {
                day: moment(events[0].timestamp).format("Do"),
                month: moment(events[0].timestamp).format("MMMM"),
                time: moment(events[0].timestamp).format("HH:mm:ss"),
              }}}
            />
            {/* {moment(events[0].timestamp).format("MMMM Do [at] HH:mm:ss")} */}
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
