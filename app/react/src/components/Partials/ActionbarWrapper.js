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
  onSubmit
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
        onClick={onSubmit}
      />
    </Actionbar>
  );
}

ActionbarWrapper.defaultProps = {
  disabled: false,
  onSubmit: () => {}
};

ActionbarWrapper.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string,
  })).isRequired,

  disabled: PropTypes.bool,

  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
  }).isRequired,

  onSubmit: PropTypes.func,
};

export default ActionbarWrapper;
