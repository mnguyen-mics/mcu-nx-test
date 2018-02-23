import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../state/Features/selectors';
import {
  EditDatamartRouteMatchParam,
  INITIAL_DATAMART_FORM_DATA,
  DatamartFormData,
} from './domain';
import DatamartService from '../../../../services/DatamartService';
import messages from './messages';
import DatamartEditForm from './DatamartEditForm';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../Datamart';
import { createFieldArrayModel } from '../../../../utils/FormHelper';
import { EventRules } from '../../../../models/settings/settings';
import { DatamartResource } from '../../../../models/datamart/DatamartResource';

interface State {
  datamartFormData: DatamartFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditDatamartRouteMatchParam> &
  InjectedDatamartProps;

class DatamartEditPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      datamartFormData: INITIAL_DATAMART_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId: datamartIdFromURLParam, organisationId },
      },
      location,
    } = this.props;

    const datamartIdFromLocState =
      location.state && location.state.datamartId;

    const datamartId =
      datamartIdFromURLParam || datamartIdFromLocState;

    if (datamartId) {
      const getSites = DatamartService.getDatamart(
        datamartId,
      );
      const getEventRules = DatamartService.getEventRules(
        datamartId,
        organisationId,
      );

      Promise.all([getSites, getEventRules]).then(res => {
          const formData = {
            datamart: res[0].data,
            eventRulesFields: res[1].data.map((er: EventRules) => createFieldArrayModel(er)),
          };
          return formData;
        })
        .then((formData: DatamartFormData) =>
          this.setState({
            loading: false,
            datamartFormData: formData,
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

  save = (datamartFormData: DatamartFormData) => {
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


    const generateEventRulesTasks = (dmrt: DatamartResource): Array<Promise<any>> => {
      const startIds = this.state.datamartFormData.eventRulesFields.map(erf => erf.model.id)
      const savedIds: string[] = [];
      const saveCreatePromises = datamartFormData.eventRulesFields.map(erf => {
        if (!erf.model.id) {
          return DatamartService.createEventRules(dmrt.id, { organisation_id: organisationId, properties: {...erf.model, datamart_id: dmrt.id, site_id: dmrt.id} })
        } else if (startIds.includes(erf.model.id)) {
          savedIds.push(erf.model.id);
          return DatamartService.updateEventRules(dmrt.id, organisationId, erf.model.id, {...erf.model, datamart_id: dmrt.id, site_id: dmrt.id})
        }
        return Promise.resolve();
      });
      const deletePromises = startIds.map(sid => sid && !savedIds.includes(sid) ? DatamartService.deleteEventRules(dmrt.id, organisationId, sid) : Promise.resolve())
      return [...saveCreatePromises, ...deletePromises]
    }

    const generateSavingPromise = (): Promise<
      any
    > => {
      if (datamartFormData.datamart.id) {
        const dtmrt = {
          ...datamartFormData.datamart,
        };

        return DatamartService.updateDatamart(
            datamartFormData.datamart.id,
          dtmrt,
        ).then((datamart) => Promise.all(generateEventRulesTasks(datamart.data)));
      }

      return DatamartService.createDatamart(
        this.props.match.params.organisationId,
        datamartFormData.datamart,
      ).then((datamart) => Promise.all(generateEventRulesTasks(datamart.data)));
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const mobileApplicationUrl = `/v2/o/${organisationId}/settings?tab=sites`;
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

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings?tab=sites`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, datamartFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const datamartName =
    datamartFormData.datamart &&
    datamartFormData.datamart.name
        ? formatMessage(messages.editDatamartTitle, {
            name: datamartFormData.datamart.name,
          })
        : formatMessage(messages.createDatamartTitle);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/settings?tab=sites`,
      },
      {
        name: datamartName,
      },
    ];

    return (
      <DatamartEditForm
        initialValues={datamartFormData}
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
)(DatamartEditPage);
