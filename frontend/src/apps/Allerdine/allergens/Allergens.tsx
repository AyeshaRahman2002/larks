import React, { useContext } from 'react';
import { Button, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthTokenContext } from '../../../App';
import { getAllergensInfo, saveAllergensInfo } from '../../../utils/chatbot';
import './useAllergens.scss';

interface InfoItem {
  milk: boolean,
  eggs: boolean,
  fish: boolean,
  crustaceanShellfish: boolean,
  treeNuts: boolean,
  peanuts: boolean,
  wheat: boolean,
  soybeans: boolean,
  sesame: boolean,
}

function Allergens() {
  const userId = sessionStorage.getItem('email') || 'userId';
  const { token } = useContext(AuthTokenContext);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = React.useState(false);
  const [currentInfo, setCurrentInfo] = React.useState({} as InfoItem);

  const getInitDataEvent = async () => {
    const key = `${userId}_allergens`;
    const sessionData = sessionStorage.getItem(key);
    const inifDefault = sessionData ? JSON.parse(sessionData) : await getAllergensInfo(token, userId);
    setCurrentInfo(inifDefault);
  };

  const handleMilkChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.milk = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleEggsChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.eggs = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleFishChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.fish = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleCrustaceanShellfishChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.crustaceanShellfish = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleTreeNutsChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.treeNuts = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handlePeanutsChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.peanuts = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleWheatChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.wheat = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleSoybeansChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.soybeans = value;
    setCurrentInfo(newCurrentInfo);
  };

  const handleSesameChange = (value: boolean) => {
    const newCurrentInfo: InfoItem = JSON.parse(JSON.stringify(currentInfo));
    newCurrentInfo.sesame = value;
    setCurrentInfo(newCurrentInfo);
  };

  const onSubmitAllergensEvent = () => {
    const reqData = {
      userId,
      type: 'allergens',
      body: JSON.stringify(currentInfo),
    };
    saveAllergensInfo(token, reqData)
      .then((res: any) => {
        setCurrentInfo(res);
        setIsEdit(false);
      });
  };

  const onEditAllergensEvent = () => {
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
    <div className="allergens-body post-body">
      <div className="allergens-title post-top chatbot-title">
        Allergens Information
      </div>
      <div className="allergens-main post-main">
        <div className="edit-item row-item">
          <div className="edit-item-label">Milk</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.milk}
                style={{ width: 120 }}
                onChange={handleMilkChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.milk ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Eggs</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.eggs}
                style={{ width: 120 }}
                onChange={handleEggsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.eggs ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Fish</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.fish}
                style={{ width: 120 }}
                onChange={handleFishChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.fish ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Crustacean Shellfish</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.crustaceanShellfish}
                style={{ width: 120 }}
                onChange={handleCrustaceanShellfishChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.crustaceanShellfish ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Tree Nuts</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.treeNuts}
                style={{ width: 120 }}
                onChange={handleTreeNutsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.treeNuts ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Peanuts</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.peanuts}
                style={{ width: 120 }}
                onChange={handlePeanutsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.peanuts ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Wheat</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.wheat}
                style={{ width: 120 }}
                onChange={handleWheatChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.wheat ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Soybeans</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.soybeans}
                style={{ width: 120 }}
                onChange={handleSoybeansChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.soybeans ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Sesame</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={currentInfo.sesame}
                style={{ width: 120 }}
                onChange={handleSesameChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (currentInfo.sesame ? 'Yes' : 'No')}
          </div>
        </div>
      </div>
      <div className="allergens-bottom post-bottom">
        {isEdit && (
          <Button
            shape="round"
            onClick={onSubmitAllergensEvent}
          >
            Submit
          </Button>
        )}
        {!isEdit && (
          <>
            <Button
              shape="round"
              onClick={onEditAllergensEvent}
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

export default Allergens;
