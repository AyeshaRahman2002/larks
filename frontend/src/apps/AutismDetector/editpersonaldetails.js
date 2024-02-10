import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import './editpersonaldetails.css';
import { AuthTokenContext } from '../../App';

function EditPersonalDetailsForm() {
  const [details, setDetails] = useState({
    userId: '', // Initialize userId
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
  const navigate = useNavigate(); // Hook for navigation
  const { token } = useContext(AuthTokenContext);

  const handleChange = (e) => {
    setDetails({
      ...details,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Assuming you've already defined 'details' state that contains all form fields
    // Make sure the names of the state properties match the model's attributes in your backend

    try {
      // Replace the URL with your actual endpoint
      const response = await fetch('http://127.0.0.1:5000/save_personal_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Assuming 'token' is defined in your component's state or context
          // For example, it could come from useContext(AuthTokenContext) if you're following a pattern similar to trackingandnotes.js
          Authorization: `Bearer ${token}`, // Add this only if your endpoint requires authentication
        },
        body: JSON.stringify({
          // Map your 'details' state to the expected JSON structure required by your Flask API
          // Assuming your API expects camelCase keys, convert them if necessary
          user_id: details.userId, // Include this if your model expects a 'user_id', and ensure it's available in your state
          firstName: details.firstName,
          lastName: details.lastName,
          dateOfBirth: details.dateOfBirth,
          email: details.email,
          gender: details.gender,
          occupation: details.occupation,
          education: details.education,
          interests: details.interests,
          nationality: details.nationality,
          ethnicity: details.ethnicity,
        }),
      });

      if (!response.ok) {
        // If the server response was not OK, handle errors
        const errorData = await response.json();
        console.error('Error:', errorData.msg);
        alert(`Failed to save details: ${errorData.msg}`);
      } else {
        // On success, you may want to clear the form, navigate to another route, or display a success message
        const result = await response.json();
        console.log('Success:', result.msg);
        alert('Successfully saved!');

        // Optionally, navigate to another route upon success
        // navigate('/some-other-route');
      }
    } catch (error) {
      // Handle network errors
      console.error('Network error:', error);
      alert('Network error: Could not connect to server');
    }
  };

  const handleGoBack = () => navigate(-1);

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <button2 type="button2" className="go-back-button" onClick={handleGoBack}>&larr;</button2>
        <div className="form-row">
          <label htmlFor="firstName" className="label-box">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={details.firstName}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="lastName" className="label-box">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={details.lastName}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="dateOfBirth" className="label-box">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={details.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="email" className="label-box">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={details.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="gender" className="label-box">Gender:</label>
          <select id="gender" name="gender" value={details.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="occupation" className="label-box">Occupation:</label>
          <select id="occupation" name="occupation" value={details.occupation} onChange={handleChange}>
            <option value="">Select Occupation</option>
            <option value="Arts and Entertainment">Arts and Entertainment</option>
            <option value="Business and Finance">Business and Finance</option>
            <option value="Education and Training">Education and Training</option>
            <option value="Engineering and Technology">Engineering and Technology</option>
            <option value="Healthcare and Medical Services">Healthcare and Medical Services</option>
            <option value="Information Technology (IT) and Software">Information Technology (IT) and Software</option>
            <option value="Legal and Law Enforcement">Legal and Law Enforcement</option>
            <option value="Manufacturing and Construction">Manufacturing and Construction</option>
            <option value="Marketing, Advertising, and Public Relations">Marketing, Advertising, and Public Relations</option>
            <option value="Natural Sciences and Environmental">Natural Sciences and Environmental</option>
            <option value="Non-profit and Community Services">Non-profit and Community Services</option>
            <option value="Retail and Customer Service">Retail and Customer Service</option>
            <option value="Sales and Business Development">Sales and Business Development</option>
            <option value="Transportation and Logistics">Transportation and Logistics</option>
            <option value="Hospitality and Tourism">Hospitality and Tourism</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Agriculture and Forestry">Agriculture and Forestry</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Sports and Recreation">Sports and Recreation</option>
            <option value="Student">Student (if currently studying)</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="education" className="label-box">Education Level:</label>
          <select id="education" name="education" value={details.education} onChange={handleChange}>
            <option value="">Select Education Level</option>
            <option value="No Formal Educatio">No Formal Education</option>
            <option value="Primary Education">Primary Education</option>
            <option value="Secondary Education / High School">Secondary Education / High School</option>
            <option value="Vocational Training">Vocational Training</option>
            <option value="ssociate&apos;s Degree">Associate&apos;s Degree</option>
            <option value="Bachelor&apos;s Degree">Bachelor&apos;s Degree</option>
            <option value="Master&apos;s Degree">Master&apos;s Degree</option>
            <option value="Doctorate (PhD)">Doctorate (PhD)</option>
            <option value="Professional Degree">Professional Degree (e.g., MD, JD)</option>
            <option value="Post-Doctoral Training">Post-Doctoral Training</option>
            <option value="Currently Studying">Currently Studying</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="interests" className="label-box">Interests and Hobbies:</label>
          <input
            type="text"
            id="interests"
            name="interests"
            value={details.interests}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label htmlFor="nationality" className="label-box">
            Nationality:
          </label>
          <select
            id="nationality"
            name="nationality"
            value={details.nationality}
            onChange={handleChange}
          >
            <option value="">Select Nationality</option>
            <option value="Indian/Pakistani-asian">Indian/Pakistani-asian</option>
            <option value="East-Asian">East-Asian</option>
            <option value="Asian">Asian</option>
            <option value="Asian">Middle East</option>
            <option value="African">African</option>
            <option value="European">European</option>
            <option value="North American">North American</option>
            <option value="South American">South American</option>
            <option value="South American">Australian</option>
          </select>
        </div>
        <div className="form-row">
          <label htmlFor="ethnicity" className="label-box">
            Ethnicity:
          </label>
          <select
            id="ethnicity"
            name="ethnicity"
            value={details.ethnicity}
            onChange={handleChange}
          >
            <option value="">Select Ethnicity</option>
            <option value="Indian/Pakistani-asian">Indian/Pakistani-asian</option>
            <option value="East-Asian">East-Asian</option>
            <option value="Asian">Asian</option>
            <option value="Asian">Middle East</option>
            <option value="African">African</option>
            <option value="European">European</option>
            <option value="North American">North American</option>
            <option value="South American">South American</option>
            <option value="South American">Australian</option>
          </select>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default EditPersonalDetailsForm;
