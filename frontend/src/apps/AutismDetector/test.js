import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function TestComponent() {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '86vh',
    backgroundColor: '#ccdcc1',
  };

  const contentContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '800px',
    height: '100%',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.2)',
  };

  const buttonContainerStyle = {
    display: 'flex',
    justifyContent: 'center', // Correct for vertical centering in column layout
    alignItems: 'center', // Correct for horizontal centering
    width: '100%',
    flexDirection: 'column',
    marginBottom: '20px',
  };

  const buttonBoxStyle = {
    backgroundColor: '#034d32',
    padding: '15px 30px',
    borderRadius: '5px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  };

  const linkStyle = {
    display: 'inline-block', // Ensure it's clickable area is only around the text
    backgroundColor: '#034d32',
    padding: '15px 30px',
    borderRadius: '15px',
    border: '2px solid white', // Correct way to set border (width style color)
    color: 'white', // Text color set to white
    fontSize: '18px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  };

  const descriptionStyle = {
    backgroundColor: '#e0e0e0',
    padding: '10px',
    borderRadius: '5px',
    color: 'darkgreen',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: '10px', // Ensure spacing between link and description
  };

  const goBackButtonStyle = {
    backgroundColor: '#f0f0f0',
    color: '#034d32',
    padding: '10px 15px',
    marginTop: '20px',
    marginLeft: '-90%',
    borderRadius: '5px',
    border: '2px solid #034d32',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

  // React Router v6 uses useNavigate hook
  const navigate = useNavigate();

  // Define handleGoBack to navigate back
  const handleGoBack = () => navigate(-1);

  return (
    <div style={containerStyle}>
      <button type="button" style={goBackButtonStyle} onClick={handleGoBack}>&larr; Go Back</button>
      <div style={contentContainerStyle}>
        <div style={buttonContainerStyle}>
          {/* Use Link as the button itself */}
          <div style={buttonBoxStyle}>
            <Link to="/autism_instructions/questionnaire" style={linkStyle}>
              Go to Questionnaire
            </Link>
            <p style={descriptionStyle}>This questionnaire is designed to explore various aspects of social communication and behavior in alignment with the Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5) criteria for Autism Spectrum Disorder (ASD). The DSM-5 emphasizes two core areas for diagnosis: deficits in social communication and social interaction across multiple contexts, and restricted, repetitive patterns of behavior, interests, or activities. The questions are crafted to reflect these core areas and help identify individuals who may exhibit signs consistent with ASD. Each question encourages self-reflection on aspects of social communication, relationships, and behavioral patterns that individuals may find challenging. For example, questions about difficulties in engaging in back-and-forth conversations, understanding social cues like eye contact and facial expressions, and adapting to changes in routines or schedules are directly related to the DSM-5 criteria for ASD. The questionnaire will take 15-20 minutes depending on the user.</p>
          </div>
          <div style={buttonBoxStyle}>
            <Link to="/autism_instructions/game" style={linkStyle}>
              Go to Game
            </Link>
            <p style={descriptionStyle}>The &quot;Social Interaction Challenge&quot; game is an innovative educational tool designed to help individuals, particularly those with autism, improve their understanding and management of social interactions and sensory experiences. Through a series of scenarios, players are presented with various social and sensory situations that require thoughtful responses or actions. The game aims to enhance social communication skills, emotional recognition, and adaptability in changing environments, which are areas often challenging for individuals on the autism spectrum. This game serves as a supplementary educational resource that can be used alongside traditional therapies and educational programs for autism. By simulating a variety of social and sensory experiences, the game provides a safe, controlled environment for players to practice and improve their social skills, emotional understanding, and adaptability. The ultimate goal is to support individuals with autism in feeling more confident and capable in their social interactions and daily activities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestComponent;
