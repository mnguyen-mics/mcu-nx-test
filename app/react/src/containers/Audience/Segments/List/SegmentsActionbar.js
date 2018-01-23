import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu, Dropdown, Button, message } from 'antd';
import { Link, withRouter } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { compose } from 'recompose';
import lodash from 'lodash';

import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon.tsx';

import ExportService from '../../../../services/ExportService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService.ts';
import ReportService from '../../../../services/ReportService.ts';

import { normalizeReportView } from '../../../../utils/MetricHelper.ts';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer.ts';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { getDefaultDatamart } from '../../../../state/Session/selectors';


const fetchExportData = (organisationId, datamartId, filter) => {

  const buildOptions = () => {
    const options = {
      first_result: 0,
      max_results: 2000,
    };

    if (filter.keywords) { options.name = filter.keywords; }
    if (filter.types && filter.types.length > 0) {
      options.types = filter.types;
    }
    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = 'audience_segment_id';

  const apiResults = Promise.all([
    AudienceSegmentService.getSegments(organisationId, datamartId, buildOptions()),
    ReportService.getAudienceSegmentReport(organisationId, startDate, endDate, dimension),
  ]);

  return apiResults.then(results => {
    const audienceSegments = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'audience_segment_id',
    );

    const mergedData = Object.keys(audienceSegments).map((segmentId) => {
      return {
        ...audienceSegments[segmentId],
        ...performanceReport[segmentId],
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

  getSearchSetting() {
    const {
      match: {
        params: { organisationId },
      },
      defaultDatamart,
    } = this.props;

    return [
      ...SEGMENTS_SEARCH_SETTINGS,
      {
        paramName: 'datamarts',
        defaultValue: [parseInt(defaultDatamart(organisationId).id, 0)],
        deserialize: query => {
          if (query.datamarts) {
            return query.datamarts.split(',').map((d) => parseInt(d, 0));
          }
          return [];
        },
        serialize: value => value.join(','),
        isValid: query =>
          query.datamarts &&
          query.datamarts.split(',').length > 0 &&
          lodash.every(query.datamarts, (d) => !isNaN(parseInt(d, 0))),
      },
    ];

  }


  handleRunExport() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      translations,
    } = this.props;

    const filter = parseSearch(this.props.location.search, this.getSearchSetting());

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(translations.EXPORT_IN_PROGRESS, 0);

    const datamartId = filter.datamarts[0];

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
      match: {
        params: {
          organisationId,
        },
      },
      defaultDatamart,
      translations,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;
    const datamartId = defaultDatamart(organisationId).id;

    const addMenu = (
      <Menu>
        <Menu.Item key="USER_LIST">
          <Link to={`/o${organisationId}d${datamartId}/datamart/segments/USER_LIST`}>
            <FormattedMessage id="USER_LIST" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_QUERY">
          <Link to={`/o${organisationId}d${datamartId}/datamart/segments/USER_QUERY`}>
            <FormattedMessage id="USER_QUERY" />
          </Link>
        </Menu.Item>
        <Menu.Item key="USER_LOOK_ALIKE">
          <Link to={`/o${organisationId}d${datamartId}/datamart/segments/USER_LOOK_ALIKE`}>
            <FormattedMessage id="USER_LOOK_ALIKE" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const breadcrumbPaths = [{
      name: translations.AUDIENCE_SEGMENTS,
      url: `/v2/o/${organisationId}/audience/segments`,
    }];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_SEGMENT" />
          </Button>
        </Dropdown>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}<FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );

  }

}

SegmentsActionbar.propTypes = {
  match: PropTypes.shape().isRequired,
  location: PropTypes.shape().isRequired,
  defaultDatamart: PropTypes.func.isRequired,
  translations: PropTypes.shape().isRequired,
};

const mapStateToProps = state => ({
  translations: state.translations,
  defaultDatamart: getDefaultDatamart(state),
});


SegmentsActionbar = compose(
  withRouter,
  connect(
    mapStateToProps,
  ),
)(SegmentsActionbar);

export default SegmentsActionbar;
