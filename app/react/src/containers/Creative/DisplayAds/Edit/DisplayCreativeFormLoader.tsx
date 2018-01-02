import * as React from 'react';
import { compose } from 'recompose';

import CreativeService from '../../../../services/CreativeService';
import actions from '../../../../state/Notifications/actions';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import { RouteComponentProps, withRouter } from 'react-router';
import { DisplayCreativeFormProps } from './DisplayCreativeForm';
import { DisplayCreativeFormData, INITIAL_DISPLAY_CREATIVE_FORM_DATA } from './domain';
import { Loading } from '../../../../components/index';
import { PropertyResourceShape } from '../../../../models/plugin';
import { Omit } from '../../../../utils/Types';

export interface DisplayCreativeFormLoaderProps extends Omit<DisplayCreativeFormProps, 'rendererProperties'> {
	creativeId: string;
}

type JoinedProps = DisplayCreativeFormLoaderProps 
& RouteComponentProps<{ organisationId: string }>;

interface DisplayCreativeFormLoaderState {
  isLoading: boolean;
	creativeFormData: DisplayCreativeFormData;
}

class DisplayCreativeFormLoader extends React.Component<
	JoinedProps,
  DisplayCreativeFormLoaderState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      isLoading: false,
			creativeFormData: INITIAL_DISPLAY_CREATIVE_FORM_DATA,
    };
	}
	
	componentDidMount() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      creativeId,
		} = this.props;
    this.fetchAllData(organisationId, creativeId);
  }

  fetchAllData = (organisationId: string, creativeId: string) => {

		this.setState({ isLoading: true });

		Promise.all([
			CreativeService.getDisplayAd(creativeId),		
			CreativeService.getCreativeRendererProperties(creativeId)
		]).then(([creativeApiResp,  rendererProps]) => {
			const creativeFormData: DisplayCreativeFormData = { // type
				creative: creativeApiResp.data,
				rendererProperties: rendererProps.data.sort(a => {
					return a.writable === false ? -1 : 1;
				}),
			};
			this.setState({
				isLoading: false,
				creativeFormData: creativeFormData,
			})
		}).catch(err => {
			this.setState({
				isLoading: false,
			});
			log.error(err);
			actions.notifyError(err);
		});
	};


  render() {

		const {
			creativeId,
			save,
			close,
			...rest,
		} = this.props;

		if (this.state.isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    return (
			<DisplayCreativeForm 
				{...rest}
				close={this.props.close}
				save={this.props.save}
				initialValues={this.state.creativeFormData}
			/>
		);
  }
}

export default compose<
  JoinedProps,
  DisplayCreativeFormLoaderProps
>(
	withRouter,
)(DisplayCreativeFormLoader);
