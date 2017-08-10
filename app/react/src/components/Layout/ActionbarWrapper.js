import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';

import { McsIcons } from '../McsIcons';
import { Actionbar } from '../../containers/Actionbar';

function ActionbarWrapper({
  breadcrumbPaths,
  disabled,
  message,
  onClick,
 }) {

  return (
    <Actionbar path={breadcrumbPaths}>
      <Button type="primary" htmlType="submit" disabled={disabled}>
        <McsIcons type="plus" />
        <FormattedMessage {...message} />
      </Button>

      <McsIcons
        type="close"
        className="close-icon"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      />
    </Actionbar>
  );
}

ActionbarWrapper.defaultProps = {
  disabled: false,
  onClick: () => {}
};

ActionbarWrapper.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,

  disabled: PropTypes.bool,

  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
  }).isRequired,

  onClick: PropTypes.func,
};

export default ActionbarWrapper;
