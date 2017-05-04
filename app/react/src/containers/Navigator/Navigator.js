import enUS from 'antd/lib/locale-provider/en_US';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IntlProvider, FormattedMessage } from 'react-intl';
import Loading from 'mcs-react-loading';
import { Layout, LocaleProvider, notification as antNotification, Icon } from 'antd';

import { NavigatorHeader } from '../Header';

import * as TranslationsActions from '../../state/Translations/actions';
import * as sessionActions from '../../state/Session/actions';
import * as navigatorActions from '../../state/Navigator/actions';

class Navigator extends Component {

  constructor(props) {
    super(props);
    this.validateUrl = this.validateUrl.bind(this);
    this.initWorkspace = this.initWorkspace.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const {
      authenticated,
      activeWorkspace,
      notifications,
      translations,
      removeNotification
    } = this.props;

    const {
      activeWorkspace: nextActiveWorkspace,
      params: nextParams,
      notifications: nextNotifications
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

    if (notifications.length !== nextNotifications.length && nextNotifications.length) {

      const onReloadButton = () => window.location.reload(); // eslint-disable-line no-undef

      const reloadButton = <Icon type="reload" onClick={onReloadButton} />;

      const buildDefaultNotification = (notification, index) => ({
        message: translations[notification.messageKey],
        description: translations[notification.descriptionKey],
        key: index,
        duration: null,
        onClose: () => removeNotification(index)
      });

      nextNotifications
        .filter((nextNotification, index) => index >= notifications.length)
        .forEach((notification, index) => {
          switch (notification.type) {
            case 'success':
              return antNotification.success({
                ...buildDefaultNotification(notification, index),
                duration: 4.5
              });
            case 'error':
              return antNotification.error({
                ...buildDefaultNotification(notification, index)
              });
            case 'info':
              return antNotification.info({
                ...buildDefaultNotification(notification, index)
              });
            case 'warning':
              return antNotification.warning({
                ...buildDefaultNotification(notification, index)
              });
            case 'reload':
              return antNotification.warning({
                ...buildDefaultNotification(notification, index),
                btn: reloadButton,
              });
            default:
              return antNotification.open({
                ...buildDefaultNotification(notification, index)
              });
          }
        });
    }
  }

  componentDidMount() {

    const {
      initTranslations,
      params,
      getConnectedUser,
      getAppVersion
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

    setInterval(() => getAppVersion(), 1 * 1000);

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
    const matches = /o\/\d+\/(d\/\d+\/)?(.*)/.exec(router.location.pathname);
    const destinationPart = matches ? matches[2] : '';
    const url = `${PUBLIC_URL}/o/${redirectActiveWorkspace.organisationId}${datamartPart}/${destinationPart}`; // eslint-disable-line no-undef
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
  checkUrl: PropTypes.func.isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    messageKey: PropTypes.string,
    descriptionKey: PropTypes.string,
    values: PropTypes.object
  })).isRequired,
  removeNotification: PropTypes.func.isRequired,
  getAppVersion: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  isReady: state.translationsState.isReady,
  translations: state.translationsState.translations,
  authenticated: state.sessionState.authenticated,
  activeWorkspace: state.sessionState.activeWorkspace,
  isReactUrl: state.sessionState.isReactUrl,
  token: state.persistedState.access_token,
  notifications: state.navigator.notifications
});

const mapDispatchToProps = {
  initTranslations: TranslationsActions.initTranslations,
  getConnectedUser: sessionActions.getConnectedUser,
  getWorkspaces: sessionActions.getWorkspaces,
  initActiveWorkspace: sessionActions.initActiveWorkspace,
  checkUrl: sessionActions.checkUrl,
  removeNotification: navigatorActions.removeNotification,
  getAppVersion: navigatorActions.getAppVersion
};

Navigator = connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigator);

export default Navigator;
