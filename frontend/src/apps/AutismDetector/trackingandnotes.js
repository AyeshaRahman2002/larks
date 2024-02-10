import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthTokenContext } from '../../App';

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_DEV
  : process.env.REACT_APP_PROD;

function Notes() {
  const { token } = useContext(AuthTokenContext);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const fetchNotes = async () => {
    await axios.get(`${BASEURL}api/notes`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (response.status === 200) {
        setNotes(response.data.notes);
      }
    });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // React Router v6 uses useNavigate hook
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);

  const goBackButtonStyle = {
    backgroundColor: '#f0f0f0',
    color: '#034d32',
    padding: '10px 15px',
    marginTop: '20px',
    marginLeft: '-80%',
    borderRadius: '5px',
    border: '2px solid #034d32',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  const handlePostNote = async () => {
    if (!newNote || newNote.length < 1000) {
      alert('Each note must have at least 1000 characters.');
      return;
    }
    await axios.post(`${BASEURL}api/notes`, { note: newNote }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }).then(() => {
      fetchNotes(); // Refresh the list of notes after adding a new one
      setNewNote(''); // Reset the input field
    });
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '50px auto 0', // Adds top margin space
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      backgroundColor: '#034d32', // Dark green background
      color: 'white', // Text color set to white
    }}
    >
      <button type="button" style={goBackButtonStyle} onClick={handleGoBack}>&larr; Go Back</button>
      <h1 style={{
        textAlign: 'center', color: '#034d32', border: '2px solid white', padding: '10px', background: '#ccdcc1',
      }}
      >
        Notes
      </h1>
      <br />
      <h4 style={{
        textAlign: 'center', color: 'white', border: '2px solid white', padding: '10px',
      }}
      >
        Treat this area as a diary where you note your regular day. This will be used to track your autistic characteristics in writing. The notes you save will be run through a trained algorithm which will look for autistic characteristics in your writing. For the algorithm to work best, please do not proofread or grammatically correct your notes and write them as you speak.
      </h4>
      <h5 style={{
        textAlign: 'center', color: 'white', border: '2px solid white', padding: '10px',
      }}
      >
        Please be aware that the algorithm checks for charactecteristics like repition in each sentence. If the count in a notes is more than or equal to 15, it gives feedback with saying the note could have been written by a person with ASD. It is also to be noted that just because the algorithm states as auatistic doesn&apos;t mean that it is correct since each individual is different.
      </h5>
      <br />
      <div style={{ display: 'flex', marginBottom: '20px' }}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note here"
          style={{
            flexGrow: 1,
            marginRight: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white', // Ensures input is visible
            color: 'black', // Text color for input
          }}
        />
        <button
          type="button"
          onClick={handlePostNote}
          disabled={newNote === ''}
          style={{
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#afc7ae', // Light green button
            color: '#034d32',
            cursor: 'pointer',
          }}
        >
          Add Note
        </button>
      </div>
      <hr style={{ borderColor: 'white' }} />
      <div style={{ marginTop: '20px' }}>
        {notes.map((note) => (
          <div
            key={note.id}
            style={{
              marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: note.prediction === 1 ? 'yellow' : 'white', // Change color based on prediction
            }}
          >
            <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>{note.note}</p>
            <small style={{ display: 'block', marginTop: '10px', color: '#ccc' }}>
              Added on:
              {new Date(note.timestamp).toLocaleString()}
            </small>
            {/* Highlighting text based on prediction */}
            {note.prediction !== undefined && (
              <p style={{ fontWeight: 'bold' }}>
                {note.prediction === 1 ? '🌟 This note exhibits characteristics of autism.' : 'This note does not exhibit characteristics of autism.'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes;
