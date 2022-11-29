import * as React from 'react';
import { Field, GenericField } from 'redux-form';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Spin } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { FormSection } from '../../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../../components/Form/withValidators';
import DefaultSelect, {
  DefaultSelectProps,
} from '../../../../../../components/Form/FormSelect/DefaultSelect';
import messages from '../../messages';
import { EmailRouterResource } from '../../../../../../models/campaign/email';
import { EditEmailBlastRouteMatchParam } from '../../domain';
import { lazyInject } from '../../../../../../config/inversify.config';
import { IEmailRouterService } from '../../../../../../services/Library/EmailRoutersService';
import { TYPES } from '../../../../../../constants/types';

const FormSelectField = Field as new () => GenericField<DefaultSelectProps>;

interface State {
  routers: EmailRouterResource[];
  fetchingRouters: boolean;
}

type Props = WrappedComponentProps &
  ValidatorProps &
  RouteComponentProps<EditEmailBlastRouteMatchParam>;

class RouterFormSection extends React.Component<Props, State> {
  @lazyInject(TYPES.IEmailRouterService)
  private _emailRouterService: IEmailRouterService;

  constructor(props: Props) {
    super(props);
    this.state = {
      routers: [],
      fetchingRouters: false,
    };
  }

  componentDidMount() {
    this.setState({ fetchingRouters: true });
    this._emailRouterService
      .getEmailRouters(this.props.match.params.organisationId)
      .then(response => {
        this.setState({
          fetchingRouters: false,
          routers: response.data,
        });
      });
  }

  render() {
    const {
      intl: { formatMessage },
      fieldValidators: { isRequired },
    } = this.props;

    return (
      <div>
        <FormSection
          subtitle={messages.emailEditorRouterSubTitle}
          title={messages.emailEditorRouterTitle}
        />
        <FormSelectField
          name='routerFields[0].model.email_router_id'
          component={DefaultSelect}
          validate={[isRequired]}
          formItemProps={{
            label: formatMessage(messages.emailEditorRouterSelectLabel),
            required: true,
          }}
          selectProps={{
            notFoundContent: this.state.fetchingRouters ? <Spin size='small' /> : null,
          }}
          options={this.state.routers.map(router => ({
            value: router.id,
            title: router.name,
          }))}
          helpToolTipProps={{
            title: formatMessage(messages.emailEditorRouterSelectHelper),
          }}
        />
      </div>
    );
  }
}

export default compose(injectIntl, withRouter, withValidators)(RouterFormSection);
