import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router';
import { Button, Card } from 'antd';
import { IRecipeItem } from '../../../utils/cbinterface';
import parseDate from '../../../utils/dateUtils';

interface IDateStr {
  date: Date;
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  ms: number;
}

function Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [details, setDetails] = React.useState({} as IRecipeItem);
  const [dateStr, setDateStr] = React.useState({} as IDateStr);

  const onGoBackEvent = () => {
    navigate(-1);
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };

  // Initialize
  React.useEffect(() => {
    const obj = location.state;
    setDetails(obj);
    if (obj.create_time) {
      const date = parseDate(obj.create_time) || {} as IDateStr;
      setDateStr(date);
    }
  }, []);

  return (
    <div className="recipe-body post-body">
      <div className="recipe-main post-main">
        <Card
          className="recipe-card"
          title={details.name}
          bordered={false}
          classNames={{ header: 'recipe-card-header', body: 'recipe-card-body', extra: 'recipe-card-extra' }}
          extra={`${dateStr?.year}/${dateStr?.month}/${dateStr?.day}`}
        >
          <div
            className="recipe-content"
            dangerouslySetInnerHTML={{ __html: details.body || '' }}
          />
        </Card>
      </div>
      <div className="recipe-bottom post-bottom">
        <Button
          shape="round"
          onClick={onGoBackEvent}
        >
          Back
        </Button>
        <Button
          shape="round"
          onClick={onChatbotEvent}
        >
          Chatbot
        </Button>
      </div>
    </div>
  );
}
export default Page;
