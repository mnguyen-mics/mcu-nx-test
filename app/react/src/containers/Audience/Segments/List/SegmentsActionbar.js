import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown, Icon, Button, message } from 'antd';
import { connect } from 'react-redux';
import Link from 'react-router/lib/Link';
import { FormattedMessage } from 'react-intl';

import { Actionbar } from '../../../Actionbar';
import * as ActionbarActions from '../../../../state/Actionbar/actions';

import ExportService from '../../../../services/ExportService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import {
  AUDIENCE_SEGMENTS_SETTINGS,

  deserializeQuery
} from '../../RouteQuerySelector';

const fetchExportData = (organisationId, datamartId, filter) => {

  const buildOptions = () => {
    const options = {
      first_result: 0,
      max_results: 2000
    };

    if (filter.keywords) { options.name = filter.keywords; }
    if (filter.types.length > 0) {
      options.types = filter.types;
    }
    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = 'audience_segment_id';

  const apiResults = Promise.all([
    AudienceSegmentService.getSegments(organisationId, datamartId, buildOptions()),
    ReportService.getAudienceSegmentReport(organisationId, startDate, endDate, dimension)
  ]);

  return apiResults.then(results => {
    const campaignsDisplay = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'audience_segment_id'
    );

    const mergedData = Object.keys(campaignsDisplay).map((segmentId) => {
      return {
        ...campaignsDisplay[segmentId],
        ...performanceReport[segmentId]
      };
    });

    return mergedData;
  });
};

class SegmentsActionbar extends Component {

  constructor(props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = { exportIsRunning: false };
  }

  componentWillMount() {

    const {
      translations,
      setBreadcrumb
    } = this.props;

    const breadcrumb = {
      name: translations.AUDIENCE_SEGMENTS
    };

    setBreadcrumb(0, [breadcrumb]);

  }

  handleRunExport() {
    const {
      activeWorkspace: {
        organisationId,
        datamartId
      },
      translations,

    } = this.props;

    const filter = deserializeQuery(this.props.query, AUDIENCE_SEGMENTS_SETTINGS);

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    fetchExportData(organisationId, datamartId, filter).then(data => {
      ExportService.exportAudienceSegments(organisationId, datamartId, data, filter, translations);
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    }).catch(() => {
      // TODO notify error
      this.setState({ exportIsRunning: false });
      hideExportLoadingMsg();
    });

  }

  render() {

    const {
      activeWorkspace: {
        organisationId
      }
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;

    const addMenu = (
      <Menu>
        <Menu.Item key="USER_LIST">
          <Link to={`${organisationId}/datamart/segments/USER_LIST`}>
            <FormattedMessage id="USER_LIST" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_QUERY">
          <Link to={`${organisationId}/datamart/segments/USER_QUERY`}>
            <FormattedMessage id="USER_QUERY" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_LOOK_ALIKE">
          <Link to={`${organisationId}/datamart/segments/USER_LOOK_ALIKE`}>
            <FormattedMessage id="USER_LOOK_ALIKE" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    return (
      <Actionbar {...this.props}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button type="primary">
            <Icon type="plus" /> <FormattedMessage id="NEW_SEGMENT" />
          </Button>
        </Dropdown>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <Icon type="export" />}<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }

}

SegmentsActionbar.propTypes = {
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  query: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types

  setBreadcrumb: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  activeWorkspace: state.sessionState.activeWorkspace,
  query: ownProps.router.location.query,
  translations: state.translationsState.translations
});

const mapDispatchToProps = {
  setBreadcrumb: ActionbarActions.setBreadcrumb
};

SegmentsActionbar = connect(
  mapStateToProps,
  mapDispatchToProps
)(SegmentsActionbar);

export default SegmentsActionbar;
