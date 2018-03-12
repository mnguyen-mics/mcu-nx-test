import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../../Plugin/Edit/PluginContent';
import AttributionModelService from '../../../../../services/Library/AttributionModelService';
import * as actions from '../../../../../state/Notifications/actions';
import { AttributionModel, PluginProperty } from '../../../../../models/Plugins';

import messages from './messages';

interface AttributionModelRouteParam {
  organisationId: string;
  attributionModelId?: string;
}

interface AttributionModelForm {
  plugin: AttributionModel;
  properties?: PluginProperty[];
}

interface CreateAttributionModelState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: AttributionModelForm;
}

interface CreateAttributionModelProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateAttributionModelProps &
  RouteComponentProps<AttributionModelRouteParam> &
  InjectedIntlProps;

class CreateAttributionModel extends React.Component<
  JoinedProps,
  CreateAttributionModelState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.attributionModelId ? true : false,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { edition } = this.state;
    const { match: { params: { attributionModelId } } } = this.props;
    if (edition && attributionModelId) {
      this.fetchInitialValues(attributionModelId);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, attributionModelId } },
    } = this.props;
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          attributionModelId: nextAttributionModelId,
        },
      },
    } = nextProps;

    if (
      (organisationId !== nextOrganisationId ||
        attributionModelId !== nextAttributionModelId) &&
      nextAttributionModelId
    ) {
      this.fetchInitialValues(nextAttributionModelId);
    }
  }

  fetchInitialValues = (attributionModelId: string) => {
    const fetchAttributionModel = AttributionModelService.getAttributionModel(
      attributionModelId,
    ).then(res => res.data);
    const fetchAttributionModelProperties = AttributionModelService.getAttributionModelProperties(
      attributionModelId,
    ).then(res => res.data);
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([
          fetchAttributionModel,
          fetchAttributionModelProperties,
        ]).then(res => {
          this.setState({
            isLoading: false,
            initialValues: {
              plugin: res[0],
              properties: res[1],
            },
          });
        });
      },
    );
  };

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/attribution_models`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (
    plugin: AttributionModel,
    properties: PluginProperty[],
  ) => {
    const { edition } = this.state;

    const {
      match: { params: { organisationId } },
      history,
      notifyError,
    } = this.props;

    // if edition update and redirect
    if (edition) {
      return this.setState({ isLoading: true }, () => {
        AttributionModelService.updateAttributionModel(plugin.id, plugin)
          .then(res => {
            return this.updatePropertiesValue(
              properties,
              organisationId,
              plugin.id,
            );
          })
          .then(res => {
            this.setState({ isLoading: false }, () => {
              history.push(
                `/v2/o/${organisationId}/settings/campaigns/attribution_models`,
              );
            });
          })
          .catch(err => notifyError(err));
      });
    }
    // if creation save and redirect
    const formattedFormValues = {
      ...plugin,
    };
    if (this.state.initialValues) {
      formattedFormValues.artifact_id = this.state.initialValues.plugin.artifact_id;
      formattedFormValues.group_id = this.state.initialValues.plugin.group_id;
      formattedFormValues.mode = this.state.initialValues.plugin.mode;
    }
    return this.setState({ isLoading: true }, () => {
      AttributionModelService.createAttributionModel(
        organisationId,
        formattedFormValues,
      )
        .then(res => res.data)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, res.id);
        })
        .then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/settings/campaigns/attribution_models`);
          });
        })
        .catch(err => notifyError(err));
    });
  };

  updatePropertiesValue = (
    properties: PluginProperty[],
    organisationId: string,
    id: string,
  ) => {
    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(
        AttributionModelService.updateAttributionModelProperty(
          organisationId,
          id,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };

  onSelect = (model: AttributionModel) => {
    this.setState({
      initialValues: { plugin: model },
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    const { isLoading } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.attributionModelBreadcrumb) },
    ];

    return (
      <PluginContent
        pluginType={'ATTRIBUTION_PROCESSOR'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={this.redirect}
        onSelect={this.onSelect}
        editionMode={this.state.edition}
        initialValue={this.state.initialValues}
        loading={isLoading}
      />
    );
  }
}

export default compose(
  injectIntl,
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateAttributionModel);
