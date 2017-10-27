import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Col, Row } from 'antd';

import { ButtonStyleless } from '../../../../../../../components/index.ts';

function PlacementHeader({
  className,
  displayTableOptions,
  handlers,
  placements,
  title,
}) {

  const checkedPlacements = placements.filter(placement => placement.checked);
  const checkAll = checkedPlacements.length === placements.length;
  const indeterminate = !!checkedPlacements.length && (checkedPlacements.length < placements.length);

  return (
    <div className={`list-header ${className}`}>
      <Row type="flex" align="middle">
        <Col span={18} className="bold row-name">
          {title}
        </Col>

        <Col span={4}>
          <div>
            <ButtonStyleless
              className={displayTableOptions ? 'theme-color' : ''}
              onClick={handlers.updateDisplayOptions(true)}
            >show
            </ButtonStyleless>

            <span className="button-separator">/</span>

            <ButtonStyleless
              className={!displayTableOptions ? 'theme-color' : ''}
              onClick={handlers.updateDisplayOptions(false)}
            >hide
            </ButtonStyleless>
          </div>
        </Col>

        {displayTableOptions
          ? (
            <Col span={1}>
              <Checkbox
                checked={checkAll}
                indeterminate={indeterminate}
                onClick={handlers.updateAllCheckboxes(!checkAll)}
              />
            </Col>
          )
          : <Col span={1} />
        }
      </Row>
    </div>
  );
}

PlacementHeader.defaultProps = {
  className: '',
};

PlacementHeader.propTypes = {
  className: PropTypes.string,
  displayTableOptions: PropTypes.bool.isRequired,

  handlers: PropTypes.shape({
    updateAllCheckboxes: PropTypes.func.isRequired,
    updateDisplayOptions: PropTypes.func.isRequired,
  }).isRequired,

  placements: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired).isRequired,

  title: PropTypes.string.isRequired,
};

export default PlacementHeader;
