import React from 'react';
import './useTerms.scss';

function Page() {
  return (
    <div className="profile-body post-body">
      <div className="terms-mian">
        <div className="terms-item row-item">
          <span>Introduction</span>
          <p>Welcome to Allerdine, a diet customization tool designed to assist individuals with food allergies. By using our chatbot, you agree to our Terms of Service outlined below. Please read these terms carefully.</p>
        </div>
        <div className="terms-item row-item">
          <span>1. Acceptance of Terms</span>
          <p>By accessing or using our chatbot, you confirm your agreement to be bound by these terms. If you do not agree to these terms, do not use [Your Chatbot Name].</p>
        </div>
        <div className="terms-item row-item">
          <span>2. Changes to Terms</span>
          <p>We reserve the right to modify these terms at any time. We will notify you of any changes by updating the terms on our platform. Your continued use of the chatbot after any changes constitutes your acceptance of the new terms.</p>
        </div>
        <div className="terms-item row-item">
          <span>3. Service Description</span>
          <p>We provides customized diet planning assistance to users with specific food allergies. The chatbot uses information you provide to suggest dietary options that avoid your allergens. These suggestions should not replace professional medical advice.</p>
        </div>
        <div className="terms-item row-item">
          <span>4. User Responsibilities</span>
          <div className="terms-item-sub">
            <p>
              <strong> </strong>
              You must provide accurate and complete information about your allergies and health status.
            </p>
            <p>
              <strong> </strong>
              You agree to use the chatbot for personal, non-commercial use only.
            </p>
            <p>
              <strong> </strong>
              You are responsible for all activity that occurs under your account.
            </p>
          </div>
        </div>
        <div className="terms-item row-item">
          <span>5. Privacy and Data Protection</span>
          <p>We are committed to protecting your privacy and personal information. By using the chatbot, you agree to the collection, transfer, storage, and use of your personal information as detailed in our Privacy Policy.</p>
        </div>
        <div className="terms-item row-item">
          <span>6. Disclaimers</span>
          <div className="terms-item-sub">
            <p>
              <strong> </strong>
              This chatbot is not a medical service and does not provide medical advice.
            </p>
            <p>
              <strong> </strong>
              The dietary suggestions provided by our chatbot are based on the information you provide and general guidelines about food allergies. They may not be suitable for all individuals.
            </p>
            <p>
              <strong> </strong>
              We do not guarantee the accuracy, completeness, or usefulness of any information on the service and you are advised to consult a qualified health professional before making any diet changes.
            </p>
          </div>
        </div>
        <div className="terms-item row-item">
          <span>7. Limitation of Liability</span>
          <p>In no event will the developer be liable for any indirect, incidental, special, consequential or punitive damages resulting from or related to your use of the chatbot.</p>
        </div>
        <div className="terms-item row-item">
          <span>8. Indemnification</span>
          <p>You agree to defend, indemnify, and hold harmless and its employees, agents, and service providers from any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees resulting from your violation of these terms or your use of the chatbot.</p>
        </div>
        <div className="terms-item row-item">
          <span>9. Governing Law</span>
          <p>These terms shall be governed by and construed in accordance with the laws of UK without regard to its conflict of law principles.</p>
        </div>
      </div>
    </div>
  );
}
export default Page;
