import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, message } from 'antd';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import injectNotifications from '../../../Notifications/injectNotifications.ts';
import { ReactRouterPropTypes } from '../../../../validators/proptypes';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon.tsx';
import * as AudienceSegmentActions from '../../../../state/Audience/Segments/actions';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import ExportService from '../../../../services/ExportService';
import { getAudienceSegmentPerformance, getOverlapView } from '../../../../state/Audience/Segments/selectors';
import AudienceSegmentService from '../../../../services/AudienceSegmentService.ts';

import exportMessages from '../../../../common/messages/exportMessages';
import segmentMessages from './messages';

class AudienceSegmentActionbar extends Component {

  hideExportLoadingMsg = null;
  state = {
    overlapFetchIsRunning: false,
    overlap: undefined,
    segment: {},
  };

  componentDidMount() {
    const {
      match: {
        params: {
          segmentId
        }
      }
    } = this.props;

    if (segmentId) {
      AudienceSegmentService
        .getSegment(segmentId)
        .then(response =>

          this.setState(prevStat => {
            const newStat = {
              ...prevStat,
            };
            newStat.segment = response.data;
            return newStat;
          })
        ).catch(err => {
          this.props.notifyError(err);
        });
    }
  }


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

    const {
      segment
    } = this.state;

    const filter = parseSearch(search, null);
    this.setState({ exportIsRunning: false });
    this.hideExportLoadingMsg();
    const datamartId = defaultDatamart(organisationId).id;
    const overlapData = overlapView ? overlapView.data : [];

    // Overlap job may still be pending. In which case we dont include it in the export.
    ExportService.exportAudienceSegmentDashboard(organisationId, datamartId, segmentData, overlapData, filter, intl.formatMessage, segment);
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
      defaultDatamart
    } = this.props;

    const {
      segment
    } = this.state;

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

    let editLink;
    if (segment.type === 'USER_LIST' && segment.feed_type === 'TAG') {
      editLink = `/v2/o/${organisationId}/audience/segments/${segmentId}/edit`;
    } else {
      editLink = `/o${organisationId}d${datamartId}/datamart/segments//${segmentId}`;
    }
    return (
      <Actionbar path={breadcrumbPaths}>
        <Link key="1" to={`/${organisationId}/campaigns/display/expert/edit/T1`}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="bolt" />
            <FormattedMessage id="ACTIVATE" />
          </Button>
        </Link>

        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          <McsIcon type="download" /><FormattedMessage id="EXPORT" />
        </Button>
        <Link key="2" to={editLink}>
          <Button>
            <McsIcon type="pen" />
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
  overlapView: PropTypes.shape({
    data: PropTypes.arrayOf(PropTypes.object)
  }).isRequired,
  segmentData: PropTypes.arrayOf(PropTypes.object).isRequired,
  exportAudienceSegmentDashboard: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  notifyError: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  defaultDatamart: getDefaultDatamart(state),
  overlapView: getOverlapView(state),
  segmentData: getAudienceSegmentPerformance(state)
});

const mapDispatchToProps = {
  createOverlapAnalysis: AudienceSegmentActions.createAudienceSegmentOverlap.request,
  exportAudienceSegmentDashboard: AudienceSegmentActions.exportAudienceSegmentDashboard.request
};

AudienceSegmentActionbar = compose(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  ),
)(AudienceSegmentActionbar);

export default AudienceSegmentActionbar;
