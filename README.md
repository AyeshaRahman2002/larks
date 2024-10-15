# This is a stuent project at the University of Leeds.
# Please do not use these tools for medical purposes as they are prototypes and not clinically approved.

---

# LARKS Group Project

## Overview

This repository contains the work from the **LARKS** group project developed by students at the **University of Leeds**. Each group member built different applications on a shared platform, focused on healthcare-related technologies. These projects are prototypes and are not intended for clinical or medical purposes.

The LARKS project serves as a framework for developing healthcare tools that leverage modern technologies such as **machine learning**, **natural language processing**, and **data analytics** to assist in detecting various conditions. My specific project within this framework focuses on the **detection of Autism Spectrum Disorder (ASD)** in adults, using tools like eye-tracking and sentiment analysis. This repository also includes projects developed by my group members, who have built different applications on the same shared platform.

**Please do not use these tools for medical purposes, as they are prototypes and not clinically approved.**

---

## Team Members and Applications

- **Ayesha Rahman** – Development of an ASD detection tool using machine learning, eye-tracking, and sentiment analysis.
- **Natalie Leung** – Created a healthcare app focused on real-time symptom tracking and personalized health insights.
- **Marilena Manoli** – Developed a mental health monitoring tool, including features for mood tracking and alert systems.
- **Chien-Wei Tung** – Implemented a chronic condition monitoring application that integrates health data from wearable devices.
- **Archie Adams** – Built an AI-driven telemedicine platform for remote consultations and healthcare data management.

All projects share the LARKS platform but are customized for different healthcare-related tasks.

---

## Project Structure

### Wiki

The project details and documentation are available on our **[LARKS Wiki](https://github.com/AyeshaRahman2002/larks/wiki)**. You will find the architectural diagrams, workflows, and specific implementation details of each group member’s project.

### Project Board

The **[LARKS Project Board](https://github.com/users/AyeshaRahman2002/projects/3)** is used to track the progress and tasks for each individual application and the shared platform.

### Frontend and Backend Details

Each group member worked on both frontend and backend components for their individual projects. Here are the key files:

- **Frontend README**: [./frontend/README.md](./frontend/README.md)  
  Provides details about the UI and interaction design for the LARKS platform, including individual customizations for each project.

- **Backend README**: [./backend/README.md](./backend/README.md)  
  Describes the backend setup, including Flask applications, API endpoints, and database configurations.

---

## LARKS Project Components

### Shared Platform
The LARKS platform is a shared framework designed to support healthcare-related applications. It is deployed on AWS and managed using GitHub for version control and continuous integration. Each group member’s application is built on top of this shared platform.

## Ayesha Rahman’s Project: Autism Spectrum Disorder Detection Tool

This project focuses on creating a prototype AI tool for detecting Autism Spectrum Disorder (ASD) in adults. The tool includes:

- **Eye-Tracking Feature**: This uses machine learning to analyze users' eye movements and detect traits associated with ASD.
- **Social Interaction Game**: A game that uses Natural Language Processing (NLP) to analyze user responses to various social situations.
- **Machine Learning Models**: Utilized for analyzing text data, note tracking, and predicting ASD traits based on user input.

Other tools in the shared platform were also improved to enhance the user experience, especially for accessibility, as detailed in my report.

---

## Deployment and Testing

The application is hosted on an AWS EC2 instance, with the frontend served through **GitHub Pages** and backend services managed using **Flask**. Testing was done using various tools such as Artillery for load testing and unit tests across all major components of the applications.
