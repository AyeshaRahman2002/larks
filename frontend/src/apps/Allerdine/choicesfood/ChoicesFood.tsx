import React, { useContext } from 'react';
import { Button, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthTokenContext } from '../../../App';
import { getFoodStyleInfo, saveFoodStyleInfo } from '../../../utils/chatbot';
import './useChoicesFood.scss';

interface InfoItem {
  european: boolean,
  asian: boolean,
}

function Page() {
  const userId = sessionStorage.getItem('email') || 'userId';
  const { token } = useContext(AuthTokenContext);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = React.useState(false);
  const [currentInfo, setCurrentInfo] = React.useState({} as InfoItem);

  const getInitDataEvent = async () => {
    const key = `${userId}_foodStyle`;
    const sessionData = sessionStorage.getItem(key);
    const inifDefault = sessionData ? JSON.parse(sessionData) : await getFoodStyleInfo(token, userId);
    setCurrentInfo(inifDefault);
  };

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
    const reqData = {
      userId,
      type: 'foodStyle',
      body: JSON.stringify(currentInfo),
    };
    saveFoodStyleInfo(token, reqData)
      .then((res: any) => {
        setCurrentInfo(res);
        setIsEdit(false);
      });
  };

  const onEditEvent = () => {
    setIsEdit(true);
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };

  // 挂件组件时初始化数据
  React.useEffect(() => {
    // 获取Allergens信息
    getInitDataEvent();
  }, []);

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
