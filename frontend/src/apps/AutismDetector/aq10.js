import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthTokenContext } from '../../App';
import './Questionnaire.css';

function AQ10() {
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState({ score: null, resultMessage: null });
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const { authToken } = useContext(AuthTokenContext);

  const questionnaires = {
    'AQ-10': [
      {
        id: 1,
        text: 'I often notice small sounds when others do not.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 2,
        text: 'When I’m reading a story, I find it difficult to work out the characters’ intentions.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 3,
        text: 'I find it easy to read between the lines when someone is talking to me.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 4,
        text: 'I usually concentrate more on the whole picture, rather than the small details.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 5,
        text: 'I know how to tell if someone listening to me is getting bored.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 6,
        text: 'I find it easy to do more than one thing at once.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 7,
        text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 8,
        text: 'If there is an interruption, I can switch back to what I was doing very quickly.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 9,
        text: 'I like to collect information about categories of things.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
      {
        id: 10,
        text: 'I find it difficult to work out people’s intentions.',
        options: ['Definitely Agree', 'Slightly Agree', 'Slightly Disagree', 'Definitely Disagree'],
      },
    ],
  };

  const handleChange = (id, value) => {
    const valueMapping = {
      'Definitely Agree': 3,
      'Slightly Agree': 2,
      'Slightly Disagree': 1,
      'Definitely Disagree': 0,
    };
    setAnswers({ ...answers, [id]: valueMapping[value] || null });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if all questions have been answered
    const totalQuestions = questionnaires['AQ-10'].length;
    const totalAnswers = Object.keys(answers).length;

    if (totalAnswers < totalQuestions) {
      alert('Please answer all questions before submitting.');
      return; // Exit the function early if not all questions are answered
    }

    const totalScore = Object.values(answers).reduce((acc, value) => acc + value, 0);
    const maxScore = 30; // Assuming the maximum score is 30 (10 questions * max 3 points per question)
    const autismChancePercentage = (totalScore / maxScore) * 100; // Calculate the percentage chance of autism

    const resultMessage = `Based on your responses, there is approximately ${autismChancePercentage.toFixed(2)}% chance of having autism spectrum conditions. This is not a diagnostic tool. Please consult a professional for an accurate assessment.`;

    setTestResult({ score: totalScore, resultMessage });
    setShowModal(true);

    try {
      await axios.post(
        'http://127.0.0.1:5000/save_result',
        { totalScore },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        },
      );
    } catch (error) {
      console.error('Error saving the test result:', error);
    }
  };

  const handleGoBack = () => navigate(-1);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="button" className="go-back-button" onClick={handleGoBack}>&larr; Go Back</button>
        {questionnaires['AQ-10'].map((question, index) => (
          <div key={question.id} className={index % 2 === 0 ? 'question-container' : 'question-container-lightgreen'}>
            <label htmlFor={`question-${question.id}`} className="question-label">
              {question.text}
            </label>
            <select id={`question-${question.id}`} className="question-select" onChange={(e) => handleChange(question.id, e.target.value)}>
              <option value="">Select an option</option>
              {question.options.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        ))}
        <button type="submit" className="submit-button">Submit</button>
      </form>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ border: '2px solid darkgreen' }}>
            <button
              type="button"
              className="close"
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
            >
              &times;
            </button>
            {/* Header */}
            <h2 className="test-completion-header">You have completed the first test!</h2>
            <br />
            {/* Additional instruction */}
            <p>Please finish the next three tests for better evaluation results.</p>
            <p>{testResult.resultMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AQ10;
