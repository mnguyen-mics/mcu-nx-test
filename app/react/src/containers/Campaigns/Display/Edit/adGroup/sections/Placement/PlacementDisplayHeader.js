import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Col, Row } from 'antd';

import { ButtonStyleless, Form } from '../../../../../../../components';

const { CheckboxWithSign } = Form;

function PlacementDisplayHeader({
  displayTableOptions,
  handlers,
  placements,
  title,
}) {

  const numberOfCheckedRows = placements.filter(placement => placement.checked).length;
  const allIsChecked = numberOfCheckedRows && numberOfCheckedRows === placements.length;
  const checkedStatus = (!allIsChecked
    ? (!numberOfCheckedRows ? 'none' : 'some')
    : 'all'
  );

  return (
    <li>
      <Row>
        <Col span={18} className="bold row-name title-wrapper">
          {title}
        </Col>

        <Col span={4} className="title-wrapper">
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
          <Col span={1} className="title-checkbox-wrapper">
            {checkedStatus === 'some'
              ? (
                <CheckboxWithSign
                  className="checkbox-with-sign"
                  onClick={handlers.updateAllCheckboxes(!allIsChecked)}
                  sign="-"
                />
              )
              : (
                <Checkbox
                  checked={allIsChecked}
                  onClick={handlers.updateAllCheckboxes(!allIsChecked)}
                />
              )
            }
          </Col>
        )
        : <Col span={1} />
      }
      </Row>
    </li>
  );
}

PlacementDisplayHeader.propTypes = {
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

export default PlacementDisplayHeader;
