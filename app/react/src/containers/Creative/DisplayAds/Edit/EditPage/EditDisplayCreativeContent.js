import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from 'react-intl';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCreativeEditionEditor from './DisplayCreativeEditionEditor';

import CreativeService from '../../../../../services/CreativeService';
import * as actions from '../../../../../state/Notifications/actions';
import { ReactRouterPropTypes } from '../../../../../validators/proptypes';
import Loading from '../../../../../components/Loading.tsx';
import log from '../../../../../utils/Logger';
import { EditContentLayout } from '../../../../../components/Layout/index.ts';
import { updateDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';


import messages from '../messages';

const formId = 'creativeEditionForm';

class EditDisplayCreativeContent extends Component {

  constructor(props) {
    super(props);
    this.state = {
      formats: [],
      rendererProperties: [],
      creative: {},
      isLoading: false
    };
  }

  onSave = (creative, properties) => {
    const {
      organisationId,
    } = this.props;
    updateDisplayCreative(organisationId, creative, properties)
      .then((creativeId) => {
        this.fetchAllData(organisationId, creativeId);
      });
  }

  fetchAllData = (organisationId) => {
    const {
      notifyError,
      creativeId,
    } = this.props;

    const getFormats = CreativeService.getCreativeFormats(organisationId);

    const getRendererProperties = CreativeService.getCreativeRendererProperties(creativeId);
    const getCreative = CreativeService.getCreative(creativeId);

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
        log.error(err);
        notifyError(err);
      });
    });
  }

  componentDidMount() {
    const {
      match: {
        params: {
          organisationId,
          creativeId,
        }
      }
    } = this.props;
    this.fetchAllData(organisationId, creativeId);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          creativeId: nextCreativeId,
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

  refreshCreative = () => {
    const {
      match: {
        params: {
          organisationId,
        }
      }
    } = this.props;

    this.fetchAllData(organisationId);
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

  render() {
    const {
      organisationId,
      intl: { formatMessage },
      onClose,
      match: { url },
    } = this.props;

    const {
      isLoading
    } = this.state;

    const sidebarItems = {
      general: messages.creativeSiderMenuGeneralInformation,
      audit_status: messages.creativeSiderMenuAudit,
      properties: messages.creativeSiderMenuProperties,
      preview: messages.creativeSiderMenuPreview,
    };

    const buttonMetadata = {
      formId: formId,
      message: messages.saveCreative,
      onClose: onClose,
    };

    const breadcrumbPaths = [
      { name: formatMessage(messages.creativeCreationBreadCrumb) },
    ];

    return this.state.isLoading ?
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div> :
      (<EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
      >
        <DisplayCreativeEditionEditor
          save={this.onSave}
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
          closeNextDrawer={this.props.closeNextDrawer}
          openNextDrawer={this.props.openNextDrawer}
          formId={formId}
        />
      </EditContentLayout>
    );
  }
}

EditDisplayCreativeContent.propTypes = {
  creativeId: PropTypes.string.isRequired,
  organisationId: PropTypes.string.isRequired,
  notifyError: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  closeNextDrawer: PropTypes.func.isRequired,
  openNextDrawer: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default compose(
  withMcsRouter,
  injectIntl,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(EditDisplayCreativeContent);
