import React from 'react';

export default class BasicLayout extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}
