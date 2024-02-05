import React, { useState } from 'react';
import axios from 'axios';

function Notes() {
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleNoteChange = (e) => {
    setNote(e.target.value);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = ''; // Replace this with the token you get from user authentication
      const response = await axios.post('/add_note', {
        notes: note,
        date,
        time,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.msg);
      // Clear the form
      setNote('');
      setDate('');
      setTime('');
    } catch (error) {
      console.error('There was an error adding the note:', error.response.data.error);
    }
  };

  return (
    <div>
      <h2>Add a Note</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">Date:</label>
          <input id="date" type="date" value={date} onChange={handleDateChange} required />
        </div>
        <div>
          <label htmlFor="time">Time:</label>
          <input id="time" type="time" value={time} onChange={handleTimeChange} required />
        </div>
        <div>
          <label htmlFor="note">Note:</label>
          <textarea id="note" value={note} onChange={handleNoteChange} required />
        </div>
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
}

export default Notes;
