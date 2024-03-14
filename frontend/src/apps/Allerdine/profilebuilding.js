import React from 'react';

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh', // Adjust the height to make it square
  marginTop: '-50px',
};

/*
const buttonStyle = {
  width: '150px',
  height: '150px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  margin: '5px',
};
 */

const messageStyle = {
  marginBottom: '20px', // Add margin to create space between the message and buttons
  fontSize: '24px', // Change the font size
  color: 'blue', // Change the text color
};

function profilepage() {
  const userEmail = sessionStorage.getItem('email')
    ? sessionStorage.getItem('email').substring(1, sessionStorage.getItem('email').length - 1)
    : 'User';
  return (
    <div className="DepressiLess" style={containerStyle}>
      <div>
        <div style={{ textAlign: 'center', ...messageStyle }}>
          <b>
            <h1>
              Welcome
              {userEmail}
              !
            </h1>
          </b>
        </div>
      </div>
    </div>
  );
}
export default profilepage;
