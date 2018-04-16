import * as React from 'react';
import { connect } from 'react-redux';
import { Menu, Button, message } from 'antd';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { FormattedMessage, InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import lodash from 'lodash';
import { Dropdown } from '../../../../components/PopupContainers/index';
import { Actionbar } from '../../../Actionbar';
import McsIcon from '../../../../components/McsIcon';

import ExportService from '../../../../services/ExportService';
import AudienceSegmentService from '../../../../services/AudienceSegmentService';
import ReportService from '../../../../services/ReportService';

import { normalizeReportView } from '../../../../utils/MetricHelper';
import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import { SEGMENTS_SEARCH_SETTINGS } from './constants';
import { parseSearch } from '../../../../utils/LocationSearchHelper';
import { getDefaultDatamart } from '../../../../state/Session/selectors';
import withTranslations, { TranslationProps } from '../../../Helpers/withTranslations';
import { Datamart } from '../../../../models/organisation/organisation';

interface MapStateToProps {
  defaultDatamart: (organisationId: string) => Datamart;
}

interface State {
  exportIsRunning: boolean;
}

type Props = MapStateToProps &
  InjectedIntlProps &
  TranslationProps &
  RouteComponentProps<{ organisationId: string }>;

const fetchExportData = (
  organisationId: string,
  datamartId: string,
  filter: any,
) => {
  const buildOptions = () => {
    const options: any = {
      first_result: 0,
      max_results: 2000,
      datamartId: datamartId
    };

    if (filter.keywords) {
      options.name = filter.keywords;
    }
    if (filter.types && filter.types.length > 0) {
      options.types = filter.types;
    }
    return options;
  };

  const startDate = filter.from;
  const endDate = filter.to;
  const dimension = ['audience_segment_id'];

  const apiResults = Promise.all([
    AudienceSegmentService.getSegments(
      organisationId,
      buildOptions(),
    ),
    ReportService.getAudienceSegmentReport(
      organisationId,
      startDate,
      endDate,
      dimension,
    ),
  ]);

  return apiResults.then(results => {
    const audienceSegments = normalizeArrayOfObject(results[0].data, 'id');
    const performanceReport = normalizeArrayOfObject(
      normalizeReportView(results[1].data.report_view),
      'audience_segment_id',
    );

    const mergedData = Object.keys(audienceSegments).map(segmentId => {
      return {
        ...audienceSegments[segmentId],
        ...performanceReport[segmentId],
      };
    });

    return mergedData;
  });
};

class SegmentsActionbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.handleRunExport = this.handleRunExport.bind(this);
    this.state = { exportIsRunning: false };
  }

  getSearchSetting() {
    const {
      match: { params: { organisationId } },
      defaultDatamart,
    } = this.props;

    return [
      ...SEGMENTS_SEARCH_SETTINGS,
      {
        paramName: 'datamarts',
        defaultValue: [parseInt(defaultDatamart(organisationId).id, 0)],
        deserialize: (query: any) => {
          if (query.datamarts) {
            return query.datamarts
              .split(',')
              .map((d: string) => parseInt(d, 0));
          }
          return [];
        },
        serialize: (value: string[]) => value.join(','),
        isValid: (query: any) =>
          query.datamarts &&
          query.datamarts.split(',').length > 0 &&
          lodash.every(query.datamarts, d => !isNaN(parseInt(d, 0))),
      },
    ];
  }

  handleRunExport() {
    const { match: { params: { organisationId } }, translations } = this.props;

    const filter = parseSearch(
      this.props.location.search,
      this.getSearchSetting(),
    );

    this.setState({ exportIsRunning: true });
    const hideExportLoadingMsg = message.loading(
      translations.EXPORT_IN_PROGRESS,
      0,
    );

    const datamartId = filter.datamarts[0];

    fetchExportData(organisationId, datamartId, filter)
      .then(data => {
        ExportService.exportAudienceSegments(
          organisationId,
          datamartId,
          data,
          filter,
          translations,
        );
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      })
      .catch(() => {
        // TODO notify error
        this.setState({ exportIsRunning: false });
        hideExportLoadingMsg();
      });
  }

  render() {
    const {
      match: { params: { organisationId } },
      defaultDatamart,
      translations,
    } = this.props;

    const exportIsRunning = this.state.exportIsRunning;
    const datamart = defaultDatamart(organisationId);

    const userPixelMenu = () => {
      return (
        <Menu.Item key="USER_PIXEL">
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/audience/segments/create/USER_PIXEL`,
            }}
          >
            <FormattedMessage id="USER_PIXEL" />
          </Link>
        </Menu.Item>
      );
    };

    const addMenu = (
      <Menu>
        <Menu.Item key="USER_LIST">
          <Link
            to={{
              pathname: `/v2/o/${organisationId}/audience/segments/create/USER_LIST`,
            }}
          >
            <FormattedMessage id="USER_LIST" />
          </Link>
        </Menu.Item>
        {datamart.storage_model_version === 'v201709' ? userPixelMenu() : null}

        <Menu.Item key="USER_QUERY">
          <Link
            to={`/v2/o/${organisationId}/audience/segments/create/USER_QUERY`}
          >
            <FormattedMessage id="USER_QUERY" />
          </Link>
        </Menu.Item>
      </Menu>
    );

    const breadcrumbPaths = [
      {
        name: translations.AUDIENCE_SEGMENTS,
        url: `/v2/o/${organisationId}/audience/segments`,
      },
    ];

    return (
      <Actionbar path={breadcrumbPaths}>
        <Dropdown overlay={addMenu} trigger={['click']}>
          <Button className="mcs-primary" type="primary">
            <McsIcon type="plus" /> <FormattedMessage id="NEW_SEGMENT" />
          </Button>
        </Dropdown>
        <Button onClick={this.handleRunExport} loading={exportIsRunning}>
          {!exportIsRunning && <McsIcon type="download" />}
          <FormattedMessage id="EXPORT" />
        </Button>
      </Actionbar>
    );
  }
}

const mapStateToProps = (state: any) => ({
  defaultDatamart: getDefaultDatamart(state),
});

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  withTranslations,
  connect(mapStateToProps, undefined),
)(SegmentsActionbar);
