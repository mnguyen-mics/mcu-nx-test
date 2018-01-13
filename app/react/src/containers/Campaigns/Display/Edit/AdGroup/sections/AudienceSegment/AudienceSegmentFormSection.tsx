import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Spin } from 'antd';
import cuid from 'cuid';
import { WrappedFieldArrayProps } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';
import { SegmentFieldModel, EditAdGroupRouteMatchParam } from '../../domain';
import { DrawableContentProps } from '../../../../../../../components/Drawer';
import {
  FormSection,
  FormSwitchField,
} from '../../../../../../../components/Form';
import AudienceSegmentSelector, {
  AudienceSegmentSelectorProps,
} from '../../../../../Common/AudienceSegmentSelector';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../../../components/RelatedRecord';
import { AudienceSegmentResource } from '../../../../../../../models/audiencesegment';
import ReportService from '../../../../../../../services/ReportService';
import { Index } from '../../../../../../../utils';
import { normalizeArrayOfObject } from '../../../../../../../utils/Normalizer';
import {
  normalizeReportView,
  formatMetric,
} from '../../../../../../../utils/MetricHelper';
import messages from '../../../messages';
import McsMoment from '../../../../../../../utils/McsMoment';
import FormSwitch from '../../../../../../../components/Form/FormSwitch';
import { compose } from 'recompose';
import { ReduxFormChangeProps } from '../../../../../../../utils/FormHelper';

export interface AudienceSegmentFormSectionProps extends DrawableContentProps, ReduxFormChangeProps {}

interface State {
  reportBySegmentId: Index<any>;
  fetchingReport: boolean;
}

type Props = WrappedFieldArrayProps<SegmentFieldModel> &
  InjectedIntlProps &
  AudienceSegmentFormSectionProps &
  RouteComponentProps<EditAdGroupRouteMatchParam>;

class AudienceSegmentFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reportBySegmentId: {},
      fetchingReport: false,
    };
  }

  componentDidMount() {
    const { match: { params: { organisationId } } } = this.props;
    this.setState({ fetchingReport: true });
    ReportService.getAudienceSegmentReport(
      organisationId,
      new McsMoment('now'),
      new McsMoment('now'),
      ['audience_segment_id'],
      undefined,
    ).then(resp => {
      this.setState({
        fetchingReport: false,
        reportBySegmentId: normalizeArrayOfObject(
          normalizeReportView(resp.data.report_view),
          'audience_segment_id',
        ),
      });
    });
  }

  updateSegments = (segments: AudienceSegmentResource[]) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const segmentIds = segments.map(s => s.id);
    const fieldSegmentIds = fields
      .getAll()
      .map(field => field.model.audience_segment_id);

    const keptSegments = fields
      .getAll()
      .filter(field => segmentIds.includes(field.model.audience_segment_id));
    const addedSegments = segments
      .filter(s => !fieldSegmentIds.includes(s.id))
      .map(segment => ({
        key: cuid(),
        model: {
          audience_segment_id: segment.id,
          exclude: false,
        },
        meta: { name: segment.name },
      }));

    formChange((fields as any).name, keptSegments.concat(addedSegments));
    closeNextDrawer();
  };

  openAudienceSegmentSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedSegmentIds = fields
      .getAll()
      .map(field => field.model.audience_segment_id);

    const audienceSegmentSelectorProps = {
      selectedSegmentIds,
      close: closeNextDrawer,
      save: this.updateSegments,
    };

    const options = {
      additionalProps: audienceSegmentSelectorProps,
    };

    openNextDrawer<AudienceSegmentSelectorProps>(
      AudienceSegmentSelector,
      options,
    );
  };

  getSegmentRecords = () => {
    const { fields } = this.props;
    const { fetchingReport, reportBySegmentId } = this.state;

    const getName = (segmentField: SegmentFieldModel) => segmentField.meta.name;

    const getStats = (segmentField: SegmentFieldModel) => {
      const segmentId = segmentField.model.audience_segment_id;

      if (fetchingReport) {
        return <Spin size="small" />;
      }

      const hasStats = reportBySegmentId && reportBySegmentId[segmentId];

      if (!hasStats) return null;

      return (
        <span>
          <span className="m-r-20">
            Cookies:{' '}
            {hasStats.desktop_cookie_ids
              ? formatMetric(hasStats.desktop_cookie_ids, '0,00')
              : '-'}
          </span>
          <span>
            User Points:{' '}
            {hasStats.user_points
              ? formatMetric(hasStats.user_points, '0,00')
              : '-'}
          </span>
        </span>
      );
    };

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const excludeSwitch = (record: SegmentFieldModel) => {
        return (
          <span>
            <FormSwitchField
              name={`${name}.model.exclude`}
              component={FormSwitch}
              invert={true}
              className="mcs-table-switch m-r-10"
            />
            {record.model.exclude ? 'Exclude' : 'Target'}
          </span>
        );
      };

      const segmentField = fields.get(index);

      return (
        <RecordElement
          key={segmentField.key}
          recordIconType="users"
          record={segmentField}
          title={getName}
          additionalData={getStats}
          additionalActionButtons={excludeSwitch}
          onRemove={removeField}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openAudienceSegmentSelector,
            },
          ]}
          subtitle={messages.sectionSubtitleAudience}
          title={messages.sectionTitleAudience}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'users',
            message: formatMessage(messages.contentSectionAudienceEmptyTitle),
          }}
        >
          {this.getSegmentRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<Props, AudienceSegmentFormSectionProps>(
  withRouter,
  injectIntl,
)(AudienceSegmentFormSection);
