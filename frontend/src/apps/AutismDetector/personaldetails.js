import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

function DisplayPersonalDetails() {
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    gender: '',
    occupation: '',
    education: '',
    interests: '',
    nationality: '',
    ethnicity: '',
  });

  const navigate = useNavigate(); // Create an instance of useNavigate

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = 'someUserId'; // Replace with actual user ID retrieval logic
        const response = await fetch(`http://127.0.0.1:5000/get_personal_details?user_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setDetails(data);
        } else {
          console.error('Failed to fetch details');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to handle redirection
  const redirectToEdit = () => {
    navigate('/autism_instructions/editpersonaldetails');
  };

  const handleGoBack = () => {
    navigate('/autism_instructions'); // Redirect to '/autism_instructions'
  };

  return (
    <div className="details-container">
      <button2 type="button2" className="go-back-button" onClick={handleGoBack}>&larr;</button2>
      <h2>Personal Details</h2>
      <div>
        <strong>First Name:</strong>
        {details.firstName}
      </div>
      <div>
        <strong>Last Name:</strong>
        {details.lastName}
      </div>
      <div>
        <strong>Date of Birth:</strong>
        {details.dateOfBirth}
      </div>
      <div>
        <strong>Email:</strong>
        {details.email}
      </div>
      <div>
        <strong>Gender:</strong>
        {details.gender}
      </div>
      <div>
        <strong>Occupation:</strong>
        {details.occupation}
      </div>
      <div>
        <strong>Education Level:</strong>
        {details.education}
      </div>
      <div>
        <strong>Interests and Hobbies:</strong>
        {details.interests}
      </div>
      <div>
        <strong>Nationality:</strong>
        {details.nationality}
      </div>
      <div>
        <strong>Ethnicity:</strong>
        {details.ethnicity}
      </div>
      <button type="button" onClick={redirectToEdit}>Edit Personal Details</button>
    </div>
  );
}

export default DisplayPersonalDetails;
