import * as React from 'react';
import { compose } from 'recompose';
import { InjectedIntlProps } from 'react-intl';

import DisplayCreativeRendererSelector from './DisplayCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { DisplayCreativeFormData, IMAGE_AD_RENDERER } from './domain';
import Loading from '../../../../components/Loading';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';
import { PropertyResourceShape } from '../../../../models/plugin';
import DisplayCreativeMultipleForm from './DisplayCreativeMultipleForm';

export interface DisplayCreativeCreatorProps extends DisplayCreativeFormProps {
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

  filterProperties = (pluginId: string, properties: { [technicalName: string]: PropertyResourceShape }): { [technicalName: string]: PropertyResourceShape } => {
    switch(pluginId) {
      case IMAGE_AD_RENDERER:
        const { image, ...formattedProperties } = properties;
        return formattedProperties;
      default:
        return properties;
    }
  }

  loadFormData = (adRendererId: string) => {
    this.setState({ isLoading: true });

    DisplayCreativeFormService.initializeFormData(adRendererId, 'BANNER')
      .then(creativeFormData => {
        this.setState({
          creativeFormData: {
            ...creativeFormData,
            properties: this.filterProperties(creativeFormData.rendererPlugin.plugin_id, creativeFormData.properties)
          },
          isLoading: false,
        })
      })
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

    if (!Object.keys(initialValues).length) {
      return <DisplayCreativeRendererSelector
        onSelect={this.loadFormData}
        close={this.props.close}
      />
     
    }

    if (initialValues.rendererPlugin && initialValues.rendererPlugin.plugin_id === IMAGE_AD_RENDERER) {
      // render multiupload form for image ad renderer
      return <DisplayCreativeMultipleForm
        {...this.props}
        initialValues={initialValues}
        goToCreativeTypeSelection={this.resetFormData}
      />
    }

    return (<DisplayCreativeForm
      {...this.props}
      initialValues={initialValues}
      goToCreativeTypeSelection={this.resetFormData}
    />)

   
  }
}

export default compose<Props, DisplayCreativeCreatorProps>(injectNotifications)(
  DisplayCreativeCreator,
);
