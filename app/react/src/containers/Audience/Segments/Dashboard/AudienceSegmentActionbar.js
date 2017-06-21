import React, { Component, PropTypes } from 'react';
import { Button, Dropdown, Icon, Menu, Modal } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import { McsIcons } from '../../../../components/McsIcons';
import { withTranslations } from '../../../Helpers';

import { getDefaultDatamart } from '../../../../state/Session/selectors';

class AudienceSegmentActionbar extends Component {

  render() {

    const {
      match: {
        params: {
          organisationId,
          segmentId
        }
      },
      segment,
      translations,
      defaultDatamart
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;

    const breadcrumbPaths = [{
      key: translations.AUDIENCE_SEGMENTS,
      name: translations.AUDIENCE_SEGMENTS,
      url: `/v2/o/${organisationId}/audience/segments`
    }, {
      key: segment.name,
      name: segment.name,
      url: `/v2/o/${organisationId}/audience/segments`
    }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Link to={`/${organisationId}/campaigns/display/expert/edit/T1`}>
          <Button className="mcs-primary" type="primary">
            <McsIcons type="bolt" />
            <FormattedMessage id="ACTIVATE" />
          </Button>
        </Link>
        <Link to={`/o${organisationId}d${datamartId}/datamart/segments//${segmentId}`}>
          <Button>
            <McsIcons type="pen" />
            <FormattedMessage id="EDIT" />
          </Button>
        </Link>
      </Actionbar>
    );

  }

}

AudienceSegmentActionbar.propTypes = {
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  defaultDatamart: PropTypes.func.isRequired,
  segment: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

const mapStateToProps = (state, ownProps) => ({
  defaultDatamart: getDefaultDatamart(state),
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment
});

AudienceSegmentActionbar = connect(
  mapStateToProps
)(AudienceSegmentActionbar);

AudienceSegmentActionbar = compose(
  withTranslations,
  withRouter,
)(AudienceSegmentActionbar);

export default AudienceSegmentActionbar;
