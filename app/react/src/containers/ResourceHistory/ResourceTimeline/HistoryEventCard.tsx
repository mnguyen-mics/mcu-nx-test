import * as React from 'react';
import { compose } from 'recompose';
import moment from 'moment';
import { HistoryEventShape, isHistoryUpdateEvent, isHistoryCreateEvent, isHistoryDeleteEvent } from '../../../models/resourceHistory/ResourceHistory';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { withRouter } from 'react-router';
import { Row, Icon } from 'antd';
import { Card } from '../../../components/Card';

interface HistoryEventCardProps {
  event: HistoryEventShape;
}

type Props = HistoryEventCardProps &
  InjectedIntlProps;

class HistoryEventCard extends React.Component<Props, any> {
  constructor(props: Props) {
    super(props);
  
  }


  render() {
    const { event } = this.props;


    return (
      <Card>
        <Row>
          { isHistoryCreateEvent(event)
            ? <div>{`${event.user_identification.user_name} created the Campaign.`}</div>
            : isHistoryUpdateEvent(event)
              ? <div>{`${event.user_identification.user_name} changed ${event.field_changed} from ${event.old_value} to ${event.new_value}`}</div>
              : isHistoryDeleteEvent(event)
                ? <div>{`${event.user_identification.user_name}`}</div>
                : <div/>
          }
        </Row>
        <Row className="border-top sm-footer timed-footer text-left">
          <span>
            <Icon type="clock-circle-o" /> {moment(event.timestamp).format("MMMM Do [at] HH:mm:ss")}
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
