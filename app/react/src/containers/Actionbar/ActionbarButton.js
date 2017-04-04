
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
      currentSecondaryBar
    } = this.props;

    const content = imageUrl ? <img src={imageUrl} alt={text} /> : text;

    const selected = currentSecondaryBar !== null && currentSecondaryBar === secondaryBar;

    const containerClassNamesWithSelected = containerClassNames.slice();

    if (selected) { containerClassNamesWithSelected.push('selected'); }

    const clickAction = evt => {
      setSecondaryActionBar(secondaryBar);
      if (this.props.onClick) { this.props.onClick(evt); }
    };

    return (
      <div className={classNames(containerClassNamesWithSelected)}>
        <button className={classNames(buttonClassNames)} onClick={clickAction} {...this.props}>
          {content}
        </button>
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
