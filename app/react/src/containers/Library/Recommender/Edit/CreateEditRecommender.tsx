import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../Plugin/Edit/PluginContent';
import RecommenderService from '../../../../services/Library/RecommenderService';
import * as actions from '../../../../state/Notifications/actions';
import {
  PluginProperty,
  Recommender,
  PluginInterface,
} from '../../../../models/Plugins';

import messages from './messages';

interface RecommenderRouteParam {
  organisationId: string;
  recommenderId?: string;
}

interface RecommenderForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateRecommenderState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: RecommenderForm;
  selectedRecommender?: PluginInterface;
}

interface CreateRecommenderProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateRecommenderProps &
  RouteComponentProps<RecommenderRouteParam> &
  InjectedIntlProps;

class CreateEditRecommender extends React.Component<
  JoinedProps,
  CreateRecommenderState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.recommenderId ? true : false,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { edition } = this.state;
    const { match: { params: { recommenderId } } } = this.props;
    if (edition && recommenderId) {
      this.fetchInitialValues(recommenderId);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { match: { params: { organisationId, recommenderId } } } = this.props;
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          recommenderId: nextRecommenderId,
        },
      },
    } = nextProps;

    if (
      (organisationId !== nextOrganisationId ||
        recommenderId !== nextRecommenderId) &&
      nextRecommenderId
    ) {
      this.fetchInitialValues(nextRecommenderId);
    }
  }

  fetchInitialValues = (recommenderId: string) => {
    const fetchRecommender = RecommenderService.getRecommender(
      recommenderId,
    ).then(res => res.data);
    const fetchRecommenderProperties = RecommenderService.getRecommenderProperty(
      recommenderId,
    ).then(res => res.data);
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([fetchRecommender, fetchRecommenderProperties]).then(
          res => {
            this.setState({
              isLoading: false,
              initialValues: {
                plugin: res[0],
                properties: res[1],
              },
            });
          },
        );
      },
    );
  };

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/library/recommenders`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (
    plugin: Recommender,
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
        RecommenderService.updateRecommender(plugin.id, plugin)
          .then(res => {
            return this.updatePropertiesValue(
              properties,
              organisationId,
              plugin.id,
            );
          })
          .then(res => {
            this.setState({ isLoading: false }, () => {
              history.push(`/v2/o/${organisationId}/library/recommenders`);
            });
          })
          .catch(err => notifyError(err));
      });
    }
    // if creation save and redirect
    const formattedFormValues = {
      ...plugin,
      organisation_id: organisationId,
    };
    if (this.state.initialValues) {
      formattedFormValues.artifact_id = this.state.initialValues.plugin.artifact_id;
      formattedFormValues.group_id = this.state.initialValues.plugin.group_id;
    }
    return this.setState({ isLoading: true }, () => {
      RecommenderService.createRecommender(organisationId, formattedFormValues)
        .then(res => res.data)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, res.id);
        })
        .then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/library/recommenders`);
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
        RecommenderService.updateRecommenderProperty(
          organisationId,
          id,
          item.technical_name,
          item,
        ),
      );
    });
    return Promise.all(propertiesPromises);
  };

  onSelect = (bo: PluginInterface) => {
    this.setState({
      initialValues: { plugin: bo },
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
        pluginType={'RECOMMENDER'}
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
  // withDrawer,
  connect(undefined, { notifyError: actions.notifyError }),
)(CreateEditRecommender);
