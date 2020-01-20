import * as React from 'react';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import queryString from 'query-string';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  UserAccountCompartmentDatamartSelectionResource,
  DatamartResource,
  UserAccountCompartmentResource,
} from '../../../../../models/datamart/DatamartResource';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import DatamartSelector from '../../../../Audience/Common/DatamartSelector';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import messages from './messages';
import CompartmentEditForm, { FORM_ID } from './CompartmentEditForm';
import { CompartmentFormData, EditCompartmentRouteMatchParam } from './domain';
import { IDatamartService } from '../../../../../services/DatamartService';
import { InjectedDatamartProps, injectDatamart } from '../../../../Datamart';
import { Loading } from '../../../../../components';
import { DataResponse } from '../../../../../services/ApiService';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';

interface State {
  compartmentFormData: CompartmentFormData;
  loading: boolean;
  selectedDatamartId?: string;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditCompartmentRouteMatchParam> &
  InjectedDatamartProps;

class CompartmentEditPage extends React.Component<Props, State> {

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      compartmentFormData: {},
      selectedDatamartId:
        queryString.parse(props.location.search).selectedDatamartId ||
        props.match.params.datamartId,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: {
          compartmentId: compartmentIdFromURLParam,
          datamartId,
          organisationId,
        },
      },
      location,
      history,
      notifyError,
    } = this.props;

    const compartmentIdFromLocState =
      location.state && location.state.compartmentId;

    const compartmentId =
      compartmentIdFromURLParam || compartmentIdFromLocState;

    if (compartmentId) {
      this._datamartService.getUserAccountCompartmentDatamartSelectionResource(
        datamartId,
        compartmentId,
      )
        .then(res => {
          const compartment = res.data;
          this.setState({
            compartmentFormData: compartment,
            loading: false,
            selectedDatamartId: compartment.datamart_id,
          });
        })
        .catch(err => {
          const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/compartments`;
          notifyError(err);
          history.push(defaultRedirectUrl);
        });
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  save = (
    compartmentFormData: Partial<
      UserAccountCompartmentDatamartSelectionResource
    >,
  ) => {
    const {
      history,
      notifyError,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const redirectUrl = `/v2/o/${organisationId}/settings/datamart/compartments`;

    const returnedPromise: Promise<DataResponse<
      UserAccountCompartmentDatamartSelectionResource
    >> = compartmentFormData.id
      ? this.updateCompartment(
          compartmentFormData.datamart_id!,
          compartmentFormData.compartment_id!,
          compartmentFormData,
        )
      : this.createCompartment(organisationId, compartmentFormData);

    returnedPromise
      .then(() => {
        history.push(redirectUrl);
      })
      .catch(err => {
        notifyError(err);
        history.push(redirectUrl);
      });
  };

  updateCompartment = (
    datamartId: string,
    compartmentId: string,
    compartmentFormData: Partial<
      UserAccountCompartmentDatamartSelectionResource
    >,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> => {
    const updatedUserAccountCompartment: Partial<UserAccountCompartmentResource> = {
      token: compartmentFormData.token,
      name: compartmentFormData.name,
    };

    return this._datamartService.updateUserAccountCompartment(
      compartmentId,
      updatedUserAccountCompartment,
    ).then(_ => {
      const updatedCompartmentDatamartSelection: Partial<UserAccountCompartmentDatamartSelectionResource> = {
        default: compartmentFormData.default,
      };

      return this._datamartService.updateUserAccountCompartmentDatamartSelectionResource(
        datamartId,
        compartmentFormData.id!,
        updatedCompartmentDatamartSelection,
      );
    });
  };

  createCompartment = (
    organisationId: string,
    compartmentFormData: Partial<
      UserAccountCompartmentDatamartSelectionResource
    >,
  ): Promise<DataResponse<UserAccountCompartmentDatamartSelectionResource>> => {
    const partialUserAccountCompartment: Partial<UserAccountCompartmentResource> = {
      organisation_id: organisationId,
      token: compartmentFormData.token,
      name: compartmentFormData.name,
    };

    return this._datamartService.createUserAccountCompartment(
      partialUserAccountCompartment,
    ).then(res => {
      const returnedUserAccountCompartment = res.data;

      const partialCompartmentDatamartSelection: Partial<UserAccountCompartmentDatamartSelectionResource> = {
        datamart_id: compartmentFormData.datamart_id,
        compartment_id: returnedUserAccountCompartment.id,
        default: compartmentFormData.default,
      };
      return this._datamartService.createUserAccountCompartmentDatamartSelectionResource(
        compartmentFormData.datamart_id!,
        partialCompartmentDatamartSelection,
      );
    });
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/compartments`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onSelectDatamart = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamartId: datamart.id,
      compartmentFormData: {
        datamart_id: datamart.id,
      },
    });
  };

  goToDatamartSelector = () => {
    const {
      match: {
        params: { compartmentId },
      },
    } = this.props;

    if (!compartmentId) {
      this.setState({
        selectedDatamartId: undefined,
      });
    }
  };

  getDatamartId = () => {
    const {
      match: {
        params: { compartmentId },
      },
      datamart,
    } = this.props;

    const { compartmentFormData, selectedDatamartId } = this.state;

    let datamartId: string | undefined;
    if (compartmentId) {
      datamartId = compartmentFormData.datamart_id
        ? compartmentFormData.datamart_id
        : datamart.id;
    } else {
      datamartId = selectedDatamartId;
    }
    return datamartId;
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;

    const { loading, compartmentFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle,
        path: `/v2/o/${organisationId}/settings/datamart/compartments`,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    const datamartId = this.getDatamartId();

    return datamartId ? (
      <CompartmentEditForm
        initialValues={compartmentFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        datamartId={datamartId}
        goToDatamartSelector={this.goToDatamartSelector}
      />
    ) : (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <DatamartSelector onSelect={this.onSelectDatamart} />
      </Layout>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  injectDatamart,
)(CompartmentEditPage);
