import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';

import * as FeatureSelectors from '../../../../../state/Features/selectors';
import {
  EditSiteRouteMatchParam,
  INITIAL_SITE_FORM_DATA,
  SiteFormData,
} from './domain';
import SiteService from '../../../../../services/SiteService';
import messages from './messages';
import SiteEditForm from './SiteEditForm';
import Loading from '../../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
import { createFieldArrayModel } from '../../../../../utils/FormHelper';
import { SiteResource, EventRules } from '../../../../../models/settings/settings';
import { VisitAnalyzerFieldModel } from '../../Common/domain';

interface State {
  siteFormData: SiteFormData;
  loading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<EditSiteRouteMatchParam> &
  InjectedDatamartProps;

class SiteEditPage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true, // default true to avoid render x2 on mounting
      siteFormData: INITIAL_SITE_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { siteId: siteIdFromURLParam, organisationId },
      },
      location,
    } = this.props;

    const siteIdFromLocState =
      location.state && location.state.siteId;

    const siteId =
      siteIdFromURLParam || siteIdFromLocState;

    if (siteId) {
      const getSites = SiteService.getSite(
        this.props.datamart.id,
        siteId,
      );
      const getEventRules = SiteService.getEventRules(
        this.props.datamart.id,
        siteId,
        organisationId,
      );
      const getAliases = SiteService.getAliases(
        this.props.datamart.id,
        siteId,
        organisationId,
      )

      Promise.all([getSites, getEventRules, getAliases]).then(res => {
          const formData = {
            site: res[0].data,
            visitAnalyzerFields: res[0].data.visit_analyzer_model_id ? [
              createFieldArrayModel({
                visit_analyzer_model_id: res[0].data.visit_analyzer_model_id,
              }),
            ] : [],
            eventRulesFields: res[1].data.map((er: EventRules) => createFieldArrayModel(er)),
            aliases: res[2].data.map(al => createFieldArrayModel(al))
          };
          return formData;
        })
        .then((formData: SiteFormData) =>
          this.setState({
            loading: false,
            siteFormData: formData,
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

  save = (siteFormData: SiteFormData) => {
    const {
      match: { params: { organisationId } },
      notifyError,
      history,
      intl,
      datamart
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

    const generateEventRulesTasks = (site: SiteResource): Array<Promise<any>> => {
      const startIds = this.state.siteFormData.eventRulesFields.map(erf => erf.model.id)
      const savedIds: string[] = [];
      const saveCreatePromises = siteFormData.eventRulesFields.map(erf => {
        if (!erf.model.id) {
          return SiteService.createEventRules(datamart.id, site.id, { organisation_id: organisationId, properties: {...erf.model, datamart_id: datamart.id, site_id: site.id} })
        } else if (startIds.includes(erf.model.id)) {
          savedIds.push(erf.model.id);
          return SiteService.updateEventRules(datamart.id, site.id, organisationId, erf.model.id, {...erf.model, datamart_id: datamart.id, site_id: site.id})
        }
        return Promise.resolve();
      });
      const deletePromises = startIds.map(sid => sid && !savedIds.includes(sid) ? SiteService.deleteEventRules(datamart.id, site.id, organisationId, sid) : Promise.resolve())
      return [...saveCreatePromises, ...deletePromises]
    }

    const generateAliasesTasks = (site: SiteResource): Array<Promise<any>> => {
      const startId = this.state.siteFormData.aliases.map(alias => alias.model.id)
      const savedIds: string[] = [];
      const saveCreatePromises = siteFormData.aliases.map(alias => {
        if (!alias.model.id) {
          return SiteService.createAliases(datamart.id, site.id, { organisation_id: organisationId, site_id: site.id, name: alias.model.name })
        } else if (startId.includes(alias.model.id)) {
          savedIds.push(alias.model.id);
          return SiteService.updateAliases(datamart.id, site.id, organisationId, alias.model.id, {...alias.model, site_id: site.id, organisation_id: organisationId})
        }
        return Promise.resolve();
      });
      const deletePromises = startId.map(sid => sid && !savedIds.includes(sid) ? SiteService.deleteAliases(datamart.id, site.id, organisationId, sid) : Promise.resolve())
      return [...saveCreatePromises, ...deletePromises]
    }

    const generateAllPromises = (site: SiteResource): Array<Promise<any>> => {
      return [...generateEventRulesTasks(site), ...generateAliasesTasks(site)]
    }

    const generateSavingPromise = (): Promise<
      any
    > => {
      if (siteFormData.site.id) {
        const mbApp = {
          ...siteFormData.site,
          visit_analyzer_model_id: getVisitAnalyzerId(siteFormData.visitAnalyzerFields),
        };

        return SiteService.updateSite(
          this.props.datamart.id,
          siteFormData.site.id,
          mbApp,
        ).then((site) => Promise.all(generateAllPromises(site.data)));
      }

      return SiteService.createSite(
        this.props.match.params.organisationId,
        this.props.datamart.id,
        {
          ...siteFormData.site,
          visit_analyzer_model_id: getVisitAnalyzerId(siteFormData.visitAnalyzerFields),
          type: 'SITE',
        },
      ).then((site) => Promise.all(generateAllPromises(site.data)));
    };

    generateSavingPromise()
      .then(() => {
        hideSaveInProgress();
        const mobileApplicationUrl = `/v2/o/${organisationId}/settings/datamart/sites`;
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

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/sites`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { loading, siteFormData } = this.state;

    if (loading) {
      return <Loading className="loading-full-screen" />;
    }

    const mobileName =
    siteFormData.site &&
    siteFormData.site.name
        ? formatMessage(messages.editSiteTitle, {
            name: siteFormData.site.name,
          })
        : formatMessage(messages.createSiteTitle);

    const breadcrumbPaths = [
      {
        name: messages.breadcrumbTitle1,
        path: `/v2/o/${organisationId}/settings/datamart/sites`,
      },
      {
        name: mobileName,
      },
    ];

    return (
      <SiteEditForm
        initialValues={siteFormData}
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
)(SiteEditPage);
