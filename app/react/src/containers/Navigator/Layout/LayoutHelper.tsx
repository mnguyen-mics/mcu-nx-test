import { KeycloakService } from '@mediarithmics-private/advanced-components';
import { McsIcon } from '@mediarithmics-private/mcs-components-library';
import { Alert } from 'antd';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import messages from '../../Header/messages';

export const buildAccountsMenu = (organisationId: string) => {
  const logOutFunction = () => KeycloakService.doLogout();
  const logoutMessage = <FormattedMessage {...messages.logout} />;

  return [
    <Link
      key={0}
      to={{
        pathname: `/v2/o/${organisationId}/settings/account/my_profile`,
      }}
    >
      <FormattedMessage {...messages.account} />
    </Link>,
    KeycloakService.isKeycloakEnabled() ? (
      <div onClick={logOutFunction} key={1}>
        {logoutMessage}
      </div>
    ) : (
      <Link to='/logout' key={1}>
        {logoutMessage}
      </Link>
    ),
  ];
};

export const buildSettingsButton = (organisationId: string) => (
  <Link
    className='mcs-header_menu_link'
    to={`/v2/o/${organisationId}/settings/organisation/labels`}
  >
    <McsIcon type='options' className='mcs-header_menuIcon' />
  </Link>
);

export const ProductionApiEnvironment = (
  <Alert
    className='mcs-navigator-header-title-alert'
    message='You are using production API environment !'
    type='error'
    showIcon={true}
  />
);
