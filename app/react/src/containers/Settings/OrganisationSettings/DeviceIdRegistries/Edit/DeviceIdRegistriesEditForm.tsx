import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Button, ButtonProps, Row } from 'antd';
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
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../Datamart';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IDatamartService } from '../../../../../services/DatamartService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DefaultOptionProps } from '../../../../../components/Form/FormSelect/DefaultSelect';

export const FORM_ID = 'newRegistryForm';

interface DeviceIdRegistriesEditFormState {
  isLoadingDatamarts: boolean;
  datamarts: DatamartWithOrgNameResource[];
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  total: number;
}

interface DeviceIdRegistriesEditFormProps {
  save: (registry: Partial<DeviceIdRegistryResource>, datamartIds: string[]) => void;
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

type DeviceIdRegistryFormData = Partial<DeviceIdRegistryResource>;

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
      selectedRowKeys: [],
      allRowsAreSelected: false,
      total: 0,
    };
  }

  save = (formData: DeviceIdRegistryFormData): any => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { selectedRowKeys } = this.state;

    const registryResource: Partial<DeviceIdRegistryResource> = {
      ...formData,
      community_id: organisationId,
    };
    this.props.save(registryResource, selectedRowKeys);
  };

  onSelectChange = (selectedRowKeys: string[]) => {
    this.setState({ selectedRowKeys });
  };

  selectAllItemIds = () => {
    this.setState({
      allRowsAreSelected: true,
    });
  };

  unselectAllItemIds = () => {
    this.setState({
      selectedRowKeys: [],
      allRowsAreSelected: false,
    });
  };

  unsetAllItemsSelectedFlag = () => {
    this.setState({
      allRowsAreSelected: false,
    });
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
    } = this.props;

    const { selectedRowKeys, allRowsAreSelected } = this.state;

    const registryTypes: DeviceIdRegistryType[] = ['CUSTOM_DEVICE_ID', 'MOBILE_VENDOR_ID'];
    const registryTypeOptions: DefaultOptionProps[] = registryTypes.map(t => ({
      title: t,
      value: t,
    }));

    const dataColumns: Array<DataColumnDefinition<DatamartWithOrgNameResource>> = [
      {
        title: formatMessage(messages.organisationName),
        key: 'organisation_name',
        sorter: (a: DatamartWithOrgNameResource, b: DatamartWithOrgNameResource) =>
          a.organisation_name.localeCompare(b.organisation_name),
        isHideable: false,
      },
      {
        title: formatMessage(messages.datamartName),
        key: 'name',
        sorter: (a: DatamartWithOrgNameResource, b: DatamartWithOrgNameResource) =>
          a.name.localeCompare(b.name),
        isHideable: false,
      },
    ];

    const rowSelection = {
      selectedRowKeys,
      allRowsAreSelected: allRowsAreSelected,
      onChange: this.onSelectChange,
      selectAllItemIds: this.selectAllItemIds,
      unselectAllItemIds: this.unselectAllItemIds,
      onSelectAll: this.unsetAllItemsSelectedFlag,
      onSelect: this.unsetAllItemsSelectedFlag,
    };

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
        />

        <FormSection title={messages.enableDatamarts} />

        <Row className='mcs-table-container'>
          <TableViewFilters
            pagination={false}
            columns={dataColumns}
            dataSource={this.state.datamarts}
            className='mcs-deviceIdRegistryCreation_datamartsSelectionTable'
            loading={this.state.isLoadingDatamarts}
            rowSelection={rowSelection}
          />
        </Row>

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
