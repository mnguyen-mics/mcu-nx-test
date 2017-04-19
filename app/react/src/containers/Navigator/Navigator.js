import enUS from 'antd/lib/locale-provider/en_US';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import Loading from 'mcs-react-loading';
import { Layout, LocaleProvider } from 'antd';

import { NavigatorHeader } from '../Header';

import * as TranslationsActions from '../../state/Translations/actions';
import * as sessionActions from '../../state/Session/actions';

class Navigator extends Component {

  constructor(props) {
    super(props);
    this.validateUrl = this.validateUrl.bind(this);
    this.initWorkspace = this.initWorkspace.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      authenticated,
      activeWorkspace
    } = this.props;

    const {
      activeWorkspace: nextActiveWorkspace,
      params: nextParams
    } = nextProps;

    if (authenticated) {
      if (nextParams.organisationId) {
        if (nextParams.organisationId !== activeWorkspace.organisationId) {
          const workspace = {
            organisationId: nextParams.organisationId,
            datamartId: nextParams.datamartId
          };
          this.initWorkspace(workspace);
        } else if (nextParams.datamartId !== nextActiveWorkspace.datamartId) {
          this.validateUrl(nextActiveWorkspace);
        }
      }
    }
  }

  componentDidMount() {

    const {
      initTranslations,
      params,
      getConnectedUser
    } = this.props;

    const workspace = {
      organisationId: params.organisationId,
      datamartId: params.datamartId
    };

    const retrieveUser = () => {
      return getConnectedUser()
        .then(() => this.initWorkspace(workspace));
    };

    initTranslations();

    // todo remove later
    // as the angular app will be bootstraped first, we need to know if the user has logged in through the angular app
    window.addEventListener('core/login/constants/LOGIN_SUCCESS', () => { // eslint-disable-line no-undef
      retrieveUser();
    }, false);

  }

  render() {

    const {
      isReady,
      locale,
      translations
    } = this.props;

    if (!isReady) {
      return <Loading />;
    }

    return (
      <IntlProvider locale={locale} key={locale} messages={translations}>
        <LocaleProvider locale={enUS}>
          <Layout className="mcs-main-layout">
            <NavigatorHeader {...this.props} />
            {this.props.children}
          </Layout>
        </LocaleProvider>
      </IntlProvider>
    );
  }

  initWorkspace(workspace) {

    const {
      getWorkspaces,
      initActiveWorkspace
    } = this.props;

    return getWorkspaces(workspace)
      .then(() => initActiveWorkspace(workspace))
      .then(() => this.validateUrl());

  }

  validateUrl(nextActiveWorkspace) {

    const {
      activeWorkspace,
      checkUrl,
      location: {
        pathname
      },
      router
    } = this.props;

    checkUrl(pathname);

    const {
      isReactUrl
    } = this.props;

    const redirectActiveWorkspace = nextActiveWorkspace ? nextActiveWorkspace : activeWorkspace;

    const datamartPart = redirectActiveWorkspace.datamartId ? `/d/${redirectActiveWorkspace.datamartId}` : '';
    const url = `${PUBLIC_URL}/o/${redirectActiveWorkspace.organisationId}${datamartPart}/campaigns/display`; // eslint-disable-line no-undef
    const query = router.location.query;

    if (isReactUrl) {
      router.replace({
        pathname: url,
        query
      });
    }
  }

}

Navigator.defaultProps = {
  locale: 'en',
  token: null
};

Navigator.propTypes = {
  isReady: PropTypes.bool.isRequired,
  locale: PropTypes.string,
  translations: PropTypes.objectOf(PropTypes.string).isRequired,
  initTranslations: PropTypes.func.isRequired,
  authenticated: PropTypes.bool.isRequired,
  activeWorkspace: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isReactUrl: PropTypes.bool.isRequired,
  params: PropTypes.shape({
    organisationId: PropTypes.string,
    datamartId: PropTypes.string,
  }).isRequired,
  location: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  router: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  getConnectedUser: PropTypes.func.isRequired,
  getWorkspaces: PropTypes.func.isRequired,
  initActiveWorkspace: PropTypes.func.isRequired,
  checkUrl: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations,
  authenticated: state.sessionState.authenticated,
  activeWorkspace: state.sessionState.activeWorkspace,
  isReactUrl: state.sessionState.isReactUrl,
  token: state.persistedState.access_token
});

const mapDispatchToProps = {
  initTranslations: TranslationsActions.initTranslations,
  getConnectedUser: sessionActions.getConnectedUser,
  getWorkspaces: sessionActions.getWorkspaces,
  initActiveWorkspace: sessionActions.initActiveWorkspace,
  checkUrl: sessionActions.checkUrl
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
