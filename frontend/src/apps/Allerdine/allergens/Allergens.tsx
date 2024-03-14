import React from 'react';
import { Button, Select } from 'antd';
import './useAllergens.scss';
import { useNavigate } from 'react-router-dom';
import { getCookie, setCookie } from '../../../utils/cookies';

interface allergensItem {
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
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = React.useState(false);
  // 获取过敏
  const allergensDefaultInfo = JSON.stringify({
    milk: false,
    eggs: false,
    fish: false,
    crustaceanShellfish: false,
    treeNuts: false,
    peanuts: false,
    wheat: false,
    soybeans: false,
    sesame: false,
  } as allergensItem);
  const cookiesAllergensInfo = getCookie('allergens') || allergensDefaultInfo;
  const [allergensInfo, setAllergensInfo] = React.useState(JSON.parse(cookiesAllergensInfo) as allergensItem);

  const handleMilkChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.milk = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleEggsChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.eggs = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleFishChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.fish = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleCrustaceanShellfishChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.crustaceanShellfish = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleTreeNutsChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.treeNuts = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handlePeanutsChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.peanuts = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleWheatChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.wheat = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleSoybeansChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.soybeans = value;
    setAllergensInfo(newAllergensInfo);
  };

  const handleSesameChange = (value: boolean) => {
    const newAllergensInfo: allergensItem = JSON.parse(JSON.stringify(allergensInfo));
    newAllergensInfo.sesame = value;
    setAllergensInfo(newAllergensInfo);
  };

  const onSubmitAllergensEvent = () => {
    setCookie('allergens', JSON.stringify(allergensInfo), { expires: 30 });
    setIsEdit(false);
  };

  const onEditAllergensEvent = () => {
    setIsEdit(true);
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };
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
                defaultValue={allergensInfo.milk}
                style={{ width: 120 }}
                onChange={handleMilkChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.milk ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Eggs</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.eggs}
                style={{ width: 120 }}
                onChange={handleEggsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.eggs ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Fish</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.fish}
                style={{ width: 120 }}
                onChange={handleFishChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.fish ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Crustacean Shellfish</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.crustaceanShellfish}
                style={{ width: 120 }}
                onChange={handleCrustaceanShellfishChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.crustaceanShellfish ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Tree Nuts</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.treeNuts}
                style={{ width: 120 }}
                onChange={handleTreeNutsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.treeNuts ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Peanuts</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.peanuts}
                style={{ width: 120 }}
                onChange={handlePeanutsChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.peanuts ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Wheat</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.wheat}
                style={{ width: 120 }}
                onChange={handleWheatChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.wheat ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Soybeans</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.soybeans}
                style={{ width: 120 }}
                onChange={handleSoybeansChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.soybeans ? 'Yes' : 'No')}
          </div>
        </div>
        <div className="edit-item row-item">
          <div className="edit-item-label">Sesame</div>
          <div className="edit-item-content">
            {isEdit && (
              <Select
                defaultValue={allergensInfo.sesame}
                style={{ width: 120 }}
                onChange={handleSesameChange}
                options={[
                  { value: false, label: 'No' },
                  { value: true, label: 'Yes' },
                ]}
              />
            )}
            {!isEdit && (allergensInfo.sesame ? 'Yes' : 'No')}
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
