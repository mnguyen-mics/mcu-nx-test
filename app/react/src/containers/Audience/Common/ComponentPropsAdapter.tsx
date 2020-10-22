import * as React from 'react'

function ComponentPropsAdapter<T, S>(Display: React.ComponentType<S>, adapter: (t: T) => S): React.ComponentClass<T> {
  return class extends React.Component<T> {
    render() {
      const props = this.props;
      const adapted = adapter(props)
      return <Display {...adapted}/>
    }
  }
}
export default ComponentPropsAdapter