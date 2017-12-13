import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

import * as actions from '../../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../../Helpers';
import CreativeService from '../../../../../services/CreativeService.ts';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import EditDisplayCreativeContent from './EditDisplayCreativeContent';
import withDrawer from '../../../../../components/Drawer/index.tsx';
import { updateDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';

class EditDisplayCreativePage extends Component {

  updateDisplayCreative = (creative, properties) => {

    const {
      match: {
        params: {
          organisationId,
        }
      },
      notifyError,
    } = this.props;

    const options = {
      ...this.state.creative,
      ...creative
    };
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {

      CreativeService
        .updateDisplayCreative(creative.id, options)
        .then(() => {
          const creativeId = creative.id;
          const propertiesPromises = [];
          properties.forEach(item => {
            propertiesPromises.push(CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item));
          });

          Promise.all(propertiesPromises).then(() => {
            CreativeService.takeScreenshot(creativeId).then(() => {
              this.setState(prevState => {
                const nextState = {
                  ...prevState
                };
                return nextState;
              });
              this.fetchAllData(organisationId, creativeId);
            }).catch(err => {
              notifyError(err);
              this.setState(prevState => {
                const nextState = {
                  ...prevState
                };
                nextState.isLoading = false;
                return nextState;
              });
            });
          })
            .catch(err => {
              notifyError(err);
              this.setState(prevState => {
                const nextState = {
                  ...prevState
                };
                nextState.isLoading = false;
                return nextState;
              });

            });
        })
        .catch(err => {
          notifyError(err);
          this.setState(prevState => {
            const nextState = {
              ...prevState
            };
            nextState.isLoading = false;
            return nextState;
          });

        });
    });
  }

  onClose = () => {
    const {
      history,
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;
    history.push(`/v2/o/${organisationId}/creatives/display`);
  }

  save = (creative, properties) => {
    const {
      history,
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;
    updateDisplayCreative(organisationId, creative, properties);
    history.push(`/v2/o/${organisationId}/creatives/display`);
  }


  render() {

    const {
      openNextDrawer,
      closeNextDrawer,
      match,
    } = this.props;

    return (
      <EditDisplayCreativeContent
        closeNextDrawer={closeNextDrawer}
        onClose={this.onClose}
        save={this.save}
        openNextDrawer={openNextDrawer}
        creativeId={match.params.creativeId}
      />
    );
  }
}

EditDisplayCreativePage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      organisationId: PropTypes.string.isRequired,
      creativeId: PropTypes.string.isRequired,
    })
  }).isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  notifyError: PropTypes.func.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
  withDrawer,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(EditDisplayCreativePage);
