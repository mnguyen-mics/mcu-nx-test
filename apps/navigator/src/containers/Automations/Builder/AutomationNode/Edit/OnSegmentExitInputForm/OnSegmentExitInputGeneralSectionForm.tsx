import * as React from 'react';
import { OnSegmentExitInputAutomationFormData } from '../domain';
import { WrappedComponentProps, injectIntl, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { compose } from 'recompose';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { withValidators, FormSection } from '../../../../../../components/Form';
import { FormInfiniteSearchObjectField } from '../../../../../Audience/AdvancedSegmentBuilder/Edit/Sections/Field/FieldNodeForm';
import { SegmentNameDisplay } from '../../../../../Audience/Common/SegmentNameDisplay';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';
import FormInfiniteSearchObject from '../../../../../../components/Form/FormSelect/FormInfiniteSearchObject';

interface State {}

interface OnSegmentExitInputGeneralSectionFormProps {
  initialValues: Partial<OnSegmentExitInputAutomationFormData>;
  disabled?: boolean;
}

type Props = OnSegmentExitInputGeneralSectionFormProps &
  WrappedComponentProps &
  InjectedNotificationProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class OnSegmentExitInputGeneralSectionForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
  }

  fetchListMethod = (keywords: string, firstResult: number, maxResults: number) => {
    const {
      match: {
        params: { organisationId },
      },
      initialValues: { datamartId },
      notifyError,
    } = this.props;

    return this._audienceSegmentService
      .getSegments(organisationId, {
        keywords,
        type: ['USER_QUERY'],
        persisted: true,
        datamart_id: datamartId,
        first_result: firstResult,
        max_results: maxResults,
      })
      .then(({ data: segments }) =>
        segments.map(r => ({
          key: r.id,
          label: <SegmentNameDisplay audienceSegmentResource={r} />,
          value: r.id,
        })),
      )
      .catch(error => {
        notifyError(error);
        return [];
      });
  };

  fetchSingleMethod = (id: string) => {
    return this._audienceSegmentService
      .getSegment(id)
      .then(({ data: segment }) => ({
        key: segment.id,
        label: <SegmentNameDisplay audienceSegmentResource={segment} />,
        value: segment.id,
      }))
      .catch(error => {
        this.props.notifyError(error);
        return {
          key: id,
          label: <SegmentNameDisplay audienceSegmentId={id} />,
          value: id,
        };
      });
  };

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      disabled,
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />
        <FormSection title={messages.configurationTitle} />
        <FormInfiniteSearchObjectField
          name='segmentId'
          component={FormInfiniteSearchObject}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.segmentExitInputNameTitle),
            required: true,
          }}
          fetchListMethod={this.fetchListMethod}
          fetchSingleMethod={this.fetchSingleMethod}
          selectProps={{
            disabled: !!disabled,
            mode: undefined,
            showSearch: true,
          }}
          type='Audience'
          small={true}
        />
      </div>
    );
  }
}

export default compose<Props, OnSegmentExitInputGeneralSectionFormProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  withValidators,
  withNormalizer,
)(OnSegmentExitInputGeneralSectionForm);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.generalInfoSection.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.general.subtitle',
    defaultMessage: 'This is the starting point for your automation.',
  },
  configurationTitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  segmentExitInputNameTitle: {
    id: 'automation.builder.node.onSegmentExitInputForm.name.title',
    defaultMessage: 'Users will enter this automation when they leave this segment.',
  },
});
