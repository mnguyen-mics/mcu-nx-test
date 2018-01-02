import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { InjectedIntlProps } from 'react-intl';

import * as actions from '../../../../state/Notifications/actions';
import DisplayCreativeRendererSelector from './DisplayCreativeRendererSelector';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { DisplayCreativeFormData } from './domain';
import Loading from '../../../../components/Loading';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';

export interface DisplayCreativeCreatorProps extends DisplayCreativeFormProps {}

interface State {
  isLoading: boolean;
  creativeFormData: Partial<DisplayCreativeFormData>;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = DisplayCreativeCreatorProps & InjectedIntlProps & MapStateProps;

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
    DisplayCreativeFormService.initializeFormData(adRendererId)
      .then(creativeFormData =>
        this.setState({
          creativeFormData,
          isLoading: false,
        }),
      )
      .catch(err => {
        log.debug(err);
        this.props.notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
  };

  render() {
    const { creativeFormData, isLoading } = this.state;

    if (isLoading) return <Loading className="loading-full-screen" />;

    return Object.keys(creativeFormData).length > 0 ? (
      <DisplayCreativeForm {...this.props} initialValues={creativeFormData} />
    ) : (
      <DisplayCreativeRendererSelector
        onSelect={this.loadFormData}
        close={this.props.close}
      />
    );
  }
}

export default compose<Props, DisplayCreativeCreatorProps>(
  connect(undefined, { notifyError: actions.notifyError }),
)(DisplayCreativeCreator);
