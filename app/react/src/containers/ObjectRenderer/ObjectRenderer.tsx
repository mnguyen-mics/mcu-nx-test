import * as React from 'react';
import { makeCancelable, CancelablePromise } from '../../utils/ApiHelper';
import { DataResponse } from '../../services/ApiService';

interface ObjectRendererProps<T> {
  id: string;
  renderMethod: (object: T) => JSX.Element;
  fetchingMethod: (...args: any[]) => Promise<DataResponse<T>>
}

interface ObjectRendererState<T> {
  object?: T;
}

export default class ObjectRenderer<T> extends React.Component<
  ObjectRendererProps<T>,
  ObjectRendererState<T>
> {
  cancelablePromise: CancelablePromise<T>;

  constructor(props: ObjectRendererProps<T>) {
    super(props);
    this.state = { object: undefined };
  }

  componentDidMount() {
    this.fetchObject(this.props.id);
  }

  componentWillReceiveProps(nextProps: ObjectRendererProps<T>) {
    this.fetchObject(this.props.id);
  }

  componentWillUnmount() {
    if (this.cancelablePromise) this.cancelablePromise.cancel();
  }

  fetchObject = (id: string) => {
    this.cancelablePromise = makeCancelable(
      this.props.fetchingMethod(id).then(res => res.data),
    );

    return this.cancelablePromise.promise.then(object => {
      this.setState({
        object: object,
      });
    });
  };

  render() {
    const { renderMethod } = this.props;

    const { object } = this.state;

    return object ? renderMethod(object) : null;
  }
}
