import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import './useChatbot.scss';

function chatbot() {
  const [isMobile, setIsMobile] = useState(true);
  // initialize
  useEffect(() => {
    // get browser info
    const ua = navigator.userAgent;
    if (!ua.match(/AppleWebKit.*Mobile.*/)) {
      setIsMobile(false);
    }
  }, []);
  return (
    <div className={isMobile ? 'chatbot-container mobile' : 'chatbot-container desktop'}>
      <Outlet />
    </div>
  );
}

export default chatbot;
