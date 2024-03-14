import React from 'react';
import { Link } from 'react-router-dom';
import { Input, Drawer } from 'antd';
import './useIndex.scss';
import menuL from '../../../images/menu_l.png';
import menuI from '../../../images/menu_i.png';
import aiPng from '../../../images/chatbot.png';
import { getCookie, setCookie } from '../../../utils/cookies';

const { TextArea } = Input;

interface IChatListItem {
  author: string;
  body: string;
  status?: boolean;
  timestamp?: number;
}

interface IChatItem {
  icon: string;
  isShowTime?: boolean;
  value: IChatListItem;
  onClick?: any;
}

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_CHAT_DEV
  : process.env.REACT_APP_CHAT_PROD;

// 请求回复内容
const callapi = async (url: string, data: any) => new Promise((resolve, reject) => {
  fetch(BASEURL + url, data)
    .then((response: any) => {
      resolve(response);
    })
    .catch((err: any) => {
      reject(err);
    });
});

// 时间戳转时间字符串
const getDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  // 使用Date对象的方法来获取所需的日期和时间部分
  const year = date.getUTCFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的，所以需要+1，并使用padStart来确保总是两位数
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // 将这些部分组合成一个字符串，形成所需的日期时间格式
  const dateTimeString = `${day}/${month}/${year} ${hours}:${minutes}`;
  return dateTimeString;
};

// 时间戳转时间字符串
const isShoeDateTime = (timestamp1 = 0, timestamp2 = 0, interval = 5) => {
  if (!timestamp1) return false;
  if (!timestamp2) return true;
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  if (date1.getUTCFullYear() > date2.getUTCFullYear()) return true;
  if (date1.getUTCMonth() > date2.getUTCMonth()) return true;
  if (date1.getUTCDate() > date2.getUTCDate()) return true;
  if (timestamp1 > (timestamp2 + (interval * 60 * 1000))) return true;
  return false;
};

const encodeURI = (str: string) => (str ? encodeURIComponent(str) : undefined);

const decodeURI = (str: string) => (str ? decodeURIComponent(str) : undefined);

function ChatItemLeft(
  {
    icon,
    isShowTime,
    value,
    onClick,
  }: IChatItem,
) {
  const htmlStr = { __html: value.body };
  return (
    <>
      {!!isShowTime && (
        <div className="chatbot-time">
          <div className="chatbot-time-tips">{getDateTime(value.timestamp || 0)}</div>
        </div>
      )}
      <div className="chatbot-main-item row-item chatbot-item-left" key={value.timestamp}>
        <div className="chatbot-item-icon col-item">
          <div className="chatbot-icon">
            <img src={icon} alt="menu" />
          </div>
        </div>
        <div className="chatbot-item-records col-item">
          <div className="chatbot-records-content" dangerouslySetInnerHTML={htmlStr} />
          <div className="chatbot-records-tips">
            { value.status ? (
              <div
                tabIndex={0}
                role="button"
                className="chatbot-records-tips-centent chatbot-btn"
                onClick={onClick}
                onKeyDown={onClick}
              >
                Regenerate the answer
              </div>
            ) : (
              <div className="chatbot-records-tips-centent">AI is answering</div>
            ) }
          </div>
        </div>
      </div>
    </>
  );
}

function ChatItemRight(
  {
    icon,
    isShowTime,
    value,
    onClick,
  }: IChatItem,
) {
  const htmlStr = { __html: value.body };
  return (
    <>
      {!!isShowTime && (
        <div className="chatbot-time">
          <div className="chatbot-time-tips">{getDateTime(value.timestamp || 0)}</div>
        </div>
      )}
      <div className="chatbot-main-item row-item chatbot-item-right" key={value.timestamp}>
        <div className="chatbot-item-records col-item">
          {!value.status && (
            <div
              tabIndex={0}
              role="button"
              className="chatbot-records-tips"
              title="重新发送"
              onClick={() => onClick(value)}
              onKeyDown={() => onClick(value)}
            >
              !
            </div>
          )}
          <div className="chatbot-records-content" dangerouslySetInnerHTML={htmlStr} />
        </div>
        <div className="chatbot-item-icon col-item">
          <div className="chatbot-icon">
            <img src={icon} alt="menu" />
          </div>
        </div>
      </div>
    </>
  );
}

