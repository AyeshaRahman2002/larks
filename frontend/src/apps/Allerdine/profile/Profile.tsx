import React from 'react';
import { Button, Input, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import './useProfile.scss';
import { getCookie, setCookie } from '../../../utils/cookies';

interface profileItem {
  name: string,
  age: number,
  gender: string,
}

function Page() {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = React.useState(false);
  const defaultInfo = JSON.stringify({
    name: '',
    age: 0,
    gender: '',
  } as profileItem);
  const cookiesInfo = getCookie('profile') || defaultInfo;
  const [currentInfo, setCurrentInfo] = React.useState(JSON.parse(cookiesInfo) as profileItem);

  const handleNameChange = (event: any) => {
    const newCurrentInfo: profileItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.name = event.target.value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleAgeChange = (event: any) => {
    const newCurrentInfo: profileItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.age = event.target.value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleGenderChange = (value: string) => {
    const newCurrentInfo: profileItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.gender = value;
    setCurrentInfo(newCurrentInfo);
  };

  const onSubmitEvent = () => {
    setCookie('profile', JSON.stringify(currentInfo), { expires: 30 });
    setIsEdit(false);
  };

  const onEditEvent = () => {
    setIsEdit(true);
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };
  return (
    <div className="profile-body post-body">
      <div className="profile-title post-top chatbot-title">
        Profile
      </div>
      <div className="profile-main post-main">
        <div className="edit-item row-item">
          <div className="edit-item-label">Name</div>
          <div className="edit-item-content">
            {isEdit && (
              <Input
                defaultValue={currentInfo.name}
                style={{ width: 120 }}
                onChange={handleNameChange}
              />
            )}
            {!isEdit && currentInfo.name}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Age</div>
          <div className="edit-item-content">
            {isEdit && (
              <Input
                defaultValue={currentInfo.age}
                style={{ width: 120 }}
                onChange={handleAgeChange}
              />
            )}
            {!isEdit && currentInfo.age}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Gender</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.gender}
                style={{ width: 120 }}
                onChange={handleGenderChange}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />
            )}
            {!isEdit && currentInfo.gender}
          </div>
        </div>
      </div>
      <div className="profile-bottom post-bottom">
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
