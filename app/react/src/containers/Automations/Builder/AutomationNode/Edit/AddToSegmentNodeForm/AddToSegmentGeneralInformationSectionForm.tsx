import * as React from 'react';
import { AddToSegmentAutomationFormData } from "../domain";
import { InjectedIntlProps, injectIntl, defineMessages } from "react-intl";
import { ValidatorProps } from "../../../../../../components/Form/withValidators";
import { TYPES } from '../../../../../../constants/types';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IAudienceSegmentService } from '../../../../../../services/AudienceSegmentService';
import { AudienceSegmentShape } from '../../../../../../models/audiencesegment';
import { compose } from 'recompose';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import {
  withValidators,
  FormSection,
  FormInput,
  FormInputField,
  FormAddonSelectField,
  AddonSelect
} from '../../../../../../components/Form';

interface State {
  fetchingAudienceSegments: boolean;
  userListSegment: AudienceSegmentShape[]
}

interface GeneralInformationFormSectionProps {
  initialValues: Partial<AddToSegmentAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class AddToSegmentGeneralInformationFormSection extends React.Component<Props, State> {

  @lazyInject(TYPES.IAudienceSegmentService)
  private audienceSegmentService: IAudienceSegmentService;

  constructor(props: Props) {
    super(props);
    this.state = {
      fetchingAudienceSegments: false,
      userListSegment: []
    };
  }

  componentDidMount() {
    this.setState({ fetchingAudienceSegments: true, });
    this.audienceSegmentService
      .getSegments(this.props.organisationId, {
        type: ["USER_LIST"],
      })
      .then(userListSegmentsResponse => {
        this.setState({
          fetchingAudienceSegments: false,
          userListSegment: userListSegmentsResponse.data
        });
      });
  }

  render() {
    const {
        fieldValidators: { isRequired, isValidInteger },
        intl: { formatMessage },
        disabled,
      } = this.props;

    return (

      <div>
        <FormSection
          subtitle={messages.sectionGeneralSubtitle}
          title={messages.sectionGeneralTitle}
        />
        <div>
          <FormInputField
            name="name"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(
                messages.audienceSegmentNameTitle, 
              ),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.audienceSegmentNamePlaceholder,
              ),
              disabled: !!disabled,
            }}
            helpToolTipProps={{
              title: formatMessage(messages.audienceSegmentNameSubtitle),
            }}
            small={true}
          />
          <FormInputField
            name="ttl.value"
            component={FormInput}
            validate={[isValidInteger]}
            formItemProps={{
              label: formatMessage(
                messages.audienceSegmentTTLTitle,
              ),
            }}
            inputProps={{
              disabled: disabled,
              placeholder: formatMessage(messages.audienceSegmentTTLPlaceholder),
              addonAfter: (
                <FormAddonSelectField
                  name="ttl.unit"
                  component={AddonSelect}
                  disabled={disabled}
                  options={[
                    {
                      value: 'days',
                      key: 'days',
                      title: formatMessage(
                        messages.audienceSegmentTTLUnitDays,
                      ),
                    },
                    {
                      value: 'months',
                      key: 'months',
                      title: formatMessage(
                        messages.audienceSegmentTTLUnitMonths,
                      ),
                    },
                  ]}
                />
              ),
              style: { width: '100%' },
            }}
            helpToolTipProps={{
              title: formatMessage(
                messages.audienceSegmentTTLSubtitle,
              ),
            }}
            small={true}
          />
        </div>
      </div>
    )
  }
}

export default compose<Props, GeneralInformationFormSectionProps>(
  injectIntl,
  withValidators,
  withNormalizer,
)(AddToSegmentGeneralInformationFormSection);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.addToSegmentForm.general.title',
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.general.subtitle',
    defaultMessage: 'Modify the general information of your audience segment',
  },
  automationNodeName: {
    id: 'automation.builder.node.addToSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  audienceSegmentNameTitle: {
    id: 'automation.builder.node.addToSegmentForm.name.title',
    defaultMessage: 'This is the audience segment name',
  },
  audienceSegmentNameSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.name.subtitle',
    defaultMessage: "The audience segment's name will help you identify it on the different screens. Make it as memorable as you want your results to be !",
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.addToSegmentForm.name.placeholder',
    defaultMessage: 'Segment Name',
  },
  audienceSegmentTTLTitle: {
    id: 'automation.builder.node.addToSegmentForm.ttl.title',
    defaultMessage: 'Time to live in segment',
  },
  audienceSegmentTTLSubtitle: {
    id: 'automation.builder.node.addToSegmentForm.ttl.subtitle',
    defaultMessage: "Time during which the user will belong to the segment (0 means forever). If not filled the default lifetime of the associated segment will be used.",
  },
  audienceSegmentTTLPlaceholder: {
    id: 'automation.builder.node.addToSegmentForm.ttl.placeholder',
    defaultMessage: "Time to live",
  },
  audienceSegmentTTLUnitDays: {
    id: 'automation.builder.node.addToSegmentForm.ttl.unit.days',
    defaultMessage: "Days",
  },
  audienceSegmentTTLUnitMonths: {
    id: 'automation.builder.node.addToSegmentForm.ttl.unit.months',
    defaultMessage: "Months",
  },
});