function Home() {
  const [streamRecords, setStreamRecords] = React.useState(null as any);
  const [streamChangeFlag, setStreamChangeFlag] = React.useState(0);
  // 聊天变更说明
  const [chatChangeFlah, setChatChangeFlah] = React.useState(0);
  // 请求标识
  const [initFlag, setInitFlag] = React.useState(false);
  // AI繁忙标识
  const [aiBusyFlag, setAiBusyFlag] = React.useState(false);
  // 过敏原
  const [allergensInfo, setAllergensInfo] = React.useState(null);
  // 风格
  const [choicesFoodInfo, setChoicesFoodInfo] = React.useState(null);
  // 聊天记录
  const [chatList, setChatList] = React.useState([] as IChatListItem[]);

  // 聊天内容盒子
  const contentRef = React.useRef<HTMLDivElement>(null);
  // 菜单按钮标识
  const [isOpenMenu, setIsOpenMenu] = React.useState(false);
  // 聊天信息
  const [messag, setMessag] = React.useState({} as IChatListItem);
  // 聊天信息
  const [inTxt, setIntxt] = React.useState('');

  // 设置滚动条高度
  const setScrollHeightEvent = () => {
    const node = contentRef.current;
    if (node) {
      const height = contentRef.current?.scrollHeight || 0;
      node.scrollTop = height;
    }
  };

  // 更新聊天记录缓存
  const uploadChatHistoryCookieEvent = () => {
    const curChatList = chatList.length > 10 ? chatList.slice(-10) : chatList;
    const curChatListInfo = JSON.stringify(curChatList);
    // 将数据转URLCODE解决IOS浏览器COOKIES不能存储中文问题
    const curChatListURLCode = encodeURI(curChatListInfo) || '';
    setCookie('chatHistory', curChatListURLCode, { expires: 30 });
  };

  const handleResMsgEvent = async (decoded: string, done: any) => {
    const chatListArr = chatList;
    let lastRecord: IChatListItem = chatListArr.pop() || {} as IChatListItem;
    if (lastRecord.author === 'assistant') {
      lastRecord.body += decoded;
    } else {
      if (lastRecord.author === 'user') lastRecord.status = true;
      chatListArr.push(JSON.parse(JSON.stringify(lastRecord)));
      lastRecord = {
        author: 'assistant',
        body: decoded,
        status: false,
        timestamp: new Date().getTime(),
      } as IChatListItem;
    }
    if (done) {
      console.log('ai回复信息结束');
      lastRecord.status = true;
      lastRecord.timestamp = new Date().getTime();
    }
    chatListArr.push(lastRecord);
    setChatList(chatListArr);
    // 更新聊天变更标识
    setChatChangeFlah(new Date().getTime());
  };

  const getChatHistoryEvent = () => {
    let chatHistoryList = [] as {
      author: string,
      body: string,
    }[];
    // 获取所需提交的历史记录
    const chatHistoryDefault = JSON.stringify([
      {
        author: 'assistant',
        body: 'This is demo, please ask the question for the meal plan!',
        status: true,
        timestamp: new Date().getTime(),
      },
    ] as IChatListItem[]);
    const chatHistoryCookies = getCookie('chatHistory');
    const chatHistoryCookiesURLCode = decodeURI(chatHistoryCookies);
    const chatHistoryInfo = chatHistoryCookiesURLCode || chatHistoryDefault;
    let chatHistoryCookie = JSON.parse(chatHistoryInfo);
    chatHistoryCookie = chatHistoryCookie.filter((obj: IChatListItem) => obj.timestamp !== messag.timestamp && obj.status);
    chatHistoryList = chatHistoryCookie.map((obj: IChatListItem) => ({ author: obj.author, body: obj.body }));
    // get allergen
    const allergensInfos = [] as string[];
    const allergensInfoObj: any = allergensInfo;
    const allergensInfoKeys = Object.keys(allergensInfoObj);
    if (allergensInfoKeys.length > 0) {
      allergensInfoKeys.forEach((k: any) => {
        if (allergensInfoObj[k]) {
          allergensInfos.push(k);
        }
      });
    }
    // get styles of food
    const choicesFoodInfos = [] as string[];
    const choicesFoodInfoObj: any = choicesFoodInfo;
    const choicesFoodInfoKeys = Object.keys(choicesFoodInfoObj);
    if (choicesFoodInfoKeys.length > 0) {
      choicesFoodInfoKeys.forEach((k: any) => {
        if (choicesFoodInfoObj[k]) {
          choicesFoodInfos.push(k);
        }
      });
    }
    // 组装SYS信息
    const sysBody = {
      allergens: allergensInfos.join(),
      choicesFood: choicesFoodInfos.join(),
    };
    const sysChat = {
      author: 'system',
      body: JSON.stringify(sysBody),
    } as {
      author: string,
      body: string,
    };
    chatHistoryList.push(sysChat);
    return chatHistoryList;
  };

  const handleMsgEvent = async () => {
    const chatHistory = getChatHistoryEvent();
    const data = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({ question: messag.body, chat_history: chatHistory }),
    };
    callapi('demo/demo_gen_recipe', data)
      .then((res: any) => {
        const reader = res.body.getReader();
        if (reader) {
          setStreamChangeFlag(new Date().getTime());
          setStreamRecords(reader);
        }
      })
      .catch(() => {
        messag.status = false;
        const curChatList = chatList.filter((obj: IChatListItem) => messag.timestamp !== obj.timestamp);
        curChatList.push(messag);
        setChatList(curChatList);
        setAiBusyFlag(false);
        // 更新聊天变更标识
        setChatChangeFlah(new Date().getTime());
      });
  };

  // 重新回答
  const onRereplyEvent = async () => {
    if (aiBusyFlag) {
      alert('AI还在忙,等等在提问');
      return;
    }
    if (JSON.stringify(messag) !== '{}') {
      const newChatList: IChatListItem[] = JSON.parse(JSON.stringify(chatList));
      newChatList.pop();
      setChatList(newChatList);
      const newMessage: IChatListItem = JSON.parse(JSON.stringify(messag));
      newMessage.timestamp = new Date().getTime();
      setMessag(newMessage);
      // 更新聊天变更标识
      setChatChangeFlah(new Date().getTime());
    } else {
      alert('请先提交问题');
    }
  };

  // 重新发送
  const onResendEvent = async (obj: IChatListItem) => {
    if (aiBusyFlag) {
      alert('AI还在忙,等等在提问');
      return;
    }
    const currentMessage = JSON.parse(JSON.stringify(obj));
    currentMessage.status = true;
    currentMessage.timestamp = new Date().getTime();
    setMessag(currentMessage);
    const currentChatList = chatList.filter((val: IChatListItem) => val.timestamp !== obj.timestamp);
    currentChatList.push(currentMessage);
    setChatList(currentChatList);
    // 更新聊天变更标识
    setChatChangeFlah(new Date().getTime());
  };

  // 发送聊天信息
  const onSendMsgEvent = async () => {
    const sendMsg = inTxt.trim();
    if (sendMsg.length === 0) return;
    if (aiBusyFlag) {
      alert('AI还在忙,等等在提问');
      return;
    }
    const msgObj = {
      author: 'user',
      body: sendMsg,
      status: true,
      timestamp: new Date().getTime(),
    } as IChatListItem;
    const chatListObj = JSON.parse(JSON.stringify(chatList));
    chatListObj.push(msgObj);
    setChatList(chatListObj);
    // 保存聊天信息
    setMessag(msgObj);
    // 清空输入空内容
    setIntxt('');
    // 更新聊天变更标识
    setChatChangeFlah(new Date().getTime());
  };

  // 挂件组件时初始化数据
  React.useEffect(() => {
    // 获取过敏原
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
    });
    const cookiesAllergensInfo = getCookie('allergens') || allergensDefaultInfo;
    setAllergensInfo(JSON.parse(cookiesAllergensInfo));
    // get food style
    const choicesFoodDefaultInfo = JSON.stringify({
      european: false,
      asian: false,
    });
    const cookiesChoicesFoodInfo = getCookie('choicesFood') || choicesFoodDefaultInfo;
    setChoicesFoodInfo(JSON.parse(cookiesChoicesFoodInfo));
    // get and set up chat history
    const chatHistoryDefault = JSON.stringify([
      {
        author: 'assistant',
        body: 'This is demo, please ask the question for the meal plan!',
        status: true,
        timestamp: new Date().getTime(),
      },
    ] as IChatListItem[]);
    const chatHistoryCookies = getCookie('chatHistory');
    const chatHistoryCookiesURLCode = decodeURI(chatHistoryCookies);
    const chatHistoryInfo = chatHistoryCookiesURLCode || chatHistoryDefault;
    const chatHistoryCookie = JSON.parse(chatHistoryInfo);
    setChatList(chatHistoryCookie);
    // 设置初始化状态
    setInitFlag(true);
  }, []);

  // 组件初始化完成操作相关事件
  React.useEffect(() => {
    // 更新聊天内容滚动条位置
    setScrollHeightEvent();
  }, [initFlag]);

  // 聊天变更完成操作相关事件
  React.useEffect(() => {
    if (chatChangeFlah !== 0) {
      // 更新聊天内容滚动条位置
      setScrollHeightEvent();
      // 更新聊天记录缓存
      uploadChatHistoryCookieEvent();
    }
  }, [chatChangeFlah]);

  // 发送聊天记录
  React.useEffect(() => {
    if (JSON.stringify(messag) !== '{}') {
      // 设置繁忙
      setAiBusyFlag(true);
      // 发送聊天信息
      handleMsgEvent();
    }
  }, [messag.timestamp]);

  // 读取回复记录
  React.useEffect(() => {
    if (streamRecords) {
      try {
        streamRecords.read().then((res: any) => {
          const { done, value } = res;
          const decoded = new TextDecoder().decode(value);
          setStreamChangeFlag(new Date().getTime());
          handleResMsgEvent(decoded, done);
          if (done) {
            console.log('流结束时关闭连接');
            setAiBusyFlag(false);
            // 流结束时关闭连接
            streamRecords.releaseLock();
            setStreamRecords(null);
          }
        });
      } catch (error: any) {
        console.error('Error reading stream:', error);
      }
    }
  }, [streamChangeFlag]);

  return (
    <div className="chatbot-body">
      <div className="chatbot-top">
        <div
          tabIndex={0}
          role="button"
          className="chatbot-top-icon chatbot-icon"
          onClick={() => setIsOpenMenu(true)}
          onKeyDown={() => setIsOpenMenu(true)}
        >
          <img src={isOpenMenu ? menuL : menuI} alt="menu" />
        </div>
        <div className="chatbot-top-title">
          <div className="chatbot-icon">
            <img src={aiPng} alt="menu" />
          </div>
          <div className="chatbot-label">
            Allergy Chatbot
          </div>
        </div>
      </div>
      <div ref={contentRef} className="chatbot-main">
        {
          chatList.map((obj: IChatListItem, index: number) => {
            const value = JSON.parse(JSON.stringify(obj));
            const msgTxt = obj.body.replaceAll('\n', '<br />');
            value.body = msgTxt;
            const prevTimestamp = chatList[index - 1]?.timestamp || 0;
            if (value.author === 'assistant') {
              return (
                <ChatItemLeft
                  key={value.timestamp + value.author}
                  icon={aiPng}
                  isShowTime={isShoeDateTime(value.timestamp, prevTimestamp)}
                  value={value}
                  onClick={onRereplyEvent}
                />
              );
            }
            return (
              <ChatItemRight
                key={value.timestamp + value.author}
                icon={aiPng}
                isShowTime={isShoeDateTime(value.timestamp, prevTimestamp)}
                value={value}
                onClick={onResendEvent}
              />
            );
          })
        }
      </div>
      <div className="chatbot-bottom">
        <div className="chatbot-input-box col-item">
          <TextArea
            autoSize={{ minRows: 1, maxRows: 6 }}
            value={inTxt}
            onChange={(e) => setIntxt(e.target.value)}
          />
        </div>
        <div className="chatbot-send col-item">
          <button className="chatbot-send-button" type="submit" onClick={onSendMsgEvent}>
            Send
          </button>
        </div>
      </div>
      <div className="pop-up">
        <Drawer
          title={
            (
              <div className="chatbot-top-title">
                <div className="chatbot-icon">
                  <img src={aiPng} alt="menu" />
                </div>
                <div className="chatbot-label">
                  Allergy Chatbot
                </div>
              </div>
            )
          }
          className="sider-menu"
          placement="left"
          closable={false}
          onClose={() => setIsOpenMenu(false)}
          open={isOpenMenu}
          getContainer={false}
        >
          <div className="sider-menu-box">
            <div className="sider-menu-item">
              <Link to="profile">Profile</Link>
            </div>
            <div className="sider-menu-item">
              <Link to="allergens">Allergens List</Link>
            </div>
            <div className="sider-menu-item">
              <Link to="choicesFood">Food Choices</Link>
            </div>
            <div className="sider-menu-item">
              <Link to="terms">Terms and services</Link>
            </div>
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default Home;
