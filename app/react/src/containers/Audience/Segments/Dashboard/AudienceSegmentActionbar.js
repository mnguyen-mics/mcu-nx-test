import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import { withTranslations } from '../../../Helpers';

import * as AudienceSegmentActions from '../../../../state/Audience/Segments/actions';

import { getDefaultDatamart } from '../../../../state/Session/selectors';

function AudienceSegmentActionbar({
  match: {
    params: {
      organisationId,
      segmentId,
    },
  },
  segment,
  translations,
  defaultDatamart,
}) {

  const datamartId = defaultDatamart(organisationId).id;
  const breadcrumbPaths = [{
    key: translations.AUDIENCE_SEGMENTS,
    name: translations.AUDIENCE_SEGMENTS,
    url: `/v2/o/${organisationId}/audience/segments`,
  }, {
    key: segment.name,
    name: segment.name,
    url: `/v2/o/${organisationId}/audience/segments`,
  }];

  return (
    <Actionbar path={breadcrumbPaths}>
      <Link key="1" to={`/${organisationId}/campaigns/display/expert/edit/T1`}>
        <Button className="mcs-primary" type="primary">
          <McsIcons type="bolt" />
          <FormattedMessage id="ACTIVATE" />
        </Button>
      </Link>
      <Link key="2" to={`/o${organisationId}d${datamartId}/datamart/segments//${segmentId}`}>
        <Button>
          <McsIcons type="pen" />
          <FormattedMessage id="EDIT" />
        </Button>
      </Link>
    </Actionbar>
  );
}

AudienceSegmentActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.shape().isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  segment: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state),
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
});

const mapDispatchToProps = {
  createOverlapAnalysis: AudienceSegmentActions.createAudienceSegmentOverlap.request,
};

const ConnectedAudienceSegmentActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudienceSegmentActionbar);

export default compose(
  withTranslations,
  withRouter,
)(ConnectedAudienceSegmentActionbar);
