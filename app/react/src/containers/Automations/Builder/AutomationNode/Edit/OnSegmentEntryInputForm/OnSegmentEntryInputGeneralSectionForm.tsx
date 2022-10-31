import * as React from 'react';
import { OnSegmentEntryInputAutomationFormData } from '../domain';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { ValidatorProps } from '../../../../../../components/Form/withValidators';
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { compose } from 'recompose';
import withNormalizer, { NormalizerProps } from '../../../../../../components/Form/withNormalizer';
import { withValidators, FormSection } from '../../../../../../components/Form';
import { FormSearchObjectField } from '../../../../../Audience/AdvancedSegmentBuilder/Edit/Sections/Field/FieldNodeForm';
import FormSearchObject from '../../../../../../components/Form/FormSelect/FormSearchObject';
import { SegmentNameDisplay } from '../../../../../Audience/Common/SegmentNameDisplay';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../../Notifications/injectNotifications';

interface State {}

interface OnSegmentEntryInputGeneralSectionFormProps {
  initialValues: Partial<OnSegmentEntryInputAutomationFormData>;
  disabled?: boolean;
}

type Props = OnSegmentEntryInputGeneralSectionFormProps &
  InjectedIntlProps &
  InjectedNotificationProps &
  ValidatorProps &
  RouteComponentProps<{ organisationId: string }> &
  NormalizerProps;

class OnSegmentEntryInputGeneralSectionForm extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
  }

  fetchListMethod = (keywords: string) => {
    const {
      match: {
        params: { organisationId },
      },
      initialValues: { datamartId },
      notifyError,
    } = this.props;

    return Promise.all([
      this._audienceSegmentService.getSegments(organisationId, {
        keywords,
        type: ['USER_QUERY'],
        persisted: true,
        datamart_id: datamartId,
      }),
      this._audienceSegmentService.getSegments(organisationId, {
        keywords,
        type: ['USER_LIST'],
        feed_type: 'FILE_IMPORT',
        persisted: true,
        datamart_id: datamartId,
      }),
    ])
      .then(([{ data: userQuerySegments }, { data: userListSegments }]) => {
        return userQuerySegments.concat(userListSegments).map(segment => ({
          key: segment.id,
          label: <SegmentNameDisplay audienceSegmentResource={segment} />,
          value: segment.id,
        }));
      })
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
        <FormSearchObjectField
          name='segmentId'
          component={FormSearchObject}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.segmentEntryInputNameTitle),
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

export default compose<Props, OnSegmentEntryInputGeneralSectionFormProps>(
  withRouter,
  injectIntl,
  injectNotifications,
  withValidators,
  withNormalizer,
)(OnSegmentEntryInputGeneralSectionForm);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.generalInfoSection.title',
    defaultMessage: 'Description',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.general.subtitle',
    defaultMessage: 'This is the starting point for your automation.',
  },
  configurationTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.generalInfoSection.configuration.title',
    defaultMessage: 'Configuration',
  },
  segmentEntryInputNameTitle: {
    id: 'automation.builder.node.onSegmentEntryInputForm.name.title',
    defaultMessage: 'Users will enter this automation when they enter this segment',
  },
});
