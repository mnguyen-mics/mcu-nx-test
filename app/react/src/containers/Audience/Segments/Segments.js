import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ScrollComponent } from '../../../components/ScrollComponent';

import SegmentsActionbar from './SegmentsActionbar';
import AudienceSegmentsTable from './AudienceSegmentsTable';

const { Content } = Layout;

class Segments extends Component {

  render() {
    return (
      <Layout>
        <SegmentsActionbar />
        <Content>
          <ScrollComponent>
            <AudienceSegmentsTable {...this.props} />
          </ScrollComponent>
        </Content>
      </Layout>
    );

  }

}

Segments.propTypes = {
  router: PropTypes.object.isRequired // eslint-disable-line react/forbid-prop-types
};

export default Segments;
