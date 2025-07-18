// Displays an error message if an error is passed
// also captures and logs error stack for production
// debugging.

import React from 'react';
import { Message } from 'semantic';
import { CustomError } from 'utils/error';

export default class ErrorMessage extends React.Component {
  componentDidUpdate(lastProps) {
    const { error } = this.props;
    if (error !== lastProps.error) {
      if (this.canLogError(error)) {
        // eslint-disable-next-line
        console?.error(error);
      }
      this.setState({
        open: false,
      });
    }
  }

  canLogError(error) {
    if (error instanceof CustomError) {
      return false;
    } else {
      return !!error;
    }
  }

  render() {
    const { error } = this.props;
    if (!error) {
      return null;
    }
    return (
      <Message error size="small">
        <p>{error.message}</p>
      </Message>
    );
  }
}
