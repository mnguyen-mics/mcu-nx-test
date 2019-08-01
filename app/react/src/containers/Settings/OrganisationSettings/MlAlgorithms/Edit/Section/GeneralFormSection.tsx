import * as React from 'react';
import MlAlgorithmResource from "../../../../../../models/mlAlgorithm/MlAlgorithmResource";
import { InjectedIntlProps, injectIntl } from "react-intl";
import { getFormValues } from 'redux-form';
import withValidators, { ValidatorProps } from "../../../../../../components/Form/withValidators";
import withNormalizer, { NormalizerProps } from "../../../../../../components/Form/withNormalizer";
import messages from '../../messages';
import {
    FormInput,
    FormSection,
    FormInputField,
    FormTextArea,
    FormTextAreaField
  } from '../../../../../../components/Form';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { FORM_ID } from '../MlAlgorithmForm';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';

interface MapStateToProps {
    formValues: Partial<MlAlgorithmResource>;
}

type Props = InjectedIntlProps &
 ValidatorProps & 
 NormalizerProps & 
 MapStateToProps;

class GeneralFormSection extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    

    render() {
        const {
            fieldValidators: { isRequired, isCharLengthLessThan },
            intl: { formatMessage }
        } = this.props;

        return (
            <div>
                <FormSection
                title={messages.sectionTitleGeneral}
                subtitle={messages.sectionSubTitleGeneral}
                />

                <div>
                    <FormInputField
                        name="name"
                        component={FormInput}
                        validate={[isRequired]}
                        formItemProps={{
                            label: formatMessage(messages.labelMlAlgorithmName),
                            required: true,
                        }}
                        inputProps={{
                            placeholder: formatMessage(messages.labelMlAlgorithmName)
                        }}
                        helpToolTipProps={{
                            title: formatMessage(messages.tooltipMlAlgorithmName)
                        }}
                    />
                    <FormTextAreaField
                        name="description"
                        component={FormTextArea}
                        validate={[isCharLengthLessThan(255), isRequired]}
                        formItemProps={{
                            label: formatMessage(
                            messages.description,
                            ),
                        }}
                        inputProps={{
                            placeholder: formatMessage(
                            messages.labelMlAlgorithmDescription),
                        }}
                        helpToolTipProps={{
                            title: formatMessage(
                            messages.labelMlAlgorithmDescription),
                        }}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state: MicsReduxState) => ({
    formValues: getFormValues(FORM_ID)(state),
  });
  
export default compose(
    injectIntl,
    withValidators,
    withNormalizer,
    connect(mapStateToProps),
)(GeneralFormSection);
