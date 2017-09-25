import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isInvalid, submit } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import { Button } from 'antd';

import McsIcons from '../McsIcons';
import { Actionbar } from '../../containers/Actionbar';

/* Redux-form allows us to use submit buttons removed from their normal form components.
 * This component includes a remote submit button.
 * See example at http://redux-form.com/6.8.0/examples/remoteSubmit/
 */
function ActionbarWrapper({
  breadcrumbPaths,
  disabled,
  dispatch,
  formId,
  message,
  onClose,
 }) {

  const submitButtonProps = {
    disabled,
    htmlType: 'submit',
    onClick: () => dispatch(submit(formId)),
    type: 'primary',
  };

  return (
    <Actionbar path={breadcrumbPaths}>
      <Button {...submitButtonProps} className="mcs-primary">
        <McsIcons type="plus" />
        <FormattedMessage {...message} />
      </Button>

      <McsIcons
        type="close"
        className="close-icon"
        style={{ cursor: 'pointer' }}
        onClick={onClose}
      />
    </Actionbar>
  );
}

ActionbarWrapper.defaultProps = {
  disabled: null,
  onClose: () => {},
};

ActionbarWrapper.propTypes = {
  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,

  disabled: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,

  message: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
  }).isRequired,

  onClose: PropTypes.func,
};

export default connect(
  (state, ownProps) => ({
    /* For additional redux-form selectors, such as "pristine" or "form errors",
     * check http://redux-form.com/6.8.0/docs/api/Selectors.md/
     */
    disabled: isInvalid(ownProps.formId)(state),
  }),
)(ActionbarWrapper);
