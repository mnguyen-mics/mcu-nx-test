import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { camelCase } from 'lodash';

import withDrawer, { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer/index';
import AdGroupContent from './AdGroupContent';
import { saveAdGroup, getAdGroup } from '../AdGroupServiceWrapper';
import * as NotificationActions from '../../../../../state/Notifications/actions';
import * as FeatureSelectors from '../../../../../state/Features/selectors';
import log from '../../../../../utils/Logger';
import { generateFakeId } from '../../../../../utils/FakeIdHelper';

interface EditAdGroupPageProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  notifyError: any;
  hasFeature: (feature: string) => boolean;
}

interface RouterProps {
  organisationId: string;
  campaignId: string;
  adGroupId?: string;
}

interface EditAdGroupPageState {
  initialValues: any;
  loading: boolean;
  editionMode: boolean;
}

type JoinedProps = EditAdGroupPageProps & RouteComponentProps<RouterProps>;

class EditAdGroupPage extends React.Component<JoinedProps, EditAdGroupPageState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      initialValues: {},
      editionMode: ((props.location.state && props.location.state.adGroupId) || !props.match.params.adGroupId) ? false : true,
      loading: true,
    };
  }

  componentDidMount() {
    const { adGroupId, campaignId, organisationId } = this.props.match.params;

    const stateAdGroupnId = this.props.location.state && this.props.location.state.adGroupId;

    if (adGroupId) {
      this.fetchAll(organisationId, campaignId, adGroupId);
    } else if (stateAdGroupnId) {
      this.fetchAll(organisationId, campaignId, stateAdGroupnId, true);
    } else {
      this.setState({
        loading: false,
      });
    }
  }

  fetchAll = (organisationId: string, campaignId: string, adGroupId: string, duplicate: boolean = false) => {
    return getAdGroup(organisationId, campaignId, adGroupId, duplicate).then((adGroup: any) => {
      let initialAdGroupFormatted = Object.keys(adGroup).reduce((acc, key) => ({
        ...acc,
        [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: adGroup[key],
      }), {});

      if (duplicate) {
        initialAdGroupFormatted = {
          ...initialAdGroupFormatted,
          adGroupId: generateFakeId(),
        };
      }

      this.setState({
        initialValues: initialAdGroupFormatted,
        loading: false,
      });
    }).catch(err => {
      log.error(err);
      this.setState({ loading: false });
      this.props.notifyError(err);
    });
  }

  onSave = (object: any) => {
    const {
      history,
      match: {
        params: { campaignId, organisationId },
      },
      notifyError,
      hasFeature,
    } = this.props;

    const saveOptions = {
      editionMode: this.state.editionMode,
      catalogMode: hasFeature('campaigns.display.edition.audience_catalog'),
    };

    saveAdGroup(campaignId, object, this.state.initialValues, saveOptions)
      .then((adGroupId: string) => {
        history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`);
      })
      .catch((err: any) => {
        log.error(err);
        notifyError(err);
      });
  }

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: {
          adGroupId,
          campaignId,
          organisationId,
        },
      },
    } = this.props;

    return (location.state && location.state.from
    ? history.push(location.state.from)
    : history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`)
    );
  }

  render() {
    return (
      <AdGroupContent
        closeNextDrawer={this.props.closeNextDrawer}
        editionMode={this.state.editionMode}
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        onClose={this.onClose}
        openNextDrawer={this.props.openNextDrawer}
        save={this.onSave}
      />
    );
  }
}

export default compose(
  withRouter,
  withDrawer,
  connect(
    state => ({ hasFeature: FeatureSelectors.hasFeature(state) }),
    { notifyError: NotificationActions.notifyError },
  ),
)(EditAdGroupPage);
