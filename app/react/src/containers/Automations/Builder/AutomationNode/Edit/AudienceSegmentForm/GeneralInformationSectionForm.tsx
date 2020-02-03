import * as React from 'react';
import { AudienceSegmentAutomationFormData } from "../domain";
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
import { Row } from 'antd';

interface State {
  fetchingAudienceSegments: boolean;
  userListSegment: AudienceSegmentShape[]
}

interface GeneralInformationFormSectionProps {
  initialValues: Partial<AudienceSegmentAutomationFormData>;
  organisationId: string;
  disabled?: boolean;
}

type Props = GeneralInformationFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  NormalizerProps;

class GeneralInformationFormSection extends React.Component<Props, State> {

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
        type: "USER_LIST",
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
        <div className="automation-node-form">
          <FormInputField
            name="audienceSegment.name"
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
            name="audienceSegment.ttl.value"
            component={FormInput}
            validate={[isValidInteger]}
            formItemProps={{
              label: formatMessage(
                messages.audienceSegmentTTLTitle,
              ),
            }}
            inputProps={{
              addonAfter: (
                <div>
                  <Row>
                    <FormAddonSelectField
                      name="audienceSegment.ttl.unit"
                      component={AddonSelect}
                      options={[
                        {
                          value: 'days',
                          title: formatMessage(
                            messages.audienceSegmentTTLUnitDays,
                          ),
                        },
                        {
                          value: 'months',
                          title: formatMessage(
                            messages.audienceSegmentTTLUnitMonths,
                          ),
                        },
                        {
                          value: 'years',
                          title: formatMessage(
                            messages.audienceSegmentTTLUnitYears,
                          ),
                        },
                      ]}
                    />
                  </Row>
                </div>
              ),
              placeholder: formatMessage(
                messages.audienceSegmentTTLPlaceholder,
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
)(GeneralInformationFormSection);

export const messages = defineMessages({
  sectionGeneralTitle: {
    id: 'automation.builder.node.audienceSegmentForm.generalInfoSection.title',
    defaultMessage: 'General information',
  },
  sectionGeneralSubtitle: {
    id: 'automation.builder.node.audienceSegmentForm.general.subtitle',
    defaultMessage: 'Modify the general information of your audience segment',
  },
  automationNodeName: {
    id: 'automation.builder.node.audienceSegmentForm.name',
    defaultMessage: 'Automation node name',
  },
  audienceSegmentNameTitle: {
    id: 'automation.builder.node.audienceSegmentForm.name.title',
    defaultMessage: 'This is the audience segment name',
  },
  audienceSegmentNameSubtitle: {
    id: 'automation.builder.node.audienceSegmentForm.name.subtitle',
    defaultMessage: "The audience segment's name will help you identify it on the different screens. Make it as memorable as you want your results to be !",
  },
  audienceSegmentNamePlaceholder: {
    id: 'automation.builder.node.audienceSegmentForm.name.placeholder',
    defaultMessage: 'This is a segment name',
  },
  audienceSegmentTTLTitle: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.title',
    defaultMessage: 'TTL',
  },
  audienceSegmentTTLSubtitle: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.subtitle',
    defaultMessage: "Time during which the user will belong to the segment (0 means forever).",
  },
  audienceSegmentTTLPlaceholder: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.placeholder',
    defaultMessage: "Time to live in segment",
  },
  audienceSegmentTTLUnitDays: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.unit.days',
    defaultMessage: "Days",
  },
  audienceSegmentTTLUnitMonths: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.unit.months',
    defaultMessage: "Months",
  },
  audienceSegmentTTLUnitYears: {
    id: 'automation.builder.node.audienceSegmentForm.ttl.unit.years',
    defaultMessage: "Years",
  },
});