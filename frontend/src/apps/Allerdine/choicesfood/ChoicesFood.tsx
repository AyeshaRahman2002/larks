import React from 'react';
import { Button, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import './useChoicesFood.scss';
import { getCookie, setCookie } from '../../../utils/cookies';

interface InfoItem {
  european: boolean,
  asian: boolean,
}

function Page() {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = React.useState(false);
  const defaultInfo = JSON.stringify({
    european: false,
    asian: false,
  } as InfoItem);
  const cookiesInfo = getCookie('choicesFood') || defaultInfo;
  const [currentInfo, setCurrentInfo] = React.useState(JSON.parse(cookiesInfo) as InfoItem);

  const handleEuropeanChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.european = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleAsianChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.asian = value;
    setCurrentInfo(newCurrentInfo);
  };

  const onSubmitEvent = () => {
    setCookie('choicesFood', JSON.stringify(currentInfo), { expires: 30 });
    setIsEdit(false);
  };

  const onEditEvent = () => {
    setIsEdit(true);
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };
  return (
    <div className="choicesFood-body post-body">
      <div className="choicesFood-title post-top chatbot-title">
        Food Choices
      </div>
      <div className="choicesFood-main post-main">
        <div className="edit-item row-item">
          <div className="edit-item-label">European</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.european}
                style={{ width: 120 }}
                onChange={handleEuropeanChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.european ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Asian</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.asian}
                style={{ width: 120 }}
                onChange={handleAsianChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.asian ? 'Yes' : 'No')}
          </div>
        </div>
      </div>
      <div className="choicesFood-bottom post-bottom">
        {isEdit && (
          <Button
            shape="round"
            onClick={onSubmitEvent}
          >
            Submit
          </Button>
        )}
        {!isEdit && (
          <>
            <Button
              shape="round"
              onClick={onEditEvent}
            >
              Edit
            </Button>
            <Button
              shape="round"
              onClick={onChatbotEvent}
            >
              Chatbot
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
export default Page;
