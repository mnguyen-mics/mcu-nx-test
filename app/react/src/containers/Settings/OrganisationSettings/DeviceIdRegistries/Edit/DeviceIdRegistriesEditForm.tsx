import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router-dom';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Button, ButtonProps } from 'antd';
import {
  DefaultSelect,
  FormInput,
  FormInputField,
  FormSection,
  FormSelectField,
  withValidators,
} from '../../../../../components/Form';
import { compose } from 'recompose';
import messages from '../messages';
import { ValidatorProps } from '@mediarithmics-private/advanced-components/lib/components/form/withValidators';
import { Form, getFormValues, InjectedFormProps, reduxForm, submit } from 'redux-form';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import {
  DeviceIdRegistryResource,
  DeviceIdRegistryType,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../Datamart';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IDatamartService } from '../../../../../services/DatamartService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DefaultOptionProps } from '../../../../../components/Form/FormSelect/DefaultSelect';

export const FORM_ID = 'newRegistryForm';

type DeviceIdRegistryFormData = Partial<DeviceIdRegistryResource>;

interface DeviceIdRegistriesEditFormState {
  isLoadingDatamarts: boolean;
  datamarts: DatamartWithOrgNameResource[];
  total: number;
}

interface DeviceIdRegistriesEditFormProps {
  initialValues?: Partial<DeviceIdRegistryFormData>;
  deviceIdRegistry?: DeviceIdRegistryResource;
  save: (registry: Partial<DeviceIdRegistryResource>) => void;
}
interface RouterProps {
  organisationId: string;
}

type Props = DeviceIdRegistriesEditFormProps &
  RouteComponentProps<RouterProps> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedFormProps<any, DeviceIdRegistriesEditFormProps> &
  ValidatorProps &
  InjectedWorkspaceProps;
interface DatamartWithOrgNameResource extends DatamartResource {
  organisation_name: string;
}

class DeviceIdRegistriesEditForm extends React.Component<Props, DeviceIdRegistriesEditFormState> {
  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  @lazyInject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoadingDatamarts: false,
      datamarts: [],
      total: 0,
    };
  }

  save = (formData: DeviceIdRegistryFormData): any => {
    const {
      deviceIdRegistry,
      match: {
        params: { organisationId },
      },
    } = this.props;

    if (deviceIdRegistry) {
      this.props.save({
        id: deviceIdRegistry.id,
        organisation_id: deviceIdRegistry.organisation_id,
        type: deviceIdRegistry.type,
        ...formData,
      });
    } else {
      const registryResource: Partial<DeviceIdRegistryResource> = {
        ...formData,
        organisation_id: organisationId,
      };
      this.props.save(registryResource);
    }
  };

  fetchDatamarts = (communityId: string) => {
    const { notifyError } = this.props;

    this.setState({ isLoadingDatamarts: true }, () => {
      const datamartsOptions = {
        ...getPaginatedApiParam(1, 1000),
      };

      return this._organisationService
        .getOrganisations(communityId)
        .then(orgsRes => {
          Promise.all(
            orgsRes.data.map(org =>
              this._datamartService.getDatamarts(org.id, datamartsOptions).then(res =>
                res.data.map(datamart => {
                  return {
                    organisation_name: org.name,
                    ...datamart,
                  } as DatamartWithOrgNameResource;
                }),
              ),
            ),
          )
            .then(res => {
              const datamarts: DatamartWithOrgNameResource[] = res.flat();
              this.setState({
                isLoadingDatamarts: false,
                datamarts: datamarts,
                total: datamarts.length,
              });
            })
            .catch(err => {
              this.setState({ isLoadingDatamarts: false });
              notifyError(err);
            });
        })
        .catch(err => {
          this.setState({ isLoadingDatamarts: false });
          notifyError(err);
        });
    });
  };

  componentDidMount() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.fetchDatamarts(organisationId);
  }

  render() {
    const {
      fieldValidators: { isRequired },
      intl: { formatMessage },
      handleSubmit,
      deviceIdRegistry,
    } = this.props;

    const registryTypes: DeviceIdRegistryType[] = [
      DeviceIdRegistryType.CUSTOM_DEVICE_ID,
      DeviceIdRegistryType.MOBILE_VENDOR_ID,
    ];
    const registryTypeOptions: DefaultOptionProps[] = registryTypes.map(t => ({
      title: t,
      value: t,
    }));

    const submitButtonProps: ButtonProps = {
      htmlType: 'submit',
      onClick: () => submit(FORM_ID),
      type: 'primary',
      className: `mcs-form_saveButton_${FORM_ID}`,
    };

    return (
      <Form onSubmit={handleSubmit(this.save) as any}>
        <FormSection title={messages.generalInformation} />

        <FormInputField
          name='name'
          component={FormInput}
          validate={isRequired}
          props={{
            formItemProps: {
              label: formatMessage(messages.deviceIdRegistryName),
              required: true,
            },
            inputProps: {
              placeholder: formatMessage(messages.namePlaceholder),
            },
          }}
        />
        <FormInputField
          name='description'
          component={FormInput}
          props={{
            formItemProps: {
              label: formatMessage(messages.description),
            },
            inputProps: {
              placeholder: formatMessage(messages.descritpionPlaceholder),
            },
          }}
        />
        <FormSelectField
          name='type'
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.deviceIdRegistryType),
            required: true,
          }}
          options={registryTypeOptions}
          disabled={!!deviceIdRegistry}
        />

        <Button
          {...submitButtonProps}
          className={`mcs-primary mcs-saveButton ${`mcs-form_saveButton_${FORM_ID}`}`}
        >
          {formatMessage(messages.save)}
        </Button>
      </Form>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, DeviceIdRegistriesEditFormProps>(
  injectNotifications,
  injectIntl,
  withValidators,
  injectWorkspace,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DeviceIdRegistriesEditForm);
