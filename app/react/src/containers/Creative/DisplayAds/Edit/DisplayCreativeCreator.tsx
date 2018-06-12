import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

import DisplayCreativeRendererSelector from './DisplayCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { DisplayCreativeFormData, MicsPLuginDefinition, PluginDefinitionComplexItem, CustomUploadType } from './domain';
import Loading from '../../../../components/Loading';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

export type LayoutType = 'SPLIT' | 'STANDARD';

export interface DisplayCreativeCreatorProps extends DisplayCreativeFormProps {
  onPluginSelect?: (allowMultiple: boolean, customLoader: CustomUploadType) => void;
  allowMultiple?: boolean;
  customLoader?: CustomUploadType;
  layout: LayoutType;
}

interface State {
  isLoading: boolean;
  creativeFormData: Partial<DisplayCreativeFormData>;
}

type Props = DisplayCreativeCreatorProps &
  InjectedIntlProps &
  InjectedNotificationProps;

class DisplayCreativeCreator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      creativeFormData: {},
    };
  }

  loadFormData = (adRendererId: string) => {
    this.setState({ isLoading: true });
    const { onPluginSelect } = this.props;

    DisplayCreativeFormService.initializeFormData(adRendererId, 'BANNER')
      .then(creativeFormData => {
        let type;
        Object.keys(MicsPLuginDefinition).forEach(key => {
          if (MicsPLuginDefinition[key].id === creativeFormData.rendererPlugin.plugin_id) {
            type = key
          }
        })

        if (type && 
            MicsPLuginDefinition[type] && 
            (MicsPLuginDefinition[type] as PluginDefinitionComplexItem).propertiesFormatter && 
            MicsPLuginDefinition[type] && 
            (MicsPLuginDefinition[type] as PluginDefinitionComplexItem).customUploadType &&
            onPluginSelect 
          ) {
          this.setState({
            creativeFormData: {
              ...creativeFormData,
              properties: MicsPLuginDefinition[type] && (MicsPLuginDefinition[type] as PluginDefinitionComplexItem).propertiesFormatter(creativeFormData.properties)
            },
            isLoading: false,
          })
          onPluginSelect(
            MicsPLuginDefinition[type] && MicsPLuginDefinition[type].allowMultipleUpload ? MicsPLuginDefinition[type].allowMultipleUpload : false,
            MicsPLuginDefinition[type] && (MicsPLuginDefinition[type] as PluginDefinitionComplexItem).customUploadType
          )
        } else {
          this.setState({
            creativeFormData,
            isLoading: false,
          })
        }


      }
      )
      .catch(err => {
        log.debug(err);
        this.props.notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
  };

  resetFormData = () => {
    this.setState({
      creativeFormData: {},
    });
  };

  render() {
    const { creativeFormData, isLoading } = this.state;

    if (isLoading) return <Loading className="loading-full-screen" />;

    const initialValues = this.props.initialValues || creativeFormData;

    return Object.keys(initialValues).length > 0 ? (
      <DisplayCreativeForm
        {...this.props}
        initialValues={initialValues}
        goToCreativeTypeSelection={this.resetFormData}
        allowMultipleUpload={this.props.allowMultiple}
        customLoader={this.props.customLoader}
        layout={this.props.layout ? this.props.layout : 'STANDARD'}
      />
    ) : (
        <DisplayCreativeRendererSelector
          onSelect={this.loadFormData}
          close={this.props.close}
        />
      );
  }
}

export default compose<Props, DisplayCreativeCreatorProps>(injectNotifications)(
  DisplayCreativeCreator,
);
