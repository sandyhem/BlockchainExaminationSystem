import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateTimeUnixPicker = ({ onChange }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleStartChange = (date) => {
    setStartDate(date);
    if (endDate) emitChange(date, endDate);
  };

  const handleEndChange = (date) => {
    setEndDate(date);
    if (startDate) emitChange(startDate, date);
  };

  const emitChange = (start, end) => {
    onChange({
      startUnix: Math.floor(start.getTime() / 1000),
      endUnix: Math.floor(end.getTime() / 1000),
    });
  };

  return (
    <div className="d-flex gap-3">
      <div>
        <DatePicker

          selected={startDate}
          onChange={handleStartChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="Pp"
          placeholderText="Select start"
          className="form-control m-2"
        />
      </div>
      <div>
  
        <DatePicker
          selected={endDate}
          onChange={handleEndChange}
          showTimeSelect
          timeIntervals={15}
          dateFormat="Pp"
          placeholderText="Select end"
          className="form-control m-2"
        />
      </div>
    </div>
  );
};

export default DateTimeUnixPicker;
