import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthTokenContext } from '../../App';
import autismHomeVideo from '../../images/autism-note.gif';

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_DEV
  : process.env.REACT_APP_PROD;

function Notes() {
  const { token } = useContext(AuthTokenContext);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  const autismHomeVideoStyle = {
    width: '15%', // Adjust the width as needed, e.g., to 50% of its container
    height: '300px', // Keeps the aspect ratio of the image
    float: 'left',
    marginTop: '-140vh',
    marginLeft: '85%',
    position: 'relative',
    display: 'block', // This ensures the video is displayed as a block element, removing any unwanted space around it
    objectFit: 'cover', // This will cover the area of the container without stretching the video
  };

  const fetchNotes = async () => {
    console.log(token);

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
    color: '#C68B77',
    padding: '10px 15px',
    marginTop: '20px',
    marginLeft: '-80%',
    borderRadius: '5px',
    border: '2px solid #C68B77',
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
      backgroundColor: '#C68B77', // Dark green background
      color: 'white', // Text color set to white
    }}
    >
      <button type="button" style={goBackButtonStyle} onClick={handleGoBack}>&larr; Go Back</button>
      <h1 style={{
        textAlign: 'center', color: '#C68B77', border: '2px solid white', padding: '10px', background: '#F5D0AF',
      }}
      >
        Notes
      </h1>
      <br />
      <h4 style={{
        textAlign: 'center', color: 'white', border: '2px solid white', padding: '10px',
      }}
      >
        Treat this area as an area where you note your regular day. This will be used to track your autistic characteristics in writing. The notes you save will be run through a trained algorithm which will detect these characteristics in your writing. For the algorithm to work best, please do not proofread or grammatically correct your notes and write them as you speak.
      </h4>
      <h5 style={{
        textAlign: 'center', color: 'white', border: '2px solid white', padding: '10px',
      }}
      >
        Please be aware that the algorithm checks for charactecteristics like repition in each sentence. If the count (characteristics) in a note is more than or equal to 15, it gives feedback saying the note could have been written by a person having ASD. It is also to be noted that just because the algorithm states the note a certain way doesn&apos;t mean that it is 100% accurate since each individual is unique and different.
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
            backgroundColor: '#F5D0AF', // Light green button
            color: '#C68B77',
            cursor: 'pointer',
          }}
        >
          Add Note
        </button>
      </div>
      <hr style={{ borderColor: 'white' }} />
      <b>
        <div style={{ marginTop: '20px' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: note.prediction === 1 ? '#6B536B' : 'white', // Change color based on prediction
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
      </b>
      <div style={autismHomeVideoStyle} className="video-container">
        <img src={autismHomeVideo} alt="Autism Home" style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

export default Notes;
