
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { ActionbarActions } from './redux';

class ActionbarButton extends Component {

  render() {

    const {
      text,
      imageUrl,
      containerClassNames,
      buttonClassNames,
      secondaryBar,
      setSecondaryActionBar,
      currentSecondaryBar,
      onClick,
      ...other
    } = this.props;

    const content = imageUrl ? <img src={imageUrl} alt={text} /> : text;

    const selected = currentSecondaryBar !== null && currentSecondaryBar === secondaryBar;

    const selectionClasses = ['selectionArrow'];

    if (!selected) { selectionClasses.push('hidden'); }


    const clickAction = evt => {
      setSecondaryActionBar(secondaryBar);
      if (onClick) { onClick(evt); }
    };

    return (
      <div className={classNames(containerClassNames)}>
        <button className={classNames(buttonClassNames)} onClick={clickAction} {...other}>
          {content}
        </button>
        <svg className={classNames(selectionClasses)} width="40" height="10">
          <polyline
            points="0 9 20 0 40 9" stroke="#d3dbe1" strokeWidth="1"
            strokeLinecap="butt" fill="none"
          />
        </svg>
      </div>
    );
  }
}

ActionbarButton.propTypes = {
  text: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  secondaryBar: PropTypes.string,
  containerClassNames: PropTypes.arrayOf(PropTypes.string),
  buttonClassNames: PropTypes.arrayOf(PropTypes.string),
  setSecondaryActionBar: PropTypes.func, // eslint-disable-line react/require-default-props
  currentSecondaryBar: PropTypes.func, // eslint-disable-line react/require-default-props
  onClick: PropTypes.func // eslint-disable-line react/require-default-props
};

ActionbarButton.defaultProps = {
  buttonClassNames: ['mcs-actionbar-button'],
  containerClassNames: ['mcs-actionbar-button-wrapper'],
  secondaryBar: null,
  imageUrl: null
};

const mapStateToProps = state => ({
  currentSecondaryBar: state.actionbarState.secondary
});
const mapDispatchToProps = {
  setSecondaryActionBar: ActionbarActions.setSecondaryActionBar
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActionbarButton);
