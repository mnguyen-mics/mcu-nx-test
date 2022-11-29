import moment from 'moment';

import McsMoment from '../../../utils/McsMoment';
import { DataResponse } from '@mediarithmics-private/advanced-components/lib/services/ApiService';
import { ReportViewResource } from '../../../models/ReportView';
import ReportService, { Filter } from '../../../services/ReportService';
import ExportService from '../../../services/ExportService';
import { normalizeReportView } from '../../../utils/MetricHelper';

export interface DurationInterface {
  startDate: moment.Moment;
  endDate: moment.Moment;
}

export interface FilterInterface {
  leftValue: string;
  rightValue: string;
}

export interface FormValueInterface {
  type: string;
  dimensions: string[];
  metrics: string[];
  duration: DurationInterface;
  filter?: FilterInterface;
  additionalFilters?: FilterInterface[];
}

interface RequestValuesInterface {
  reportType: string;
  dimensions: string[];
  metrics: string[];
  durationStartDate: McsMoment;
  durationEndDate: McsMoment;
  filters: Filter[];
}

type ReportViewResponse = DataResponse<ReportViewResource>;

const ReportCreationService = {
  filterToObject(filter: FilterInterface): Filter {
    return {
      name: filter.leftValue,
      value: filter.rightValue,
    };
  },

  prepareRequest(formValue: FormValueInterface, preview: boolean): RequestValuesInterface {
    const reportType = formValue.type;
    const dimensions = formValue.dimensions;
    const metrics = formValue.metrics;
    const durationStartDate = new McsMoment(formValue.duration.startDate.toDate());
    const durationEndDate = new McsMoment(formValue.duration.endDate.toDate());
    const additionalFilters = formValue.additionalFilters;

    const filters: Filter[] = [];
    if (formValue.filter) {
      filters.push(ReportCreationService.filterToObject(formValue.filter));
    }

    for (const filter of additionalFilters || []) {
      filters.push(ReportCreationService.filterToObject(filter));
    }

    if (preview) filters.push({ name: 'limit', value: 10 });
    return {
      reportType: reportType,
      dimensions: dimensions,
      metrics: metrics,
      durationStartDate: durationStartDate,
      durationEndDate: durationEndDate,
      filters: filters,
    };
  },

  askRequest(
    organisationId: string,
    requestValues: RequestValuesInterface,
  ): Promise<ReportViewResponse> {
    const {
      reportType: reportType,
      dimensions: dimensions,
      metrics: metrics,
      durationStartDate: durationStartDate,
      durationEndDate: durationEndDate,
      filters: filters,
    } = requestValues;

    switch (reportType) {
      case 'display_campaign_performance_report': {
        return ReportService.getDisplayCampaignPerformanceReport(
          organisationId,
          durationStartDate,
          durationEndDate,
          dimensions,
          metrics,
          filters,
        );
      }

      case 'email_delivery_report': {
        return ReportService.getEmailDeliveryReport(
          organisationId,
          durationStartDate,
          durationEndDate,
          dimensions,
          metrics,
          filters,
        );
      }

      case 'conversion_performance_report': {
        return ReportService.getConversionPerformanceReport(
          organisationId,
          durationStartDate,
          durationEndDate,
          dimensions,
          metrics,
          filters,
        );
      }

      case 'audience_segment_report': {
        return ReportService.getAudienceSegmentReport(
          organisationId,
          durationStartDate,
          durationEndDate,
          dimensions,
          metrics,
          filters,
        );
      }

      case 'conversion_attribution_performance': {
        return ReportService.getConversionAttributionPerformance(
          organisationId,
          durationStartDate,
          durationEndDate,
          [],
          dimensions,
          metrics,
          filters,
        );
      }

      default: {
        return Promise.reject(new Error('Unsupported report type'));
      }
    }
  },

  exportReport(formValue: FormValueInterface, organisationId: string): Promise<string> {
    const requestValues = ReportCreationService.prepareRequest(formValue, false);

    return ReportCreationService.askRequest(organisationId, requestValues).then(res => {
      const dataSheet = {
        data: [res.data.report_view.columns_headers].concat(res.data.report_view.rows),
        name: 'test',
      };
      ExportService.exportData([dataSheet], 'test', 'xlsx');

      return 'Done';
    });
  },

  preview(formValue: FormValueInterface, organisationId: string) {
    const requestValues = ReportCreationService.prepareRequest(formValue, true);

    return ReportCreationService.askRequest(organisationId, requestValues).then(res => {
      const headers = res.data.report_view.columns_headers;

      const columns = headers.map(value => ({
        intlMessage: { id: value, defaultMessage: value },
        key: value,
      }));

      const noPreviewValues = res.data.report_view.total_items === 0;
      let dataSource = normalizeReportView(res.data.report_view);

      if (dataSource.length > 10) {
        dataSource = dataSource.slice(0, 10);
      }

      return {
        noPreviewValues,
        dataSource,
        columns,
      };
    });
  },
};

export default ReportCreationService;
