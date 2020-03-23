import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { EditEmailBlastRouteMatchParam } from './domain';
import { formatMetric } from '../../../../utils/MetricHelper';
import { MicsReduxState } from '../../../../utils/ReduxHelper';
import { lazyInject } from '../../../../config/inversify.config';
import { IEmailCampaignService } from '../../../../services/EmailCampaignService';
import { TYPES } from '../../../../constants/types';

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

type Props = SegmentReachProps &
  MapStateProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class SegmentReach extends React.Component<Props, State> {

  @lazyInject(TYPES.IEmailCampaignService)
  private _emailCampaignService: IEmailCampaignService;

  constructor(props: Props) {
    super(props);
    this.state = { count: 0 };
  }

  computeSegmentReach = (props: Props) => {
    const {
      match: {
        params: { organisationId },
      },
      defaultDatamart,
      segmentIds,
      providerTechnicalNames,
    } = props;

    const datamartId = defaultDatamart(organisationId).id;

    if (segmentIds && segmentIds.length > 0) {
      this._emailCampaignService.computeSegmentReach(
        datamartId,
        segmentIds,
        providerTechnicalNames,
      ).then(count => {
        this.setState({ count: count });
      });
    } else {
      this.setState({ count: 0 });
    }
  };

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
            <FormattedMessage
              id="email.campaign.edit.segmentReach.missing-provider"
              defaultMessage="Please select a provider to have the potential reach number"
            />
          </div>
        );
      }

      if (count === 0) {
        return (
          <div className="segment-user-reach">
            <FormattedMessage
              id="email.campaign.edit.segmentReach.potential-reach-zero"
              defaultMessage="There are no email to reach"
            />
          </div>
        );
      }

      return (
        <div className="segment-user-reach">
          <FormattedMessage
            id="email.campaign.edit.segmentReach.potential-reach"
            defaultMessage={`Potential Reach: {emailCountLabeled} 
              { emailCount, plural, one { email } other { emails }} `}
            values={{
              emailCountLabeled: (
                <span className="reach-number">
                  {formatMetric(count, '0,00')}
                </span>
              ),
              emailCount: count,
            }}
          />
        </div>
      );
    }

    return null;
  }
}

export default compose<Props, SegmentReachProps>(
  withRouter,
  connect((state: MicsReduxState) => ({
    defaultDatamart: getDefaultDatamart(state),
  })),
)(SegmentReach);
