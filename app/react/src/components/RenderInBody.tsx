import * as React from 'react';
import createReactClass from 'create-react-class';
import * as DOM from 'react-dom';

export default createReactClass({

  componentDidMount: function() {
    this.popup = document.createElement("div");
    document.body.appendChild(this.popup);
    this._renderLayer();
  },

  componentDidUpdate: function() {
    this._renderLayer();
  },


  componentWillUnmount: function() {
    DOM.unmountComponentAtNode(this.popup);
    document.body.removeChild(this.popup);
  },


  _renderLayer: function() {
    DOM.render(this.props.children, this.popup);
  },

  render: function() {
    // Render a placeholder
    return <div />
  }

});