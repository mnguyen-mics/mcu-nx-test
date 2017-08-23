import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { Actionbar } from '../../../Actionbar';
import McsIcons from '../../../../components/McsIcons';
import * as AudienceSegmentActions from '../../../../state/Audience/Segments/actions';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import ExportService from '../../../../services/ExportService';
import { getAudienceSegmentPerformance, getOverlapView } from '../../../../state/Audience/Segments/selectors';

import exportMessages from '../../../../common/messages/exportMessages';
import segmentMessages from './messages';

class AudienceSegmentActionbar extends Component {

  hideExportLoadingMsg = null;
  state = {
    overlapFetchIsRunning: false,
    overlap: undefined
  };

  doExport = () => {
    const {
      match: {
        params: { organisationId }
      },
      location: { search },
      defaultDatamart,
      segmentData,
      overlapView,
      intl
    } = this.props;

    const filter = parseSearch(search, null);
    this.setState({ exportIsRunning: false });
    this.hideExportLoadingMsg();
    const datamartId = defaultDatamart(organisationId).id;
    const overlapData = overlapView ? overlapView.data : [];
    // Overlap job may still be pending. In which case we dont include it in the export.
    ExportService.exportAudienceSegmentDashboard(organisationId, datamartId, segmentData, overlapData, filter, intl.formatMessage);
  };

  handleRunExport = () => {
    const {
      match: {
        params: {
          organisationId,
          segmentId
        }
      },
      intl: { formatMessage },
      defaultDatamart,
      exportAudienceSegmentDashboard
    } = this.props;

    const datamartId = defaultDatamart(organisationId).id;
    this.setState({ exportIsRunning: true });
    this.hideExportLoadingMsg = message.loading(formatMessage(exportMessages.exportInProgress), 0);
    exportAudienceSegmentDashboard({ segmentId: segmentId, organisationId: organisationId, datamartId: datamartId }, { export: this.doExport });
  };

  render() {
    const {
      match: {
        params: {
          organisationId,
          segmentId
        }
      },
      intl: { formatMessage },
      segment,
      defaultDatamart
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;
    const datamartId = defaultDatamart(organisationId).id;

    const breadcrumbPaths = [{
      key: formatMessage(segmentMessages.audienceSegment),
      name: formatMessage(segmentMessages.audienceSegment),
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
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          <McsIcons type="download" /><FormattedMessage id="EXPORT" />
        </Button>
        <Link key="2" to={`/o${organisationId}d${datamartId}/datamart/segments//${segmentId}`}>
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
  location: ReactRouterPropTypes.location.isRequired,
  match: PropTypes.shape().isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  segment: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  overlapView: PropTypes.shape({
    date: PropTypes.number.isRequired,
    data: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  segmentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  exportAudienceSegmentDashboard: PropTypes.func.isRequired,
  intl: intlShape.isRequired
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state),
  segment: state.audienceSegmentsTable.audienceSegmentsSingleApi.audienceSegment,
  overlapView: getOverlapView(state),
  segmentData: getAudienceSegmentPerformance(state)
});

const mapDispatchToProps = {
  createOverlapAnalysis: AudienceSegmentActions.createAudienceSegmentOverlap.request,
  exportAudienceSegmentDashboard: AudienceSegmentActions.exportAudienceSegmentDashboard.request
};

const ConnectedAudienceSegmentActionbar = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AudienceSegmentActionbar);

export default compose(
  withRouter,
  injectIntl
)(ConnectedAudienceSegmentActionbar);
