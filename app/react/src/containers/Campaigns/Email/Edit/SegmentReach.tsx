import * as React from 'react';
import { compose } from 'recompose';
import { FormattedMessage, FormattedNumber, FormattedPlural } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';

import EmailCampaignService from '../../../../services/EmailCampaignService';
import { EditEmailBlastRouteMatchParam } from './domain';

interface SegmentReachProps {
  segmentIds: string[];
  providerTechnicalNames: string[];
}

interface State {
  count: number;
}

interface MapStateProps {
  defaultDatamart: (organisationId: string) => { id: string };
}

type Props =
  SegmentReachProps &
  MapStateProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class SegmentReach extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }

  computeSegmentReach = (props: Props) => {
    const {
      match: { params: { organisationId }},
      defaultDatamart,
      segmentIds,
      providerTechnicalNames,
    } = props;

    const datamartId = defaultDatamart(organisationId).id;

    if (segmentIds && segmentIds.length > 0) {
      EmailCampaignService.computeSegmentReach(datamartId, segmentIds, providerTechnicalNames).then(count => {
        this.setState({ count: count });
      });
    } else {
      this.setState({ count: 0 });
    }
  }

  componentDidMount() {
    this.computeSegmentReach(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.computeSegmentReach(nextProps);
  }

  render() {

    const { count } = this.state;
    const { segmentIds, providerTechnicalNames } = this.props;

    if (segmentIds && segmentIds.length > 0) {

      if (providerTechnicalNames && providerTechnicalNames.length === 0) {
        return (
          <div className="segment-user-reach">
            <FormattedMessage id="missing-provider" defaultMessage="Please select a provider to have the potential reach number" />
          </div>
        );
      }

      if (count === 0) {
        return (
          <div className="segment-user-reach">
            <FormattedMessage id="potential-reach-zero" defaultMessage="There are no email to reach" />
          </div>
        );
      }

      return (
        <div className="segment-user-reach">
          <FormattedMessage id="potential-reach" defaultMessage="Potential Reach" />:
          <span className="reach-number"><FormattedNumber value={count} /></span>
          <FormattedPlural value={count} one="email" other="emails" />
        </div>
      );
    }

    return null;
  }
}

export default compose<Props, SegmentReachProps>(
  withRouter
)(SegmentReach);
