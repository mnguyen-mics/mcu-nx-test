import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import cuid from 'cuid';
import { WrappedFieldArrayProps, getFormValues } from 'redux-form';
import { withRouter, RouteComponentProps } from 'react-router';
import { EmailBlastFormData, SegmentFieldModel, ConsentFieldModel } from '../../domain';
import { FormSection } from '../../../../../../components/Form';
import SegmentReach from '../../SegmentReach';
import AudienceSegmentSelector, {
  AudienceSegmentSelectorProps,
} from '../../../../Common/AudienceSegmentSelector';
import { RelatedRecords, RecordElement } from '../../../../../../components/RelatedRecord';
import { AudienceSegmentResource } from '../../../../../../models/audiencesegment';
import ReportService from '../../../../../../services/ReportService';
import { Index } from '../../../../../../utils';
import { normalizeArrayOfObject } from '../../../../../../utils/Normalizer';
import { normalizeReportView, formatMetric } from '../../../../../../utils/MetricHelper';
import messages from '../../messages';
import McsMoment from '../../../../../../utils/McsMoment';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { injectDrawer } from '../../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

export interface SegmentFormSectionProps extends ReduxFormChangeProps {
  formName: string;
}

type Props = MapStateProps &
  WrappedFieldArrayProps<SegmentFieldModel> &
  InjectedIntlProps &
  SegmentFormSectionProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  reportBySegmentId: Index<any>;
  fetchingReport: boolean;
}

interface MapStateProps {
  consents: ConsentFieldModel[];
}

class SegmentFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      reportBySegmentId: {},
      fetchingReport: false,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
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
    const { fields, formChange } = this.props;
    const segmentIds = segments.map(s => s.id);
    const fieldSegmentIds = fields.getAll().map(field => field.model.audience_segment_id);

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
    this.props.closeNextDrawer();
  };

  openAudienceSegmentSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedSegmentIds = fields.getAll().map(field => field.model.audience_segment_id);

    const audienceSegmentSelectorProps = {
      selectedSegmentIds,
      close: closeNextDrawer,
      save: this.updateSegments,
    };

    const options = {
      additionalProps: audienceSegmentSelectorProps,
    };

    openNextDrawer<AudienceSegmentSelectorProps>(AudienceSegmentSelector, options);
  };

  getSegmentRecords = () => {
    const { fields } = this.props;
    const { fetchingReport, reportBySegmentId } = this.state;

    const getName = (segmentField: SegmentFieldModel) => segmentField.meta.name;

    const getStats = (segmentField: SegmentFieldModel) => {
      const segmentId = segmentField.model.audience_segment_id;

      if (fetchingReport) {
        return <Spin size='small' />;
      }

      const hasStats = reportBySegmentId && reportBySegmentId[segmentId];

      if (!hasStats) return null;

      return (
        <span>
          <span className='m-r-20'>
            Cookies:{' '}
            {hasStats.desktop_cookie_ids ? formatMetric(hasStats.desktop_cookie_ids, '0,00') : '-'}
          </span>
          <span>
            User Points: {hasStats.user_points ? formatMetric(hasStats.user_points, '0,00') : '-'}
          </span>
        </span>
      );
    };

    return fields.getAll().map((segmentField, index) => {
      const removeRecord = () => fields.remove(index);
      return (
        <RecordElement
          key={segmentField.key}
          recordIconType='users'
          record={segmentField}
          title={getName}
          additionalData={getStats}
          onRemove={removeRecord}
        />
      );
    });
  };

  render() {
    const {
      fields,
      consents,
      intl: { formatMessage },
    } = this.props;

    const showReach = fields.length > 0;
    const segmentIds = fields
      .getAll()
      .map(segmentSelection => segmentSelection.model.audience_segment_id);
    const providerTechnicalNames = consents.map(c => (c.model ? c.model.technical_name : '-'));

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: 'why-an-id',
              message: messages.segmentSelectionChooseExisting,
              onClick: this.openAudienceSegmentSelector,
            },
          ]}
          subtitle={messages.segmentSelectionSubTitle}
          title={messages.segmentSelectionTitle}
        />
        <RelatedRecords
          emptyOption={{
            iconType: 'users',
            message: formatMessage(messages.blastSegmentSelectionEmpty),
          }}
        >
          {this.getSegmentRecords()}
        </RelatedRecords>
        {showReach && (
          <div className='section-footer'>
            <SegmentReach segmentIds={segmentIds} providerTechnicalNames={providerTechnicalNames} />
          </div>
        )}
      </div>
    );
  }
}

const getEmailBlastFormData = (formName: string, state: MicsReduxState): EmailBlastFormData => {
  return getFormValues(formName)(state) as EmailBlastFormData;
};

export default compose<Props, SegmentFormSectionProps>(
  withRouter,
  injectIntl,
  injectDrawer,
  connect((state: MicsReduxState, ownProps: Props) => ({
    consents: getEmailBlastFormData(ownProps.formName, state).consentFields,
  })),
)(SegmentFormSection);
