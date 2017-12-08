import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { FormattedMessage, FormattedNumber, FormattedPlural } from 'react-intl';

import { withMcsRouter } from '../../../Helpers';
import EmailCampaignService from '../../../../services/EmailCampaignService.ts';
import { getDefaultDatamart } from '../../../../state/Session/selectors';

class SegmentReach extends Component {

  state = {
    loading: false,
    hasLoaded: false,
    count: 0
  }

  computeSegmentReach = (props) => {
    const {
      organisationId,
      defaultDatamart,
      segmentIds,
      providerTechnicalNames
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

  componentWillReceiveProps(nextProps) {
    this.computeSegmentReach(nextProps);
  }

  render() {

    const {
      count
    } = this.state;

    const {
      segmentIds,
      providerTechnicalNames
    } = this.props;

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
          <FormattedMessage id="potential-reach" defaultMessage="Potential Reach" />: <span className="reach-number"><FormattedNumber value={count} /></span> <FormattedPlural value={count} one="email" other="emails" />
        </div>
      );
    }

    return null;
  }
}

SegmentReach.propTypes = {
  organisationId: PropTypes.string.isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  segmentIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  providerTechnicalNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default compose(
  withMcsRouter,
  connect(
    state => ({
      defaultDatamart: getDefaultDatamart(state),
    }),
  ),
)(SegmentReach);
