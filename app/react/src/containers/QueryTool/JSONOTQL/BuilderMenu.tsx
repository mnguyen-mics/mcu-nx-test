import * as React from 'react';
import { McsIcon, WindowBodyPortal } from '../../../components';
import { Button } from '@mediarithmics-private/mcs-components-library';
import { Icon } from 'antd';

export interface UndoRedoProps {
  enableUndo: boolean;
  enableRedo: boolean;
  handleUndo: () => void;
  handleRedo: () => void;
}

export interface BuilderMenuProps {
  undoRedo: UndoRedoProps;
}

interface State {
  viewHelp: boolean;
}

export default class BuilderMenu extends React.Component<
  BuilderMenuProps,
  State
> {
  constructor(props: BuilderMenuProps) {
    super(props);
    this.state = {
      viewHelp: false,
    };
  }

  render() {
    const {
      undoRedo: { enableRedo, enableUndo, handleRedo, handleUndo },
    } = this.props;

    const { viewHelp } = this.state;

    const openCloseModal = () =>
      this.setState({ viewHelp: !this.state.viewHelp });

    return (
      <div style={{ position: 'relative', height: 0 }}>
        <div className="button-helpers bottom">
          <Button
            disabled={!enableUndo}
            onClick={handleUndo}
            className="helper"
          >
            <Icon type="arrow-left" />
          </Button>
          <Button
            disabled={!enableRedo}
            onClick={handleRedo}
            className="helper"
          >
            <Icon type="arrow-right" />
          </Button>
          <Button onClick={openCloseModal} className="helper">
            <McsIcon type="question" />
          </Button>
        </div>
        {viewHelp && (
          <WindowBodyPortal>
            <div className="overview-modal">
              <div onClick={openCloseModal} className="overlay" />
              <div className="mcs-modal">
                <div className="keyboard-line">
                  <span className="keyboard-control">f</span>{' '}
                  <span className="keyboard-about">zoom to fit</span>
                </div>
                <div className="keyboard-line">
                  <span className="keyboard-control">r</span>{' '}
                  <span className="keyboard-about">reset zoom</span>
                </div>
                <div className="keyboard-line">
                  <span className="keyboard-control">ctrl</span>{' '}
                  <span className="keyboard-about">+</span>{' '}
                  <span className="keyboard-control">z</span>{' '}
                  <span className="keyboard-about">undo</span>
                </div>
                <div className="keyboard-line">
                  <span className="keyboard-control">ctrl</span>{' '}
                  <span className="keyboard-about">+</span>{' '}
                  <span className="keyboard-control">shift</span>{' '}
                  <span className="keyboard-about">+</span>{' '}
                  <span className="keyboard-control">z</span>{' '}
                  <span className="keyboard-about">redo</span>
                </div>
              </div>
            </div>
          </WindowBodyPortal>
        )}
      </div>
    );
  }
}
