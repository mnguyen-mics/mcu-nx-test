import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { getFormValues } from 'redux-form';
import messages from '../messages';
import { DefaultSelect, FormSelectField, FormInputField, FormInput } from '../../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../../components/Form/withValidators';
import withNormalizer, {
  NormalizerProps,
} from '../../../../../../components/Form/withNormalizer';
import { FORM_ID } from '../EventRulesForm'
import { EventRulesFormData } from '../../domain';
import DatamartService from '../../../../../../services/DatamartService';
import { UserAccountCompartmentDatamartSelectionResource } from '../../../../../../models/datamart/DatamartResource';

interface UserIdentifierInsertionProps {
  datamartId: string;
}

interface MapStateToProps {
  formValues: EventRulesFormData;
}

interface State {
  compartments: UserAccountCompartmentDatamartSelectionResource[]
}

type Props = UserIdentifierInsertionProps & InjectedIntlProps & ValidatorProps & NormalizerProps & MapStateToProps;

class UserIdentifierInsertion extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);
    this.state = { compartments: [] }
  }

  componentDidMount() {
    const { datamartId } = this.props;
    DatamartService.getUserAccountCompartments(datamartId).then(res => {
      this.setState({ compartments: res.data })
    })
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      formValues,
    } = this.props;

    const typeOptions = [
      { title: 'USER_ACCOUNT', value: 'USER_ACCOUNT' },
      { title: 'EMAIL_HASH', value: 'EMAIL_HASH' },
    ];

    const tranformationFunctionOptions = [
      { title: 'NO_HASH', value: 'NO_HASH' },
      { title: 'SHA_256', value: 'SHA_256' },
      { title: 'MD5', value: 'MD5' },
      { title: 'MD2', value: 'MD2' },
      { title: 'SHA_1', value: 'SHA_1' },
      { title: 'SHA_384', value: 'SHA_384' },
      { title: 'SHA_512', value: 'SHA_512' },
    ];

    const compartmentOptions = this.state.compartments.map(compartment => ({
      title: compartment.compartment_id, value: compartment.compartment_id
    }));

    return (
      <div>
        <FormSelectField
          name="model.identifier_creation"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.contentAutoMatchType),
            required: true,
          }}
          options={typeOptions}
          helpToolTipProps={{
            title: formatMessage(messages.contentAutoMatchTooltip),
          }}
        />
        { formValues.model.type === 'USER_IDENTIFIER_INSERTION' && 
            formValues.model.identifier_creation === 'USER_ACCOUNT' &&
          <FormSelectField
            name="model.compartment_id"
            component={DefaultSelect}
            formItemProps={{
              label: formatMessage(messages.userIdInsertRuleCompartmentSelectLabel),
              required: true,
            }}
            options={compartmentOptions}
            helpToolTipProps={{
              title: formatMessage(messages.userIdInsertRuleCompartmentSelectTooltip),
            }}
            autoSetDefaultValue={false}
            defaultValueTitle={formatMessage(messages.userIdInsertRuleCompartmentSelectDefault)}
          />
        }
        <FormInputField
            name="model.property_source"
            component={FormInput}
            validate={[isRequired]}
            formItemProps={{
              label: formatMessage(messages.contentUserIdentifierLabel),
              required: true,
            }}
            inputProps={{
              placeholder: formatMessage(
                messages.contentUserIdentifierPlaceholder,
              ),
            }}
            helpToolTipProps={{
              title: formatMessage(messages.contentUserIdentifierTooltip),
            }}
          />
        <FormSelectField
          name="model.hash_function"
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.userIdInsertRuleHashFunctionSelectLabel),
            required: true,
          }}
          options={tranformationFunctionOptions}
          helpToolTipProps={{
            title: formatMessage(messages.userIdInsertRuleHashFunctionSelectTooltop),
          }}
        />        
      </div>
    );
  }
}

const mapStateToProps = (state: any) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, UserIdentifierInsertionProps>(
  injectIntl, 
  withValidators, 
  withNormalizer,
  connect(mapStateToProps),
)(UserIdentifierInsertion);