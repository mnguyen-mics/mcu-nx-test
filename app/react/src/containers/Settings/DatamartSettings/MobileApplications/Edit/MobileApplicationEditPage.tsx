import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../../state/Features/selectors';
import {
  MobileApplicationFormData,
  EditMobileAppRouteMatchParam,
  INITIAL_MOBILE_APP_FORM_DATA,
} from './domain';
import MobileApplicationService from '../../../../../services/MobileApplicationService';
import messages from './messages';
import MobileApplicationEditForm from './MobileApplicationEditForm';
import Loading from '../../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import { MobileApplicationResource } from '../../../../../models/settings/settings';
import { DataResponse } from '../../../../../services/ApiService';
import { VisitAnalyzerFieldModel } from '../../Common/domain';

interface State {
  mobileApplicationFormData: MobileApplicationFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditMobileAppRouteMatchParam> &
  InjectedDatamartProps;

class EditMobileAppPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      mobileApplicationFormData: INITIAL_MOBILE_APP_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { mobileApplicationId: mobileApplicationIdFromURLParam },
      },
      location,
    } = this.props;

    const mobileApplicationIdFromLocState =
      location.state && location.state.mobileApplicationId;

    const mobileApplicationId =
      mobileApplicationIdFromURLParam || mobileApplicationIdFromLocState;

    if (mobileApplicationId) {
      MobileApplicationService.getMobileApplication(
        this.props.datamart.id,
        mobileApplicationId,
      )
        .then(res => {
          const formData = {
            mobileapplication: res.data,
            visitAnalyzerFields: res.data.visit_analyzer_model_id ? [
              createFieldArrayModel({
                visit_analyzer_model_id: res.data.visit_analyzer_model_id,
              }),
            ] : [],
          };
          return formData;
        })
        .then(formData =>
          this.setState({
            loading: false,
            mobileApplicationFormData: formData,
          }),
        );
    } else {
      this.setState({ loading: false });
    }
  }

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  save = (mobileApplicationFormData: MobileApplicationFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
      intl,
    } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    const getVisitAnalyzerId = (visitAnalyzerFields: VisitAnalyzerFieldModel[]) => {
      if (visitAnalyzerFields.length && visitAnalyzerFields[0].model && visitAnalyzerFields[0].model.visit_analyzer_model_id) {
        return visitAnalyzerFields[0].model.visit_analyzer_model_id
      }
      return null;
    }

    const generateSavingPromise = (): Promise<
      DataResponse<MobileApplicationResource>
    > => {
      if (mobileApplicationFormData.mobileapplication.id) {
        const mbApp = {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(mobileApplicationFormData.visitAnalyzerFields),
        };

        return MobileApplicationService.updateMobileApplication(
          this.props.datamart.id,
          mobileApplicationFormData.mobileapplication.id,
          mbApp,
        );
      }

      return MobileApplicationService.createMobileApplication(
        this.props.match.params.organisationId,
        this.props.datamart.id,
        {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(mobileApplicationFormData.visitAnalyzerFields),
          type: 'MOBILE_APPLICATION',
        },
      );
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const mobileApplicationUrl = `/v2/o/${organisationId}/settings/datamart?tab=mobile_applications`;
        history.push(mobileApplicationUrl);
      })
      .catch(err => {
        hideSaveInProgress();
        notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onClose = () => {
    const {
      history,
      location,
      match: { params: { organisationId } },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart?tab=mobile_applications`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, mobileApplicationFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const mobileName =
      mobileApplicationFormData.mobileapplication &&
      mobileApplicationFormData.mobileapplication.name
        ? formatMessage(messages.editMobileApplicationTitle, {
            name: mobileApplicationFormData.mobileapplication.name,
          })
        : formatMessage(messages.createMobileApplicationTitle);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/settings/datamart?tab=mobile_application`,
      },
      {
        name: mobileName,
      },
    ];

    return (
      <MobileApplicationEditForm
        initialValues={mobileApplicationFormData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(state => ({ hasFeature: FeatureSelectors.hasFeature(state) })),
  injectNotifications,
)(EditMobileAppPage);
