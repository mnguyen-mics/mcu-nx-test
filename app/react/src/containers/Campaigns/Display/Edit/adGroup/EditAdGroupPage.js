import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { camelCase } from 'lodash';
import { connect } from 'react-redux';

import withDrawer from '../../../../../components/Drawer';
import AdGroupContent from './AdGroupContent';
import { withMcsRouter } from '../../../../Helpers';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import { saveAdGroup, getAdGroup } from '../AdGroupServiceWrapper';
import * as actions from '../../../../../state/Notifications/actions';


class EditAdGroupPage extends Component {

  state = {
    initialValues: {},
    loading: true,
  }

  componentDidMount() {
    const { adGroupId, campaignId, organisationId } = this.props.match.params;

    getAdGroup(organisationId, campaignId, adGroupId).then(adGroup => {
      const initialAdGroupFormatted = Object.keys(adGroup).reduce((acc, key) => ({
        ...acc,
        [key.indexOf('Table') === -1 ? camelCase(`adGroup-${key}`) : key]: adGroup[key]
      }), {});

      this.setState({
        initialValues: initialAdGroupFormatted,
        loading: false,
      });
    }).catch((err) => {
      this.setState({
        loading: false,
      });
      this.props.notifyError(err);
    });
  }

  onSave = (object) => {
    const {
      history,
      match: {
        params: { campaignId, organisationId },
      },
    } = this.props;

    saveAdGroup(campaignId, object, this.state.initialValues, true)
      .then((adGroupId) => {
        history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`);
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
          organisationId
        }
      }
    } = this.props;

    return (location.state && location.state.from
    ? history.push(location.state.from)
    : history.push(`/v2/o/${organisationId}/campaigns/display/${campaignId}/adgroups/${adGroupId}`)
    );
  };

  render() {
    return (
      <AdGroupContent
        closeNextDrawer={this.props.closeNextDrawer}
        editionMode
        initialValues={this.state.initialValues}
        loading={this.state.loading}
        onClose={this.onClose}
        openNextDrawer={this.props.openNextDrawer}
        save={this.onSave}
      />
    );
  }
}

EditAdGroupPage.propTypes = {
  closeNextDrawer: PropTypes.func.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  withDrawer,
  connect(
    undefined,
    { notifyError: actions.notifyError }
  )
)(EditAdGroupPage);
