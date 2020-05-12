import * as React from 'react';
import { compose } from 'recompose';
import lodash from 'lodash';
import moment from 'moment';
import {
  HistoryEventShape,
  isHistoryUpdateEvent,
  isHistoryCreateEvent,
  isHistoryDeleteEvent,
  isHistoryCreateLinkEvent,
  ResourceType,
  ResourceLinkHelper,
  isHistoryLinkEvent,
  HistoryLinkEventResource,
  HistoryCreateLinkEventResource
} from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { Row, Icon } from 'antd';
import { Card } from '@mediarithmics-private/mcs-components-library';
import { ButtonStyleless } from '../../../components';
import messages from './messages';
import { FormatProperty } from './domain';

interface HistoryEventCardProps {
  resourceType: ResourceType;
  events: HistoryEventShape[];
  formatProperty: FormatProperty;
  resourceLinkHelper?: ResourceLinkHelper;
}

type Props = HistoryEventCardProps &
  InjectedIntlProps &
  RouteComponentProps<any>;

  interface State {
    showMore: boolean;
    resourceNames: {
      [resourceIdentifier: string]: React.ReactNode;
    };
  }

class HistoryEventCard extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    
    this.state = {
      showMore: false,
      resourceNames: {},
    };
    
    this.props.events.forEach(event => {
      if (isHistoryLinkEvent(event)) {
        this.state.resourceNames[this.generateResourceIdentifier(event)] = <FormattedMessage {...messages.fetchingData} />;
      };
    });
  };

  generateResourceIdentifier = (event: HistoryLinkEventResource) => {
    return event.resource_type + event.resource_id;
  }

  componentDidMount() {
    const { events, resourceLinkHelper } = this.props;

    events.forEach(event => {
      if (isHistoryLinkEvent(event)) {
        const resourceHelper = resourceLinkHelper && resourceLinkHelper[event.resource_type];
        if(resourceHelper) {
          resourceHelper.getName(event.resource_id)
            .then(name => {
              this.setState(prevState => {
                prevState.resourceNames[this.generateResourceIdentifier(event)] = name;
                return prevState;
              });
            })
            .catch(err => {
              this.setState(prevState => {
                prevState.resourceNames[this.generateResourceIdentifier(event)] = <FormattedMessage {...messages.deleted} />;
                return prevState;
              });
            });
        }
      }
    })
  }

  renderField = (field: string) => {
    const { formatProperty } = this.props;
    const fieldToSnakeCase = lodash.snakeCase(field);
    return <span className="name"> {
      formatProperty(fieldToSnakeCase).message
        ? <FormattedMessage {...formatProperty(fieldToSnakeCase).message} />
        : field
      } </span>;
  }

  renderValue = (field: string, value: string) => {
    const { formatProperty } = this.props;
    const fieldToSnakeCase = lodash.snakeCase(field);

    return value
      ? <span className="value">{formatProperty(fieldToSnakeCase, value).formattedValue || value}</span>
      : <span className="empty-value"><FormattedMessage {...messages.noValue}/></span>;
  }

  renderMultiEdit = (events: HistoryEventShape[], isCreationCard: boolean) => {
    return events.map(event => {
      return isHistoryUpdateEvent(event)
        ? <div className="mcs-fields-list-item">
          { isCreationCard
            ? <FormattedMessage {...{...messages.initialFieldValue, values: {
              field: this.renderField(event.field_changed),
              newValue: this.renderValue(event.field_changed, event.new_value),
            }}}/>
            : <FormattedMessage {...{...messages.fieldInMultiEditList, values: {
                field: this.renderField(event.field_changed),
                oldValue: this.renderValue(event.field_changed, event.old_value),
                newValue: this.renderValue(event.field_changed, event.new_value),
              }}}/>
          }
        </div>
        : isHistoryLinkEvent(event) &&
          <div className="mcs-fields-list-item">
            { this.renderLinkEventInMultiEdit(event, false) }
          </div>
    });
  }

  renderLinkEventInMultiEdit = (event: HistoryLinkEventResource, isCreationCard: boolean) => {
    const { resourceLinkHelper } = this.props;
    const { resourceNames } = this.state;

    const resourceHelper = resourceLinkHelper && resourceLinkHelper[event.resource_type];

    if(!resourceHelper)
      return;

    const goToResource = () => {
      resourceHelper.goToResource(event.resource_id)
    };

    // this is for when the componentDidMount already occurred and we have some new events (so only didUpdate is called).
    if (this.state.resourceNames[this.generateResourceIdentifier(event)] === undefined) {
      resourceHelper.getName(event.resource_id)
        .then(name => {
          this.setState(prevState => {
            prevState.resourceNames[this.generateResourceIdentifier(event)] = name;
            return prevState;
          });
        })
        .catch(err => {
          this.setState(prevState => {
            prevState.resourceNames[this.generateResourceIdentifier(event)] = <FormattedMessage {...messages.deleted} />;
            return prevState;
          });
        });
    }

    if (isCreationCard) {
      return (
        <FormattedMessage
        {...{...messages.parentLink, values: {
          parentType: <span className="name">{resourceHelper.getType()}</span>,
          parentName:
            <span className="value cursor-pointer" onClick={goToResource}>
              {resourceNames[this.generateResourceIdentifier(event)]}
            </span>
        }}} />
      )
    } else {
      const message = isHistoryCreateLinkEvent(event)
        ? resourceHelper.direction === 'CHILD'
          ? messages.childAddedMultiEditList
          : messages.parentAddedMultiEditList
        : resourceHelper.direction === 'CHILD'
          ? messages.childRemovedMultiEditList
          : messages.parentRemovedMultiEditList;

      return (
        <div className="mcs-fields-list-item">
          <FormattedMessage
            {...{...message, values: {
              linkedResource: <span className="name">{resourceHelper.getType()}</span>,
              value:
                <span className="value cursor-pointer" onClick={goToResource}>
                  {resourceNames[this.generateResourceIdentifier(event)]}
                </span>
            }}}
          />
        </div>
      );
    }
  }

  // Format a link event when it is the only event in the card.
  renderUniqueLinkEvent = (event: HistoryLinkEventResource) => {
    const { formatProperty, resourceLinkHelper } = this.props;
    const { resourceNames } = this.state;

    const resourceHelper = resourceLinkHelper && resourceLinkHelper[event.resource_type];

    if(!resourceHelper)
      return;

    const messageChild = isHistoryCreateLinkEvent(event) ? messages.resourceCreateLinkChild : messages.resourceDeleteLinkChild;
    const messageParent = isHistoryCreateLinkEvent(event) ? messages.resourceCreateLinkParent : messages.resourceDeleteLinkParent;
    const goToResource = () => {
      resourceHelper.goToResource(event.resource_id)
    };

    return (
      resourceHelper.direction === 'CHILD'
      ? <FormattedMessage
        {...{...messageChild, values: {
          userName: event.user_identification.user_name,
          resourceType: <span className="name">{resourceHelper.getType()}</span>,
          resourceName:
            <span className="value cursor-pointer" onClick={goToResource}>
              {resourceNames[this.generateResourceIdentifier(event)]}
            </span>
        }}}
      />
      : <FormattedMessage
        {...{...messageParent, values: {
          userName: event.user_identification.user_name,
          childResourceType: <span className="name"><FormattedMessage {...formatProperty('history_resource_type').message || messages.defaultResourceType} /></span>,
          parentResourceType:  <span className="name">{resourceHelper.getType()}</span>,
          parentResourceName:
            <span className="value cursor-pointer" onClick={goToResource}>
              {resourceNames[this.generateResourceIdentifier(event)]}
            </span>,
        }}}
      />
    );
  }

  findCreateEventIndex = (events: HistoryEventShape[]) => {
    return events.findIndex(event => isHistoryCreateEvent(event));
  }

  findCreateParentLinkEventIndex = (events: HistoryEventShape[]) => {
    const { resourceLinkHelper } = this.props;

    return events.findIndex(event => {
      const rHelper = isHistoryCreateLinkEvent(event) && resourceLinkHelper && resourceLinkHelper[event.resource_type];
      return !!rHelper && rHelper.direction === 'PARENT';
    });
  }

  render() {
    const { events, formatProperty } = this.props;
    const { showMore } = this.state;

    const toggleDetails = () => {
      this.setState({
        showMore: !this.state.showMore
      });
    };

    const createParentLinkEventIndex = this.findCreateParentLinkEventIndex(events);
    const createParentLinkEvent = events[createParentLinkEventIndex] as HistoryCreateLinkEventResource;

    return (
      <Card>
        <Row className="section">
          {events.length > 1
            ? <Row>
                <div style={{float: 'left'}} className="mcs-fields-list-item">
                  { this.findCreateEventIndex(events) > -1 // aka the events are related to the creation of the resource.
                    ? <FormattedMessage {...{...messages.resourceCreated, values: {
                      userName: events[0].user_identification.user_name,
                      resourceType: <span className="name"><FormattedMessage {...formatProperty('history_resource_type').message || messages.defaultResourceType} /></span>,
                      parentLink: createParentLinkEvent ? this.renderLinkEventInMultiEdit(createParentLinkEvent, true) : '',
                    }}} />
                    : <FormattedMessage {...{...messages.severalFieldsEdited, values: {
                      userName: events[0].user_identification.user_name
                    }}} />
                  }
                </div>
                <div className="section-cta">
                  <ButtonStyleless
                    onClick={toggleDetails}
                    className="mcs-card-inner-action"
                  >
                    {!showMore
                      ? <FormattedMessage {...messages.expandEvents} />
                      : <FormattedMessage {...messages.reduceEvents} />
                    }
                  </ButtonStyleless>
                </div>
                {showMore && (
                  <div className="mcs-fields-list">
                    {this.renderMultiEdit(
                      (createParentLinkEventIndex > -1
                        ? [ ...events.slice(0, createParentLinkEventIndex), ...events.slice(createParentLinkEventIndex + 1) ]
                        : events
                      ), this.findCreateEventIndex(events) > -1
                    )}
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
                            resourceType: <span className="name"><FormattedMessage {...formatProperty('history_resource_type').message || messages.defaultResourceType} /></span>,
                            parentLink: '',  // we only have one *create* event, so there can't be any parent link here : it would require also a link event.
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
                      : isHistoryDeleteEvent(event)
                        ? <div className="mcs-fields-list-item">
                            <FormattedMessage
                              {...{...messages.resourceDeleted, values: {
                                userName: event.user_identification.user_name,
                                resourceType: <span className="name"><FormattedMessage {...formatProperty('history_resource_type').message || messages.defaultResourceType} /></span>,
                              }}}
                            />
                          </div>
                        : isHistoryLinkEvent(event) &&
                          <div className="mcs-fields-list-item">
                            { this.renderUniqueLinkEvent(event) }
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
