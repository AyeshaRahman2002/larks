import React, { useContext } from 'react';
import { Button, Spin } from 'antd';
import VirtualList from 'rc-virtual-list';
import { useNavigate } from 'react-router-dom';
import { AuthTokenContext } from '../../../App';
import { getLoveRecipeListInfo } from '../../../utils/chatbot';
import { IPageItem, IRecipeItem, IGetRecipeListReqNode } from '../../../utils/cbinterface';
import parseDate from '../../../utils/dateUtils';
import './useRecipe.scss';

interface pagingNode {
  total: number;
  page: number;
  pageSize: number;
  maxPage: number;
}

function Page() {
  const userId = sessionStorage.getItem('email') || 'userId';
  const navigate = useNavigate();
  const { token } = useContext(AuthTokenContext);
  const recipeMainRef = React.useRef<HTMLDivElement>(null as any);
  const [spinning, setSpinning] = React.useState(false as boolean);
  const [listHight, setListHight] = React.useState(0 as number);
  const [pagingInfo, setPagingInfo] = React.useState({
    total: 0,
    page: 0,
    pageSize: 10,
    maxPage: 0,
  } as pagingNode);
  const [currentInfo, setCurrentInfo] = React.useState([] as IRecipeItem[]);

  const getInitDataEvent = async () => {
    if (pagingInfo.page > pagingInfo.maxPage) {
      return;
    }
    const param = {
      userId,
      page: String(pagingInfo.page + 1),
      pageSize: String(pagingInfo.pageSize),
    } as IGetRecipeListReqNode;
    setSpinning(true);
    await getLoveRecipeListInfo(token, param)
      .then((res: IPageItem<IRecipeItem[]>) => {
        const {
          data,
          total,
          page,
          pageSize,
          maxPage,
        } = res;
        if (data) setCurrentInfo(currentInfo.concat(data));
        setPagingInfo({
          total,
          page,
          pageSize,
          maxPage,
        } as pagingNode);
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  const onScroll = async (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (Math.abs(e.currentTarget.scrollHeight - e.currentTarget.scrollTop - listHight) <= 1) {
      await getInitDataEvent();
    }
  };

  const onClickRecipeItem = (item: IRecipeItem) => {
    navigate('/Allerdine/Chatbot/recipeDetalis', { state: item });
  };

  const onChatbotEvent = () => {
    navigate('/Allerdine/Chatbot');
  };

  // initialize
  React.useEffect(() => {
    // get profile info
    getInitDataEvent();
    setListHight(recipeMainRef.current.offsetHeight);
  }, []);

  return (
    <div className="recipe-body post-body">
      <div className="recipe-main post-main" ref={recipeMainRef}>
        <Spin spinning={spinning} delay={500}>
          <VirtualList
            itemKey="id"
            height={listHight}
            data={currentInfo}
            onScroll={onScroll}
          >
            {(item: IRecipeItem) => (
              <div
                key={item.id}
                tabIndex={0}
                role="button"
                className="recipe-item row-item"
                onClick={() => onClickRecipeItem(item)}
                onKeyDown={() => onClickRecipeItem(item)}
              >
                <div className="recipe-title row-item">
                  {item.name}
                </div>
                <div className="recipe-intro row-item" dangerouslySetInnerHTML={{ __html: item.body || '' }} />
                <div className="recipe-move row-item">
                  {`${parseDate(item.create_time || '')?.year}/${parseDate(item.create_time || '')?.month}/${parseDate(item.create_time || '')?.day}`}
                </div>
              </div>
            )}
          </VirtualList>
        </Spin>
      </div>
      <div className="recipe-bottom post-bottom">
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
