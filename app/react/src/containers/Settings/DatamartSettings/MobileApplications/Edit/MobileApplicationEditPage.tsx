import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { Layout, message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../../state/Features/selectors';
import {
  MobileApplicationFormData,
  EditMobileAppRouteMatchParam,
  INITIAL_MOBILE_APP_FORM_DATA,
} from './domain';
import ChannelService from '../../../../../services/ChannelService';
import messages from './messages';
import MobileApplicationEditForm, {
  FORM_ID,
} from './MobileApplicationEditForm';
import Loading from '../../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import {
  ChannelResource,
  EventRules,
} from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel } from '../../Common/domain';
import DatamartSelector from '../../../../../containers/Audience/Common/DatamartSelector';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import FormLayoutActionbar, {
  FormLayoutActionbarProps,
} from '../../../../../components/Layout/FormLayoutActionbar';
import { getWorkspace } from '../../../../../state/Session/selectors';
import { UserWorkspaceResource } from '../../../../../models/directory/UserProfileResource';

interface State {
  mobileApplicationData: MobileApplicationFormData;
  loading: boolean;
  selectedDatamartId: string;
}

interface MapStateToProps {
  workspace: (organisationId: string) => UserWorkspaceResource;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditMobileAppRouteMatchParam> &
  MapStateToProps &
  InjectedDatamartProps;

class EditMobileAppPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      mobileApplicationData: INITIAL_MOBILE_APP_FORM_DATA,
      selectedDatamartId:
        props.workspace(props.match.params.organisationId).datamarts.length > 1
          ? ''
          : props.datamart.id,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: {
          mobileApplicationId: mobileApplicationIdFromURLParam,
          organisationId,
        },
      },
      location,
    } = this.props;

    const mobileApplicationIdFromLocState =
      location.state && location.state.mobileApplicationId;

    const mobileApplicationId =
      mobileApplicationIdFromURLParam || mobileApplicationIdFromLocState;

    if (mobileApplicationId) {
      const getMobileApplication = ChannelService.getChannel(
        this.props.datamart.id,
        mobileApplicationId,
      );
      const getEventRules = ChannelService.getEventRules(
        this.props.datamart.id,
        mobileApplicationId,
        organisationId,
      );
      Promise.all([getMobileApplication, getEventRules])
        .then(res => {
          const formData = {
            mobileapplication: res[0].data,
            visitAnalyzerFields: res[0].data.visit_analyzer_model_id
              ? [
                  createFieldArrayModel({
                    visit_analyzer_model_id:
                      res[0].data.visit_analyzer_model_id,
                  }),
                ]
              : [],
            eventRulesFields: res[1].data.map((er: EventRules) =>
              createFieldArrayModel(er),
            ),
          };
          return formData;
        })
        .then(formData =>
          this.setState({
            loading: false,
            mobileApplicationData: formData,
            selectedDatamartId: formData.mobileapplication.datamart_id,
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
      match: {
        params: { organisationId, mobileApplicationId },
      },
      notifyError,
      history,
      intl,
      datamart,
    } = this.props;

    const { mobileApplicationData, selectedDatamartId } = this.state;

    let datamartId: string;
    if (mobileApplicationId) {
      datamartId = mobileApplicationData.mobileapplication.datamart_id
        ? mobileApplicationData.mobileapplication.datamart_id
        : datamart.id;
    } else {
      datamartId = selectedDatamartId;
    }

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    const getVisitAnalyzerId = (
      visitAnalyzerFields: VisitAnalyzerFieldModel[],
    ) => {
      if (
        visitAnalyzerFields.length &&
        visitAnalyzerFields[0].model &&
        visitAnalyzerFields[0].model.visit_analyzer_model_id
      ) {
        return visitAnalyzerFields[0].model.visit_analyzer_model_id;
      }
      return null;
    };

    const generateEventRulesTasks = (
      channel: ChannelResource,
    ): Array<Promise<any>> => {
      const startIds = this.state.mobileApplicationData.eventRulesFields.map(
        erf => erf.model.id,
      );
      const savedIds: string[] = [];
      const saveCreatePromises = mobileApplicationFormData.eventRulesFields.map(
        erf => {
          if (!erf.model.id) {
            return ChannelService.createEventRules(datamartId, channel.id, {
              organisation_id: organisationId,
              properties: {
                ...erf.model,
                datamart_id: datamartId,
                site_id: channel.id,
              },
            });
          } else if (startIds.includes(erf.model.id)) {
            savedIds.push(erf.model.id);
            return ChannelService.updateEventRules(
              datamartId,
              channel.id,
              organisationId,
              erf.model.id,
              {
                ...erf.model,
                datamart_id: datamartId,
                site_id: channel.id,
              },
            );
          }
          return Promise.resolve();
        },
      );
      const deletePromises = startIds.map(
        sid =>
          sid && !savedIds.includes(sid)
            ? ChannelService.deleteEventRules(
                datamartId,
                channel.id,
                organisationId,
                sid,
              )
            : Promise.resolve(),
      );
      return [...saveCreatePromises, ...deletePromises];
    };

    const generateAllPromises = (
      channel: ChannelResource,
    ): Array<Promise<any>> => {
      return [...generateEventRulesTasks(channel)];
    };

    const generateSavingPromise = (): Promise<any> => {
      if (mobileApplicationFormData.mobileapplication.id) {
        const type: 'MOBILE_APPLICATION' = 'MOBILE_APPLICATION';
        const mbApp = {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(
            mobileApplicationFormData.visitAnalyzerFields,
          ),
          type: type,
        };
        // TODO: use ChannelService.updateChannel when available
        return ChannelService.updateMobileApplication(
          datamartId,
          mobileApplicationFormData.mobileapplication.id,
          mbApp,
        ).then(channel => {
          Promise.all(generateAllPromises(channel.data));
        });
      }

      return ChannelService.createChannel(
        this.props.match.params.organisationId,
        datamartId,
        {
          ...mobileApplicationFormData.mobileapplication,
          visit_analyzer_model_id: getVisitAnalyzerId(
            mobileApplicationFormData.visitAnalyzerFields,
          ),
          type: 'MOBILE_APPLICATION',
        },
      ).then(channel => {
        Promise.all(generateAllPromises(channel.data));
      });
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const mobileApplicationUrl = `/v2/o/${organisationId}/settings/datamart/mobile_applications`;
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
      match: {
        params: { organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/mobile_applications`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamartId: datamart.id,
    });
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { loading, mobileApplicationData, selectedDatamartId } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const mobileName =
      mobileApplicationData.mobileapplication &&
      mobileApplicationData.mobileapplication.name
        ? formatMessage(messages.editMobileApplicationTitle, {
            name: mobileApplicationData.mobileapplication.name,
          })
        : formatMessage(messages.createMobileApplicationTitle);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/settings/datamart/mobile_applications`,
      },
      {
        name: mobileName,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    return selectedDatamartId ? (
      <MobileApplicationEditForm
        initialValues={mobileApplicationData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        onSubmitFail={this.onSubmitFail}
      />
    ) : (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <DatamartSelector onSelect={this.onDatamartSelect} />
      </Layout>
    );
  }
}

const mapStateToProps = (state: any) => ({
  workspace: getWorkspace(state),
  hasFeature: FeatureSelectors.hasFeature(state),
});

export default compose(
  withRouter,
  injectIntl,
  injectDatamart,
  connect(mapStateToProps),
  injectNotifications,
)(EditMobileAppPage);
