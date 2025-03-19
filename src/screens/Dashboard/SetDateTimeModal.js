import React from 'react';
import 'react-day-picker/style.css';

import { Modal, Button } from 'semantic';
import { DayPicker } from 'react-day-picker';

import modal from 'helpers/modal';
import { UTCDate } from '@date-fns/utc';
import { setHours, setMinutes } from 'date-fns';
import { Form } from 'semantic-ui-react';

@modal
export default class SetDateTimeModal extends React.Component {
  state = {
    date: this.props.date,
    time: '',
    error: null,
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
        date: new UTCDate(
          newDate.getUTCFullYear(),
          newDate.getUTCMonth(),
          newDate.getUTCDate(),
          hours,
          minutes
        ),
      });
    };

    return (
      <>
        <Modal.Header>Set current date and time</Modal.Header>
        <Modal.Content>
          <Form onSubmit={this.onSubmit} id="set-date-time-form">
            <DayPicker
              timeZone={'UTC'}
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
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button primary form="set-date-time-form" content="Save" />
        </Modal.Actions>
      </>
    );
  }
}
