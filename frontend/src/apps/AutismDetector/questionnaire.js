import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Questionnaire.css';

function Questionnaire() {
  const [answers, setAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const navigate = useNavigate();

  const questions = [
    { id: 1, text: 'Do you find it challenging to engage in back-and-forth conversations with others?' },
    { id: 2, text: 'Do you have difficulty sharing your interests or emotions with others?' },
    { id: 3, text: 'Are you often unsure about how to initiate or respond to social interactions in social settings?' },
    { id: 4, text: 'Do you struggle with maintaining eye contact during conversations?' },
    { id: 5, text: 'Have you been told that you have limited facial expressions or difficulty understanding and using gestures?' },
    { id: 6, text: 'Do you find it hard to develop and maintain relationships with others?' },
    { id: 7, text: 'Do you engage in repetitive motor movements or use objects in a repetitive manner (e.g., hand-flapping, finger-flicking, repeating certain phrases)?' },
    { id: 8, text: 'Do you feel distressed when routines or schedules change unexpectedly?' },
    { id: 9, text: 'Are you particularly fixated on certain topics or objects, to the point where it becomes a dominant interest in your life?' },
    { id: 10, text: 'Do you experience heightened sensitivity or indifference to sensory stimuli like pain, temperature, sounds, or textures?' },
    { id: 11, text: 'Did you or your caregivers notice any developmental differences or unusual behaviors in your early childhood?' },
    { id: 12, text: 'Have you experienced changes in your social and communication abilities as youve grown older?' },
    { id: 13, text: 'Have your social challenges and repetitive behaviors significantly impacted your ability to function in social, occupational, or other important areas of your life?' },
    { id: 14, text: 'Have you received any special support or accommodations for your social and communication difficulties?' },
    { id: 15, text: 'Have you been diagnosed with intellectual disability or global developmental delay?' },
    { id: 16, text: 'If you have an intellectual disability, do you believe your social communication difficulties are significantly below what would be expected based on your general developmental level?' },
    { id: 17, text: 'Do you find it challenging to make and maintain friendships?' },
    // Add more questions as needed
  ];

  const calculateProbability = (userAnswers) => {
    let totalScore = 0;
    const totalQuestions = questions.length;

    Object.keys(userAnswers).forEach((id) => {
      if (userAnswers[id] === 'yes') {
        totalScore += 1;
      }
    });

    const percentage = (totalScore / totalQuestions) * 100;

    if (percentage >= 70) {
      return `High probability of ASD (${percentage.toFixed(2)}%)`;
    }
    if (percentage >= 30) {
      return `Moderate probability of ASD (${percentage.toFixed(2)}%)`;
    }
    return `Low probability of ASD (${percentage.toFixed(2)}%)`;
  };

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const probability = calculateProbability(answers);
    setTestResult(probability);
  };

  const handleGoBack = () => {
    navigate('/autism_instructions');
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" className="go-back-button" onClick={handleGoBack}>&larr; Go Back</button>
      <div className="instruction-text">
        Please select options for all the questions below.
      </div>
      {questions.map((question, index) => (
        <div key={question.id} className={index % 2 === 0 ? 'question-container' : 'question-container-lightgreen'}>
          <label htmlFor={`question-${question.id}`} className="question-label">
            {question.text}
          </label>
          <select id={`question-${question.id}`} className="question-select" onChange={(e) => handleChange(question.id, e.target.value)}>
            <option value="">Select an option</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      ))}
      <button type="submit" className="submit-button1">Submit</button>

      {testResult !== null && (
        <div className="test-result">
          Test Result:
          {testResult}
        </div>
      )}
    </form>
  );
}

export default Questionnaire;
