import React from 'react';
import 'react-day-picker/style.css';

import { Modal, Button, Message } from 'semantic';
import { DayPicker } from 'react-day-picker';

import modal from 'helpers/modal';
import { setHours, setMinutes } from 'date-fns';
import { Form } from 'semantic-ui-react';

@modal
export default class SetDateTimeModal extends React.Component {
  state = {
    date: this.props.date,
    time: '',
    error: null,
  };

  getUTCDateTime = () => {
    const { date } = this.state;
    if (!date) return null;

    return date.toISOString().replace('T', ' ').slice(0, 19);
  };

  onSubmit = () => {
    this.props.onSave(this.state);
    this.props.close();
  };

  render() {
    const { date, time } = this.state;

    const handleTimeChange = (e) => {
      const newTime = e.target.value;
      if (!date) {
        this.setState({ ...this.state, time: newTime });
        return;
      }
      const [hours, minutes] = newTime
        .split(':')
        .map((str) => parseInt(str, 10));
      const newDate = setHours(setMinutes(date, minutes), hours);
      this.setState({ ...this.state, date: newDate, time: newTime });
    };

    const handleDaySelect = (newDate) => {
      if (!time || !newDate) {
        this.setState({ ...this.state, date: newDate });
        return;
      }
      const [hours, minutes] = time.split(':').map((str) => parseInt(str, 10));
      this.setState({
        ...this.state,
        date: new Date(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
          hours,
          minutes
        ),
      });
    };

    return (
      <>
        <Modal.Header>Set date and time</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="set-date-time-form">
            <DayPicker
              animate
              mode="single"
              selected={date}
              onSelect={handleDaySelect}
            />

            <Form.Input
              type={'time'}
              value={time}
              onChange={handleTimeChange}
              label={'Time'}
            />

            {date && time && (
              <Message info>
                <Message.Header>Time Zone Conversion</Message.Header>
                <p>
                  The date and time you select is in your local time zone. When
                  sending messages, this will be converted to UTC:
                </p>
                <p>
                  <strong>UTC Date/Time:</strong> {this.getUTCDateTime()}
                </p>
                <p>
                  <em>
                    Note: This is the actual time that will be used when sending
                    messages.
                  </em>
                </p>
              </Message>
            )}
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="set-date-time-form" content="Save" />
        </Modal.Actions>
      </>
    );
  }
}
