import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js';
import { AuthTokenContext } from '../../App';
import autismHomeVideo from '../../images/autism-feedback.gif';
// https://giphy.com/stickers/happy-new-year-aiko-aiandaiko-EISbPyQgZv1usnSj0Z

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_DEV
  : process.env.REACT_APP_PROD;

function Feedback() {
  const { token } = useContext(AuthTokenContext);
  const [feedback, setFeedback] = useState([]);

  const fetchFeedback = async () => {
    await axios.get(`${BASEURL}api/feedback`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (response.status === 200) {
        setFeedback(response.data.feedback);
      }
    }).catch((error) => {
      console.error('Error fetching feedback:', error);
    });
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);

  const printDocument = () => {
    const input = document.getElementById('feedback-section'); // Targeting the feedback container
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
      });
      const imgProps = pdf.getImageProperties(imgData);

      // Define a custom width for the PDF content (e.g., 70% of the PDF page width)
      const pageWidth = pdf.internal.pageSize.getWidth();
      const customPdfWidth = pageWidth * 0.3; // Decrease PDF page width by setting a custom width

      // Calculate the height based on the custom width to maintain the aspect ratio
      let pdfHeight = (imgProps.height * customPdfWidth) / imgProps.width;

      // Check if the calculated height exceeds the PDF page height
      const pageHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight > pageHeight) {
        // If so, adjust the height to fit and optionally adjust the width to maintain aspect ratio
        pdfHeight = pageHeight * 0.95; // Adjust height to fit within the page
        // customPdfWidth = (imgProps.width * pdfHeight) / imgProps.height; // Uncomment if you also want to adjust width based on new height
      }

      // Calculate horizontal offset to center the image (if desired)
      const xOffset = (pageWidth - customPdfWidth) / 2;

      // Add the image to the PDF with the custom dimensions
      pdf.addImage(imgData, 'PNG', xOffset, 0, customPdfWidth, pdfHeight);
      pdf.save('feedback.pdf');
    });
  };

  const autismHomeVideoStyle = {
    width: '50%', // Adjust the width as needed, e.g., to 50% of its container
    height: '500px', // Keeps the aspect ratio of the image
    float: 'left',
    marginTop: '-35vh',
    marginLeft: '-40%',
    position: 'relative',
    display: 'block', // This ensures the video is displayed as a block element, removing any unwanted space around it
    objectFit: 'cover', // This will cover the area of the container without stretching the video
  };

  // Function to interpret AQ-10 score and return a feedback message
  const getAQ10Feedback = (score) => {
    if (score === null) {
      return 'Please take the test to receive feedback.';
    }
    if (score >= 6) {
      return 'Your AQ-10 score suggests a significant number of autistic traits. This indicates that further evaluation by a professional may be beneficial for a comprehensive understanding. Remember, this test is not diagnostic, but its a good starting point for discussion with healthcare professionals.';
    }
    return 'Your AQ-10 score suggests fewer autistic traits. However, if you have concerns about autism or related conditions, consulting with a professional can provide more detailed insights. Remember, this screening tool cannot capture the full complexity of individual experiences.';
  };

  // Function to interpret the Autism Spectrum Quotient (AQ) score and return detailed feedback
  const getAQFeedback = (score) => {
    if (score === null) {
      return 'Please take the test to receive feedback.';
    }
    if (score >= 26) {
      if (score >= 32) {
        return `Your AQ score of ${score} suggests a significant number of autistic traits, aligning with scores typically observed in autistic individuals. Notably, 79.3% of autistic people score 32 or higher. This level of score is especially significant among autistic females. It's recommended to seek further evaluation from a healthcare professional for a comprehensive assessment.`;
      }
      return `Your AQ score of ${score} indicates the presence of autistic traits. While this doesn't conclusively diagnose autism, it suggests traits consistent with the spectrum. Further professional evaluation can provide more clarity.`;
    }
    return `Your AQ score of ${score} suggests fewer autistic traits, falling below the typical threshold for indicating significant autistic traits. However, if you have concerns or suspect autism based on other experiences or symptoms, it might still be worth consulting a healthcare professional for a thorough evaluation.`;
  };

  const aqchartData = {
    labels: [
      // Feedback data
      feedback.map((item) => item.firstName),
      // Mean AQ scores and subscale scores for AS/HFA and Controls
      'AS/HFA Total', 'AS/HFA Males', 'AS/HFA Females',
      'Controls Total', 'Controls Males', 'Controls Females',
      // Mean AQ scores and subscale scores for Students and Olympiad
      'Students Total', 'Students Males', 'Students Females',
      'Olympiad Total',
    ],
    datasets: [{
      label: 'AQ Score',
      data: [
        // Feedback data
        feedback.map((item) => item.aq),
        // Mean AQ scores and subscale scores for AS/HFA and Controls
        35.8, 35.1, 38.1, 16.4, 17.8, 15.4,
        // Mean AQ scores and subscale scores for Students and Olympiad
        17.6, 18.6, 16.4, 24.5,
      ],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)',
        'rgba(255, 206, 86, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(255, 159, 64, 0.2)',
        'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)',
        'rgba(255, 206, 86, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)',
        'rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 159, 64, 1)',
        'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'User AQ Score vs. Mean AQ Scores',
        color: '#C68B77',
        font: {
          size: 16,
        },
      },
    },
  };

  // Enhanced function to provide detailed feedback for CAT-Q scores
  const getCATQFeedback = (totalScore, compensationScore, maskingScore, assimilationScore) => {
    let catqfeedback = `Your CAT-Q total score is ${totalScore}. `;

    if (totalScore === null || compensationScore === null || maskingScore === null || assimilationScore === null) {
      return 'Please complete the CAT-Q to receive detailed feedback.';
    }

    // Interpret the total score
    if (totalScore >= 100) {
      catqfeedback += 'This score indicates a significant use of camouflaging strategies to navigate social situations or mask autistic traits. Camouflaging can be mentally and emotionally taxing and may lead to increased stress or burnout. ';
      if (totalScore >= 124) {
        catqfeedback += 'Your score is similar to or higher than the average scores reported by autistic individuals, indicating a particularly high level of camouflaging. This may reflect significant efforts to fit in or cope with social expectations, which can sometimes come at the cost of personal well-being. ';
      }
    } else {
      catqfeedback += 'This suggests a lower reliance on camouflaging strategies. While this might mean less stress associated with social interactions, its important to recognize that everyones experience is unique, and there might be other factors affecting your social experiences. ';
    }

    // Provide detailed subcategory feedback
    catqfeedback += 'In the subcategories: ';

    // Compensation feedback
    catqfeedback += `Compensation scored ${compensationScore}. `;
    if (compensationScore > 41) {
      catqfeedback += 'This is considered high, indicating you actively work to compensate for difficulties in social situations. While this can be effective, its also important to be mindful of the potential for fatigue or stress resulting from these efforts. ';
    } else {
      catqfeedback += 'This indicates a moderate or lower level of active compensation. Its essential to find a balance that allows you to interact comfortably without overextending yourself. ';
    }

    // Masking feedback
    catqfeedback += `Masking scored ${maskingScore}. `;
    if (maskingScore > 37) {
      catqfeedback += 'This is high, reflecting significant efforts to mask autistic traits. While this may help in certain social contexts, it can also hinder authentic interactions and contribute to feelings of isolation or exhaustion. ';
    } else {
      catqfeedback += 'This suggests a moderate or lower effort to mask autistic traits, which might allow for more genuine interactions but also pose challenges in some social settings. Finding strategies that support your well-being while navigating social complexities is key. ';
    }

    // Assimilation feedback
    catqfeedback += `Assimilation scored ${assimilationScore}. `;
    if (assimilationScore > 44) {
      catqfeedback += 'This indicates a strong effort to assimilate into social groups. Its important to consider whether these efforts align with your values and needs, and to seek environments where you feel accepted for who you are. ';
    } else {
      catqfeedback += 'This suggests a moderate or lower level of effort to assimilate, which can be a sign of comfort with your social identity or a preference for authenticity over conformity. Embrace what feels right for you, and seek out like-minded individuals or communities. ';
    }

    // Conclude with implications and advice
    catqfeedback += 'High scores in any of these areas can correlate with increased social anxiety and may impact your overall well-being. Its important to consider self-care strategies and to seek support when needed. There are many resources available for individuals who camouflage, including support groups, therapy, and community organizations focused on neurodiversity and autism acceptance. Exploring these options can provide you with additional coping mechanisms and a sense of community. Remember, its okay to seek help and to prioritize your mental health.';

    return catqfeedback;
  };

  const catqchartData = {
    labels: [
      // Feedback data
      feedback.map((item) => item.firstName),
      // Mean CAT-Q scores for Autistic individuals
      'Autistic Females', 'Autistic Males', 'Autistic Non-binary',
      // Mean CAT-Q scores for Neurotypical individuals
      'Neurotypical Females', 'Neurotypical Males', 'Neurotypical Non-binary',
    ],
    datasets: [{
      label: 'Total score',
      data: [
        // Feedback data
        feedback.map((item) => item.catqtotalScore),
        // Mean CAT-Q scores for Autistic individuals
        124.35, 109.64, 122.00, // Autistic Females, Males, Non-binary
        90.87, 96.89, 109.44, // Neurotypical Females, Males, Non-binary
      ],
      backgroundColor: ['rgba(255, 99, 132, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)'],
      borderWidth: 1,
    }, {
      label: 'Compensation',
      data: [
        feedback.map((item) => item.compensationScore),
        41.85, 36.81, 43.50, // Autistic Females, Males, Non-binary
        27.18, 30.06, 35.48, // Neurotypical Females, Males, Non-binary
      ],
      backgroundColor: 'rgba(0, 255, 0, 0.2)', // Assuming green for compensation
      borderColor: 'rgba(0, 255, 0, 1)',
      borderWidth: 1,
    }, {
      label: 'Masking',
      data: [
        feedback.map((item) => item.maskingScore),
        37.87, 32.90, 36.06, // Autistic Females, Males, Non-binary
        34.69, 36.34, 38.70, // Neurotypical Females, Males, Non-binary
      ],
      backgroundColor: 'rgba(255, 255, 0, 0.2)', // Assuming yellow for masking
      borderColor: 'rgba(255, 255, 0, 1)',
      borderWidth: 1,
    }, {
      label: 'Assimilation',
      data: [
        feedback.map((item) => item.assimilationScore),
        44.63, 39.93, 39.88, // Autistic Females, Males, Non-binary
        29.00, 30.48, 35.26, // Neurotypical Females, Males, Non-binary
      ],
      backgroundColor: 'rgba(255, 0, 0, 0.2)', // Assuming red for assimilation
      borderColor: 'rgba(255, 0, 0, 1)',
      borderWidth: 1,
    }],
  };

  const catqoptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'CAT-Q Scores Comparison',
        color: '#C68B77',
        font: {
          size: 16,
        },
      },
    },
  };

  const comparingcatq = {
    labels: ['Total score', 'Compensation', 'Masking', 'Assimilation'],
    datasets: [{
      label: 'Female',
      data: [33.48, 14.67, 3.18, 15.63],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }, {
      label: 'Male',
      data: [12.75, 6.75, -3.44, 9.45],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }, {
      label: 'Non-binary',
      data: [12.56, 8.02, -2.64, 4.62],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const comparingcatqoptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'CAT-Q Scores Comparison Autistic vs Neurotypical people',
        color: '#C68B77',
        font: {
          size: 16,
        },
      },
    },
  };

  const getRAADSRFeedback = (totalScore, languageScore, socialRelatednessScore, sensoryMotorScore, circumscribedInterestsScore) => {
    let raadsrFeedback = `Your RAADS-R Total Score is ${totalScore}, which `;
    if (totalScore === null || languageScore === null || socialRelatednessScore === null || sensoryMotorScore === null || circumscribedInterestsScore === null) {
      return 'Please complete the RAADS-R to receive detailed feedback.';
    }

    // Interpret the total score
    if (totalScore >= 65) {
      raadsrFeedback += `indicates a likelihood of autistic traits. Specifically, a score of ${totalScore} `;
      if (totalScore >= 130) {
        raadsrFeedback += 'is in the range strongly associated with autism, similar to scores typically observed in diagnosed individuals. This suggests a high presence of autistic traits across various areas.';
      } else if (totalScore < 130 && totalScore >= 65) {
        raadsrFeedback += 'suggests significant autistic traits, warranting further evaluation by a healthcare professional.';
      }
    } else {
      raadsrFeedback += 'suggests fewer autistic traits, generally falling below the threshold typically associated with autism.';
    }

    // Detailed feedback based on subscale scores
    raadsrFeedback += '\n\nDetailed Subscale Scores Analysis:\n';

    // Language
    raadsrFeedback += `Language: ${languageScore}. `;
    if (languageScore > 4) {
      raadsrFeedback += 'This indicates potential challenges or peculiarities with language use and comprehension, a common trait in autism.';
    } else {
      raadsrFeedback += 'This score suggests typical language development and use.';
    }

    // Social Relatedness
    raadsrFeedback += `\nSocial Relatedness: ${socialRelatednessScore}. `;
    if (socialRelatednessScore > 31) {
      raadsrFeedback += 'This score points to significant challenges in social interaction and understanding others, which are core aspects of autism.';
    } else {
      raadsrFeedback += 'This suggests fewer difficulties in social situations, though individual experiences vary.';
    }

    // Sensory-Motor
    raadsrFeedback += `\nSensory-Motor: ${sensoryMotorScore}. `;
    if (sensoryMotorScore > 16) {
      raadsrFeedback += 'This indicates heightened sensitivity or challenges with sensory and motor aspects, often experienced by autistic individuals.';
    } else {
      raadsrFeedback += 'This score suggests typical sensory-motor experiences.';
    }

    // Circumscribed Interests
    raadsrFeedback += `\nCircumscribed Interests: ${circumscribedInterestsScore}. `;
    if (circumscribedInterestsScore > 15) {
      raadsrFeedback += 'This reflects strong, focused interests or hobbies, a characteristic often associated with autism.';
    } else {
      raadsrFeedback += 'This indicates a variety of interests without the intensity commonly seen in autism.';
    }

    // General advice based on subscale insights
    raadsrFeedback += '\n\nEach subscale score sheds light on specific areas that might be influencing your overall experience. It’s important to remember that the RAADS-R, while insightful, is not a diagnostic tool. ';

    // Next steps
    raadsrFeedback += 'If your scores indicate autistic traits or if you have concerns based on your experiences, seeking a comprehensive evaluation from a healthcare professional is a crucial next step. An evaluation can provide a more complete understanding of your neurotype and guide towards supportive resources and strategies. Remember, autism is a spectrum, and individual experiences vary widely.';

    return raadsrFeedback;
  };

  const raadsrchartData = {
    labels: ['Total score', 'Language', 'Social relatedness', 'Sensory/motor', 'Circumscribed interests'],
    datasets: [{
      label: 'Autistic males',
      data: [148.6, 11.9, 71.3, 36.7, 28.7],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }, {
      label: 'Autistic females',
      data: [160.4, 12.8, 73.5, 43.1, 31.0],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }, {
      label: 'Suspected autistic males',
      data: [141.6, 11.2, 70.0, 33.3, 27.2],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }, {
      label: 'Suspected autistic females',
      data: [145.2, 11.3, 67.2, 38.7, 28.0],
      backgroundColor: 'rgba(255, 206, 86, 0.2)',
      borderColor: 'rgba(255, 206, 86, 1)',
      borderWidth: 1,
    }, {
      label: 'Neurotypical males',
      data: [84.2, 6.6, 43.0, 19.0, 15.7],
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderColor: 'rgba(153, 102, 255, 1)',
      borderWidth: 1,
    }, {
      label: 'Neurotypical females',
      data: [91.6, 6.8, 42.8, 24.8, 17.2],
      backgroundColor: 'rgba(255, 159, 64, 0.2)',
      borderColor: 'rgba(255, 159, 64, 1)',
      borderWidth: 1,
    }, {
      label: feedback.map((item) => item.firstName),
      data: [feedback.map((item) => item.raadsrScore), feedback.map((item) => item.language), feedback.map((item) => item.socialRelatedness), feedback.map((item) => item.sensoryMotor), feedback.map((item) => item.circumscribedInterests)],
      backgroundColor: 'rgba(255, 0, 255, 0.2)',
      borderColor: 'rgba(255, 0, 255, 1)',
      borderWidth: 1,
    }],
  };

  const raadsroptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average RAADS–R scores',
        color: '#C68B77',
        font: {
          size: 16,
        },
      },
    },
  };

  const meanraadsrData = {
    labels: ['Mean total', 'Language', 'Social relatedness', 'Sensory/motor', 'Circumscribed interests'],
    datasets: [{
      label: 'Autistic spectrum (n = 66)',
      data: [133.83, 11.08, 67.89, 32.82, 28.11],
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1,
    }, {
      label: 'Asperger (n = 135)',
      data: [null, 10.06, 65.07, 28.96, 27.44], // Assuming null for missing data
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }, {
      label: 'Controls (n = 276)',
      data: [25.95, 1.86, 9.24, 5.26, 5.03],
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  const meanraadsroptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: 'Mean RAADS–R scores',
        color: '#C68B77',
        font: {
          size: 16,
        },
      },
    },
  };

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

  const feedbackBoxStyle = {
    backgroundColor: '#F7E6E3', // Light green background
    padding: '10px',
    margin: '10px 0',
    border: '2px solid #eee',
    borderRadius: '5px',
    color: '#C68B77',
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1000px',
      margin: '50px auto 0',
      padding: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      backgroundColor: '#C68B77',
      color: 'white',
    }}
    >
      <button type="button" style={goBackButtonStyle} onClick={handleGoBack}>&larr; Go Back</button>
      <h1 style={{
        textAlign: 'center', color: '#C68B77', border: '2px solid white', padding: '10px', background: '#F7E6E3',
      }}
      >
        Feedback
      </h1>
      <br />
      <div style={{ marginTop: '20px' }}>
        {feedback.length > 0 ? (
          feedback.map((item) => (
            <div
              id="feedback-section"
              key={item.id}
              style={{
                marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px',
              }}
            >
              <div style={feedbackBoxStyle}>
                <h2><u>User Details</u></h2>
                <p>
                  <strong>
                    First Name:
                  </strong>
                  {item.firstName}
                </p>
                <p>
                  <strong>
                    Last Name:
                  </strong>
                  {item.lastName}
                </p>
                <p>
                  <strong>
                    Date of Birth:
                  </strong>
                  {item.DOB}
                </p>
                <p>
                  <strong>
                    Gender:
                  </strong>
                  {item.gender}
                </p>
                <p>
                  <strong>
                    Post Code:
                  </strong>
                  {item.postCode}
                </p>
                <p>
                  <strong>
                    City:
                  </strong>
                  {item.city}
                </p>
                <p>
                  <strong>
                    Country of Residence:
                  </strong>
                  {item.countryOfResidence}
                </p>
                <p>
                  <strong>
                    Highest Education:
                  </strong>
                  {item.highestEducation}
                </p>
                <p>
                  <strong>
                    Ethnicity:
                  </strong>
                  {item.ethnicity}
                </p>
                <p>
                  <strong>
                    Nationality:
                  </strong>
                  {item.nationality}
                </p>
                <p>
                  <strong>
                    Sexuality:
                  </strong>
                  {item.sexuality}
                </p>
              </div>
              <div style={feedbackBoxStyle}>
                {/* Add other user details here */}
                <p>
                  <strong>
                    AQ10 Score:
                  </strong>
                  {item.aq10}
                </p>
                <p>
                  <strong>
                    Feedback:
                  </strong>
                  {getAQ10Feedback(item.aq10)}
                </p>
              </div>
              <div style={feedbackBoxStyle}>
                <p>
                  <strong>
                    Autism Spectrum Quotient Score:
                  </strong>
                  {item.aq}
                </p>
                <p>
                  <strong>
                    Feedback:
                  </strong>
                  {getAQFeedback(item.aq)}
                </p>
              </div>
              <div style={feedbackBoxStyle}>
                <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
                  <Bar data={aqchartData} options={options} />
                </div>
                <div>
                  <p>
                    In the graph you can see your score and the mean AQ scores and subscale scores of autistic people (n: 58), controls (n: 174), students from the University of Cambridge (n: 840), and UK Mathematics Olympiad winners (n: 16).
                  </p>
                  <br />
                  <p>
                    [Taken from The Autism-Spectrum Quotient (AQ): Evidence from Asperger Syndrome/High-Functioning Autism, Males and Females, Scientists and Mathematicians (Baron-Cohen et al., 2001)]
                  </p>
                </div>
              </div>
              <div style={feedbackBoxStyle}>
                <p>
                  <strong>
                    Cat-Q Total Score:
                  </strong>
                  {item.catqtotalScore}
                </p>
                <p>
                  <strong>
                    Cat-Q Compensation Score:
                  </strong>
                  {item.compensationScore}
                </p>
                <p>
                  <strong>
                    Cat-Q Masking Score:
                  </strong>
                  {item.maskingScore}
                </p>
                <p>
                  <strong>
                    Cat-Q Assimilation Score:
                  </strong>
                  {item.assimilationScore}
                </p>
                <p>
                  <strong>
                    CAT-Q Feedback:
                  </strong>
                  {getCATQFeedback(item.catqtotalScore, item.compensationScore, item.maskingScore, item.assimilationScore)}
                </p>
              </div>
              <div style={feedbackBoxStyle}>
                <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
                  <Bar data={catqchartData} options={catqoptions} />
                </div>
                <div>
                  <p>
                    In the graph you can see your score and the Average total CAT-Q scores of autistic female, male and non-binary people. You can also see Total scores of Neurotypical people.
                  </p>
                  <br />
                  <p>
                    Autistic females and autistic non-binary people camouflage the most. Surprisingly, neurotypical females camouflage the least!
                  </p>
                  <br />
                  <p>
                    [Taken from The Autism-Spectrum Quotient (AQ): Evidence from Asperger Syndrome/High-Functioning Autism, Males and Females, Scientists and Mathematicians (Baron-Cohen et al., 2001)]
                  </p>
                </div>
              </div>
              <div style={feedbackBoxStyle}>
                <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
                  <Bar data={comparingcatq} options={comparingcatqoptions} />
                </div>
                <div>
                  <p>
                    From the graph you can see the differences in the average scores of autistic people compared to neurotypicals. As you can see, autistic males and autistic non-binary people mask less than their neurotypical counterparts, but do score higher in Compensation and Assimilation. Autistic men don’t camouflage much more than neurotypical men. The same is true for non-binary people. If you look at the previous graph, you will see that is because non-binary people camouflage a lot in general, irrespective of whether they are autistic or neurotypical.
                  </p>
                  <br />
                  <p>
                    [Taken from The Autism-Spectrum Quotient (AQ): Evidence from Asperger Syndrome/High-Functioning Autism, Males and Females, Scientists and Mathematicians (Baron-Cohen et al., 2001)]
                  </p>
                </div>
              </div>
              <div style={feedbackBoxStyle}>
                <p>
                  <strong>
                    RAADS-R Total Score:
                  </strong>
                  {item.raadsrScore}
                </p>
                <p>
                  <strong>
                    RAADS-R Language Score:
                  </strong>
                  {item.language}
                </p>
                <p>
                  <strong>
                    RAADS-R Social Relatedness Score:
                  </strong>
                  {item.socialRelatedness}
                </p>
                <p>
                  <strong>
                    RAADS-R Sensory Motor Score:
                  </strong>
                  {item.sensoryMotor}
                </p>
                <p>
                  <strong>
                    RAADS-R Circumscribed Interests Score:
                  </strong>
                  {item.circumscribedInterests}
                </p>
                <p>
                  <strong>
                    RAADS-R Feedback:
                  </strong>
                  {getRAADSRFeedback(item.raadsrScore, item.language, item.socialRelatedness, item.sensoryMotor, item.circumscribedInterests)}
                </p>
              </div>
              <div style={feedbackBoxStyle}>
                <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
                  <Bar data={raadsrchartData} options={raadsroptions} />
                </div>
                <div>
                  <p>
                    The graph shows the average total scores and subscores for people taking the RAADS-R online, divided by autistic people, suspected autistic people, and non-autistic people (neurotypicals).
                  </p>
                  <br />
                  <p>
                    The data can be considered skewed since it is based on people taking the RAADS–R online, which for research purposes starts with the question as to whether you are diagnosed with autism, suspect you’re autistic, or are not autistic. But some people that answered the latter will—contrary to their own expectations—end up scoring in the autistic range. Due to this misattribution, their scores get counted as neurotypical scores despite scoring in the autistic range, thus skewing the results.
                  </p>
                </div>
              </div>
              <div style={feedbackBoxStyle}>
                <div style={{ height: '400px', width: '100%', marginTop: '20px' }}>
                  <Bar data={meanraadsrData} options={meanraadsroptions} />
                </div>
                <div>
                  <p>
                    Since the data in the previous graph was skewed, here you can compare your score with the mean scores from Ritvo’s seminal paper.
                  </p>
                  <br />
                  <p>
                    [The Ritvo Autism Asperger Diagnostic Scale-Revised (RAADS–R): A scale to assist the diagnosis of autism spectrum disorder in adults: An international validation study (Ritvo et al., 2011)]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={printDocument}
                style={{
                  margin: '10px', padding: '10px', fontSize: '16px', marginLeft: '-100px',
                }}
              >
                Save as PDF
              </button>
              <div style={autismHomeVideoStyle} className="video-container">
                <img src={autismHomeVideo} alt="Autism Home" style={{ width: '100%', height: '100%' }} />
              </div>
            </div>
          ))
        ) : (
          <p>No feedback available. Please Take the tests. Also make sure to put in your personal details for the feedback to be displayed.</p>
        )}
      </div>
    </div>
  );
}

export default Feedback;
