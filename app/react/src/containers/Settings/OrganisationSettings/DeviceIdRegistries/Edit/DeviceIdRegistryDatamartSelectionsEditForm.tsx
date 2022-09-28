import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Button, ButtonProps, Row } from 'antd';
import { compose } from 'recompose';
import messages from '../messages';
import { ValidatorProps } from '@mediarithmics-private/advanced-components/lib/components/form/withValidators';
import { Form, getFormValues, InjectedFormProps, reduxForm, submit } from 'redux-form';
import { connect } from 'react-redux';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';
import { TableViewFilters } from '@mediarithmics-private/mcs-components-library';
import { DataColumnDefinition } from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';
import { InjectedWorkspaceProps, injectWorkspace } from '../../../../Datamart';
import { IOrganisationService } from '../../../../../services/OrganisationService';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IDatamartService } from '../../../../../services/DatamartService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { FormSection } from '../../../../../components/Form';
import {
  DeviceIdRegistryDatamartSelectionResource,
  DeviceIdRegistryResource,
} from '../../../../../models/deviceIdRegistry/DeviceIdRegistryResource';

export const FORM_ID = 'newRegistryForm';

interface DeviceIdRegistryDatamartSelectionsEditFormState {
  isLoadingDatamarts: boolean;
  datamarts: DatamartWithOrgNameResource[];
  selectedRowKeys: string[];
  allRowsAreSelected: boolean;
  datamartsTotal: number;
  selectionsTotal: number;
}

interface DeviceIdRegistryDatamartSelectionsEditFormProps {
  initialSelections: DeviceIdRegistryDatamartSelectionResource[];
  deviceIdRegistry: DeviceIdRegistryResource;
  handleSave: (deviceIdRegistryId: string, selectedDatamartIds: string[]) => void;
}

interface RouterProps {
  organisationId: string;
}

type Props = DeviceIdRegistryDatamartSelectionsEditFormProps &
  RouteComponentProps<RouterProps> &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedFormProps<any, DeviceIdRegistryDatamartSelectionsEditFormProps> &
  ValidatorProps &
  InjectedWorkspaceProps;

interface DatamartWithOrgNameResource extends DatamartResource {
  organisation_name: string;
}

class DeviceIdRegistryDatamartSelectionsEditForm extends React.Component<
  Props,
  DeviceIdRegistryDatamartSelectionsEditFormState
> {
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
      datamartsTotal: 0,
      selectionsTotal: 0,
    };
  }

  save = (): any => {
    const { deviceIdRegistry } = this.props;
    const { selectedRowKeys } = this.state;

    this.props.handleSave(deviceIdRegistry.id, selectedRowKeys);
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

    const datamartsOptions = {
      ...getPaginatedApiParam(1, 1000),
    };

    this.setState({ isLoadingDatamarts: true }, () => {
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
                datamartsTotal: datamarts.length,
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

  fetchDatamartsAndSelections = (communityId: string, deviceIdRegistryId: string) => {
    const { initialSelections } = this.props;
    const datamartIds = initialSelections.map(selection => selection.datamart_id);

    this.setState({
      selectedRowKeys: datamartIds,
      selectionsTotal: datamartIds.length,
    });

    return Promise.all([this.fetchDatamarts(communityId)]);
  };

  componentDidMount() {
    const {
      deviceIdRegistry,
      match: {
        params: { organisationId },
      },
    } = this.props;

    this.fetchDatamartsAndSelections(organisationId, deviceIdRegistry.id);
  }

  render() {
    const {
      intl: { formatMessage },
      handleSubmit,
    } = this.props;

    const { selectedRowKeys, allRowsAreSelected } = this.state;

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
        <FormSection title={messages.enableDatamarts} />

        <Row className='mcs-table-container'>
          <TableViewFilters
            pagination={false}
            columns={dataColumns}
            dataSource={this.state.datamarts}
            className='mcs-deviceIdRegistryDatamartSelectionsTable'
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

export default compose<Props, DeviceIdRegistryDatamartSelectionsEditFormProps>(
  injectNotifications,
  injectIntl,
  injectWorkspace,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(DeviceIdRegistryDatamartSelectionsEditForm);
