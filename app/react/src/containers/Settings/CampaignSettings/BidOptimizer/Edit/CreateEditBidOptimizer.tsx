import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../../Plugin/Edit/PluginContent';
import BidOptimizerService from '../../../../../services/Library/BidOptimizerService';
import {
  PluginProperty,
  BidOptimizer,
  PluginInterface,
} from '../../../../../models/Plugins';

import messages from './messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';

interface BidOptimizerRouteParam {
  organisationId: string;
  bidOptimizerId?: string;
}

interface BidOptimizerForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateBidOptimizerState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: BidOptimizerForm;
  selectedBidOptimizer?: PluginInterface;
}

type JoinedProps = InjectedNotificationProps &
  RouteComponentProps<BidOptimizerRouteParam> &
  InjectedIntlProps;

class CreateEditBidOptimizer extends React.Component<
  JoinedProps,
  CreateBidOptimizerState
> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.bidOptimizerId ? true : false,
      isLoading: true,
    };
  }

  componentDidMount() {
    const { edition } = this.state;
    const { match: { params: { bidOptimizerId } } } = this.props;
    if (edition && bidOptimizerId) {
      this.fetchInitialValues(bidOptimizerId);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, bidOptimizerId } },
    } = this.props;
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          bidOptimizerId: nextBidOptimizerId,
        },
      },
    } = nextProps;

    if (
      (organisationId !== nextOrganisationId ||
        bidOptimizerId !== nextBidOptimizerId) &&
      nextBidOptimizerId
    ) {
      this.fetchInitialValues(nextBidOptimizerId);
    }
  }

  fetchInitialValues = (bidOptimizerId: string) => {
    const fetchBidOptimizer = BidOptimizerService.getBidOptimizer(
      bidOptimizerId,
    ).then(res => res.data);
    const fetchBidOptimizerProperties = BidOptimizerService.getBidOptimizerProperty(
      bidOptimizerId,
    ).then(res => res.data);
    this.setState(
      {
        isLoading: true,
      },
      () => {
        Promise.all([fetchBidOptimizer, fetchBidOptimizerProperties]).then(
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
    const attributionModelUrl = `/v2/o/${organisationId}/settings/campaigns/bid_optimizer`;
    history.push(attributionModelUrl);
  };

  saveOrCreatePluginInstance = (
    plugin: BidOptimizer,
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
        BidOptimizerService.updateBidOptimizer(plugin.id, plugin)
          .then(res => {
            return this.updatePropertiesValue(
              properties,
              organisationId,
              plugin.id,
            );
          })
          .then(res => {
            this.setState({ isLoading: false }, () => {
              history.push(`/v2/o/${organisationId}/settings/campaigns/bid_optimizer`);
            });
          })
          .catch(err => notifyError(err));
      });
    }
    // if creation save and redirect
    const formattedFormValues = {
      name: plugin.name,
      engine_artifact_id: '',
      engine_group_id: '',
    };
    if (this.state.initialValues) {
      formattedFormValues.engine_artifact_id = this.state.initialValues.plugin.artifact_id;
      formattedFormValues.engine_group_id = this.state.initialValues.plugin.group_id;
    }
    return this.setState({ isLoading: true }, () => {
      BidOptimizerService.createBidOptimizer(
        organisationId,
        formattedFormValues,
      )
        .then(res => res.data)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, res.id);
        })
        .then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/settings/campaigns/bid_optimizer`);
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
        BidOptimizerService.updateBidOptimizerProperty(
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
        pluginType={'BID_OPTIMIZATION_ENGINE'}
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
  injectNotifications,
)(CreateEditBidOptimizer);
