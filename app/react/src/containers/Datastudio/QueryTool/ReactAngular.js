import React, { Component, PropTypes } from 'react';

// inpired by https://www.npmjs.com/package/react-angular

class ReactAngular extends Component {

  constructor(props) {
    super(props);
    if (window.angular) {
      this.state = {
        angular: window.angular
      };
    }

  }

  componentDidMount() {

    const { scope, isolate } = this.props;

    const parentScope = this.context.$scope || this.$element.scope();
    const $injector = this.$element.injector();

    const $compile = $injector.get('$compile');
    const $rootScope = $injector.get('$rootScope');

    this.$scope = scope ? parentScope.$new(isolate) : parentScope;

    if (this.state.angular.isObject(scope)) {
      this.state.angular.extend(this.$scope, scope);
    }

    $compile(this.$element)(this.$scope);
    this.$element.data('$scope', this.$scope);
    $rootScope.$evalAsync();
  }


  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { wrapperTag, wrapperAttrs, children } = this.props;

    const ref = (element) => {
      this.$element = this.state.angular.element(element);
      return this.$element;
    };

    if (children) {
      if (!React.isValidElement(children)) {
        throw new Error(`Only one child is allowed in AngularTemplate.
          Found ${children.length}: ${children.map(({ type }) => type).join(', ')}.`);
      }


      const child = React.cloneElement(children, {
        ...wrapperAttrs,
        ref,
      });

      return child;
    }

    return React.createElement(wrapperTag, {
      ...wrapperAttrs,
      ref,
    }, '');
  }
}

ReactAngular.propTypes = {
  isolate: PropTypes.bool,
  scope: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  wrapperTag: PropTypes.string,
  wrapperAttrs: PropTypes.shape({}),
};

ReactAngular.defaultProps = {
  isolate: false,
  scope: true,
  wrapperTag: 'div',
  wrapperAttrs: {},
};

const CONTEXT_TYPES = {
  $scope: PropTypes.any,
};

ReactAngular.contextTypes = CONTEXT_TYPES;

export default ReactAngular;
