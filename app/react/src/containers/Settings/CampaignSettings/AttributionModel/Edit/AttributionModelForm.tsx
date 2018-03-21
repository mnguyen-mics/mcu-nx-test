import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import PluginContent from '../../../../Plugin/Edit/PluginContent';
import AttributionModelService from '../../../../../services/AttributionModelService';
import { AttributionModelFormData } from './domain';
import {
  AttributionModel,
  PluginProperty,
  PluginInterface,
} from '../../../../../models/Plugins';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { Path } from '../../../../../components/ActionBar';

const messages = defineMessages({
  listTitle: {
    id: 'attributionmodel.edit.list.title',
    defaultMessage: 'Attribution Models',
  },
  listSubTitle: {
    id: 'attributionmodel.edit.list.subtitle',
    defaultMessage: 'New Attribution Model',
  },
});

interface AttributionModelFormState {
  isLoading: boolean;
  initialValues: AttributionModelFormData;
}

export interface AttributionModelFormProps {
  close: () => void;
  save: (formData: AttributionModelFormData) => void;
  attributionId?: string;
  breadcrumbPaths: Path[];
  isLoading?: boolean;
  initialValues?: AttributionModelFormData;
}

type JoinedProps = AttributionModelFormProps &
  InjectedNotificationProps &
  InjectedIntlProps;

class AttributionModelForm extends React.Component<
  JoinedProps,
  AttributionModelFormState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: false,
      initialValues: this.props.initialValues
        ? this.props.initialValues
        : { plugin: {}, properties: [] },
    };
  }

  componentDidMount() {
    const { attributionId } = this.props;
    if (attributionId) {
      this.fetchInitialValues(attributionId);
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const { attributionId } = this.props;
    const { attributionId: nextAttributionId } = nextProps;

    if (nextAttributionId && attributionId !== nextAttributionId) {
      this.fetchInitialValues(nextAttributionId);
    }
  }

  fetchInitialValues = (attributionModelId: string) => {
    this.setState({ isLoading: true });
    Promise.all([
      AttributionModelService.getAttributionModel(attributionModelId),
      AttributionModelService.getAttributionModelProperties(attributionModelId),
    ])
      .then(res => {
        this.setState({
          isLoading: false,
          initialValues: {
            plugin: res[0].data,
            properties: res[1].data,
          },
        });
      })
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ isLoading: false });
      });
  };

  saveOrCreatePluginInstance = (
    plugin: AttributionModel,
    properties: PluginProperty[],
  ) => {
    const { save } = this.props;
    save({ plugin, properties });
  };

  onSelect = (plugin: PluginInterface) => {
    this.setState({
      initialValues: {
        plugin: {
          artifact_id: plugin.artifact_id,
          group_id: plugin.group_id,
        },
        properties: [],
      },
    });
  };

  render() {
    const { close, breadcrumbPaths, isLoading } = this.props;

    return (
      <PluginContent
        pluginType="ATTRIBUTION_PROCESSOR"
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={close}
        onSelect={this.onSelect}
        editionMode={!!this.props.attributionId || !!this.props.initialValues}
        initialValue={this.state.initialValues}
        loading={isLoading || this.state.isLoading}
      />
    );
  }
}

export default compose<JoinedProps, AttributionModelFormProps>(
  injectIntl,
  injectNotifications,
)(AttributionModelForm);
