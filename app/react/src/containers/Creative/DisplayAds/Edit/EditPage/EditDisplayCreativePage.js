import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCreativeEditionEditor from './DisplayCreativeEditionEditor';


import CreativeService from '../../../../../services/CreativeService.ts';
import * as actions from '../../../../../state/Notifications/actions';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import Loading from '../../../../../components/Loading.tsx';

import messages from '../messages';


class CreateDisplayCreativePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formats: [],
      rendererProperties: [],
      creative: {},
      isLoading: false
    };
  }

  fetchAllData = (organisationId, creativeId) => {
    const {
      notifyError
    } = this.props;

    const getFormats = CreativeService.getCreativeFormats(organisationId).then(res => res.data);
    const getRendererProperties = CreativeService.getCreativeRendererProperties(creativeId).then(res => res.data);
    const getCreative = CreativeService.getCreative(creativeId).then(res => res.data);

    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      Promise.all([getFormats, getRendererProperties, getCreative]).then(values => {
        this.setState(prevState => {
          const nextState = {
            ...prevState
          };
          nextState.formats = values[0].filter(item => {
            return item.type === 'DISPLAY_AD';
          }).sort((a, b) => {
            return a.width - b.width;
          }).map(item => {
            return `${item.width}x${item.height}`;
          });
          nextState.rendererProperties = values[1].sort((a) => {
            return a.writable === false ? -1 : 1;
          });
          nextState.creative = values[2];
          nextState.isLoading = false;
          return nextState;
        });
      })
      .catch(err => {
        notifyError(err);
      });
    });

  }

  updateDisplayCreative = (creative, properties) => {

    const { organisationId, notifyError } = this.props;

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

  componentDidMount() {
    const {
      match: { params: { organisationId, creativeId } }
    } = this.props;
    this.fetchAllData(organisationId, creativeId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          creativeId: nextCreativeId
        }
      }
    } = nextProps;

    const {
      match: {
        params: {
          organisationId,
          creativeId
        }
      }
    } = this.props;

    if (organisationId !== nextOrganisationId || creativeId !== nextCreativeId) {
      this.fetchAllData(nextOrganisationId, nextCreativeId);
    }
  }


  redirect = () => {
    const { history, organisationId } = this.props;
    const emailCampaignListUrl = `/v2/o/${organisationId}/creatives/display`;
    history.push(emailCampaignListUrl);
  }

  formatProperties = () => {
    const {
      rendererProperties
    } = this.state;

    const formattedProperties = {};
    rendererProperties.forEach(item => {
      formattedProperties[item.technical_name] = { value: item.value };
    });

    return formattedProperties;
  }

  refreshCreative = () => {
    const {
      match: { params: { organisationId, creativeId } }
    } = this.props;

    this.fetchAllData(organisationId, creativeId);
  }

  render() {
    const {
      organisationId,
      intl: { formatMessage },
    } = this.props;

    const {
      isLoading
    } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.creativeCreationBreadCrumb) },
    ];

    return (this.state.isLoading
      ? (
        <div style={{ display: 'flex', flex: 1 }}>
          <Loading className="loading-full-screen" />
        </div>
      )
      : (
        <DisplayCreativeEditionEditor
          save={this.updateDisplayCreative}
          close={this.redirect}
          breadcrumbPaths={breadcrumbPaths}
          initialValues={{
            creative: this.state.creative,
            properties: this.formatProperties(),
          }}
          creative={this.state.creative}
          rendererProperties={this.state.rendererProperties}
          formats={this.state.formats}
          refreshCreative={this.refreshCreative}
          organisationId={organisationId}
          isLoading={isLoading}
        />
      )
    );
  }
}

CreateDisplayCreativePage.propTypes = {
  match: ReactRouterPropTypes.match.isRequired,
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateDisplayCreativePage);
