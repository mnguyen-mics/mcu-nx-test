import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import DisplayCreativeFormLoader from './DisplayCreativeFormLoader';
import { DisplayCreativeCreator } from './index';
import messages from './messages';
import {
  DisplayCreativeFormData,
  EditDisplayCreativeRouteMatchParams,
} from './domain';
import DisplayCreativeFormService from './DisplayCreativeFormService';
import CreativeService from '../../../../services/CreativeService';
import Loading from '../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../Notifications/injectNotifications';

interface State {
  loading: boolean;
  creativeName: string;
}

type Props = RouteComponentProps<EditDisplayCreativeRouteMatchParams> &
  InjectedNotificationProps &
  InjectedIntlProps;

class EditDisplayCreativePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      creativeName: '',
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { creativeId },
      },
    } = this.props;
    if (creativeId) {
      CreativeService.getCreative(creativeId)
        .then(resp => resp.data)
        .then(creativeData => {
          this.setState({
            creativeName: creativeData.name
              ? creativeData.name
              : `creative ${creativeData.id}`,
          });
        })
        .catch(err => {
          this.setState({ loading: false })
          this.props.notifyError(err)
        });;
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const {
      match: {
        params: { creativeId },
      },
    } = this.props;

    const {
      match: {
        params: { creativeId: nextCreativeId },
      },
    } = nextProps;

    if (creativeId !== nextCreativeId) {
      this.setState({ loading: true })
      CreativeService.getCreative(nextCreativeId)
      .then(resp => resp.data)
      .then(creativeData => {
        this.setState({
          loading: false,
          creativeName: creativeData.name
            ? creativeData.name
            : `creative ${creativeData.id}`,
        });
      })
      .catch(err => {
        this.setState({ loading: false })
        this.props.notifyError(err)
      });
    }
  }

  redirect = (savedId?: string) => {
    const {
      history,
      location: { state },
      match: {
        params: { organisationId },
      },
      intl: {
        formatMessage
      }
    } = this.props;

    let url =
      state && state.from
        ? state.from
        : `/v2/o/${organisationId}/creatives/display`;
    
    if (savedId) {
      url = `/v2/o/${organisationId}/creatives/display/edit/${savedId}`;
      message.success(formatMessage(messages.successfulSaving), 3);
    }
    history.push(url);
  };

  onSave = (creativeData: DisplayCreativeFormData) => {
    const { match: { params: { organisationId, creativeId } }, intl } = this.props;

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    this.setState({
      loading: true,
    });

    const savePromise = creativeData.repeatFields && creativeData.repeatFields.length ? DisplayCreativeFormService.handleSaveMutipleCreatives(
      organisationId,
      creativeData 
    ) : DisplayCreativeFormService.saveDisplayCreative(organisationId, creativeData)

    savePromise
      .then((savedId) => {
        hideSaveInProgress();
        if (creativeId) {
          this.setState({ loading: false })
        } else if (typeof savedId === 'string') {
          this.redirect(savedId)
        } else {
          this.redirect();
        }
        
      })
      .catch(err => {
        hideSaveInProgress();
        this.props.notifyError(err);
        this.setState({
          loading: false,
        });
      });
  };

  onSubmitFail = () => {
    const { intl } = this.props;
    message.error(intl.formatMessage(messages.errorFormMessage));
  };

  render() {
    const {
      match: {
        params: { creativeId, organisationId },
      },
      location,
      intl,
    } = this.props;

    const { creativeName } = this.state;

    const actionBarButtonSave = messages.saveCreative;
    const actionBarButtonSaveRefresh = messages.creativeCreationSaveButton;

    const from = location && location.state && location.state.from;

    const breadCrumbToList =
      from && location.state.from.includes('native')
        ? {
            name: messages.nativeListBreadCrumb,
            path: `/v2/o/${organisationId}/creatives/native`,
          }
        : {
            name: messages.displayListBreadCrumb,
            path: `/v2/o/${organisationId}/creatives/display`,
          };

    const creaName = creativeId
      ? intl.formatMessage(messages.creativeEditionBreadCrumb, {
          name: creativeName,
        })
      : from && location.state.from.includes('native')
        ? messages.nativeCreationBreadCrumb
        : messages.creativeCreationBreadCrumb;

    const breadCrumbPaths = [
      {
        ...breadCrumbToList,
      },
      {
        name: creaName,
      },
    ];

    const props = {
      close: () => this.redirect(),
      onSubmit: this.onSave,
      actionBarButtonText: creativeId ? actionBarButtonSaveRefresh : actionBarButtonSave,
      breadCrumbPaths: breadCrumbPaths,
      onSubmitFail: this.onSubmitFail,
    };

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }

    if (!creativeId) {
      return (<DisplayCreativeCreator {...props} />)
    }

    return <DisplayCreativeFormLoader {...props} creativeId={creativeId} />;
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectNotifications,
)(EditDisplayCreativePage);
