import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCreativeCreationEditor from './DisplayCreativeCreationEditor';
import DisplayCreativeTypePicker from './DisplayCreativeTypePicker';

import PluginService from '../../../../../services/PluginService';
import CreativeService from '../../../../../services/CreativeService';
import * as actions from '../../../../../state/Notifications/actions';
import log from '../../../../../utils/Logger';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import Loading from '../../../../../components/Loading.tsx';

import messages from '../messages';


class CreateDisplayCreativePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      adRenderer: {
        id: null,
        versionId: null,
        artifactId: null,
        groupId: null,
      },
      isLoading: false,
      rendererProperties: [],
      formats: []
    };
  }


  createDisplayCreative = (creative, properties) => {

    const { history, organisationId, notifyError } = this.props;

    const options = {
      renderer_artifact_id: this.state.adRenderer.artifactId,
      renderer_group_id: this.state.adRenderer.groupId,
      editor_artifact_id: 'default-editor',
      editor_group_id: 'com.mediarithmics.creative.display',
      subtype: 'BANNER',
      format: creative.format,
      destination_domain: creative.destination_domain,
      name: creative.name,
    };
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {

      CreativeService
        .createDisplayCreative(organisationId, options)
        .then(res => {
          const creativeId = res.id;
          const propertiesPromises = [];
          properties.forEach(item => {
            propertiesPromises.push(CreativeService.updateDisplayCreativeRendererProperty(organisationId, creativeId, item.technical_name, item));
          });
          Promise.all(propertiesPromises).then(() => {
            CreativeService.takeScreenshot(creativeId, organisationId).then(() => {
              this.setState(prevState => {
                const nextState = {
                  ...prevState
                };
                return nextState;
              });
              history.push(`/v2/o/${organisationId}/creatives/display/edit/${creativeId}`);
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
          // TODO NOTIFY ERR
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

  redirect = () => {
    const { history, organisationId } = this.props;
    const emailCampaignListUrl = `/v2/o/${organisationId}/creatives/display`;
    history.push(emailCampaignListUrl);
  }

  onSelect = adRenderer => {
    const {
      notifyError,
      organisationId
    } = this.props;
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      PluginService
        .getPluginVersions(adRenderer)
        .then(res => {
          const lastVersion = res.data[res.data.length - 1];

          const pluginPropertiesPromise = PluginService.getPluginVersionProperty(adRenderer, lastVersion.id);
          const formatsPromises = CreativeService.getCreativeFormats(organisationId);

          Promise.all([pluginPropertiesPromise, formatsPromises])
            .then(values => {
              this.setState(prevState => {
                const nextState = {
                  ...prevState
                };
                nextState.rendererProperties = values[0].sort((a) => {
                  return a.writable === false ? -1 : 1;
                });
                nextState.formats = values[1].filter(item => {
                  return item.type === 'DISPLAY_AD';
                }).sort((a, b) => {
                  return a.width - b.width;
                }).map(item => {
                  return `${item.width}x${item.height}`;
                });

                nextState.adRenderer = {
                  id: adRenderer,
                  versionId: lastVersion.id,
                  artifactId: lastVersion.artifact_id,
                  groupId: lastVersion.group_id
                };
                nextState.isLoading = false;
                return nextState;
              });
            })
            .catch(err => {
              notifyError(err);
              this.setState(() => {
                return { isLoading: false };
              });
            });

        })
        .catch(err => {
          log.debug(err);
          notifyError(err);
          this.setState(prevState => {
            const nextState = {
              ...prevState
            };
            nextState.isLoading = true;
            return nextState;
          });
        });
    });
  }

  onReset = () => {
    this.setState(prevState => {
      const nextState = {
        ...prevState
      };
      nextState.adRenderer = {
        id: null,
        versionId: null
      };
      return nextState;
    });

  }

  render() {
    const {
      organisationId,
      intl: { formatMessage },
    } = this.props;

    const {
      adRenderer,
      isLoading
    } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.creativeCreationBreadCrumb) },
    ];

    const initialValues = {
      creative: {
        format: this.state.formats[0]
      }
    };

    if (isLoading) {
      return (
        <div style={{ display: 'flex', flex: 1 }}>
          <Loading className="loading-full-screen" />
        </div>
      );
    }

    return (adRenderer.id && adRenderer.versionId
      ? (
        <DisplayCreativeCreationEditor
          save={this.createDisplayCreative}
          close={this.redirect}
          breadcrumbPaths={breadcrumbPaths}
          changeType={this.onReset}
          adRenderer={adRenderer}
          initialValues={initialValues}
          formats={this.state.formats}
          rendererProperties={this.state.rendererProperties}
          organisationId={organisationId}
        />
      )
      : (
        <DisplayCreativeTypePicker
          breadcrumbPaths={breadcrumbPaths}
          close={this.redirect}
          onSelect={this.onSelect}
        />)
    );
  }
}

CreateDisplayCreativePage.propTypes = {
  organisationId: PropTypes.string.isRequired,
  history: ReactRouterPropTypes.history.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default compose(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateDisplayCreativePage);
