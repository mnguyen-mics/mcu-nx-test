import React, { Component, PropTypes } from 'react';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { GridInput as Input, Select } from '../../components/Forms';

import CampaignsSidebar from './CampaignsSidebar';


class EditCampaign extends Component {

  render() {

    const { handleSubmit } = this.props;
    const Option = Select.Option;

    const selectAfter = (
      <Select name="Field4" defaultValue="day" className="mics-gridinput-select">
        <Option value="day">Per Day</Option>
        <Option value="week">Per Week</Option>
      </Select>
    );

    const onSubmitF = () => {};

    return (
      <Layout>
        <CampaignsSidebar {...this.props}>
          <form name="editCampaign" onSubmit={handleSubmit(onSubmitF)} >
            <Input name="Field1" label="Write here" tooltip="This is not a trap" />
            <Input name="Field2" label="You have to write here" isRequired tooltip="This may be a trap" />
            <Input
              name="Field3"
              label="Do what you have to do"
              isRequired
              tooltip="Guess what ?"
              addonAfter={selectAfter}
            />
            <div>
              <button type="submit" >Submit</button>
            </div>
          </form>
        </CampaignsSidebar>
      </Layout>
    );
  }
}

EditCampaign.propTypes = {
  handleSubmit: PropTypes.func // eslint-disable-line react/require-default-props
};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  reduxForm({
    form: 'editCampaign'
  })
)(EditCampaign);
