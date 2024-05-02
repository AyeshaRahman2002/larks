import React, { useContext } from 'react';
import { Input } from 'antd';
import { AuthTokenContext } from '../../../App';
import { getAllergensInfo, getFoodStyleInfo, saveLoveRecipeInfo } from '../../../utils/chatbot';
import { ISaveRecipeReqNode } from '../../../utils/cbinterface';
import aiPng from '../../../images/chatbot.png';
import './useIndex.scss';

const { TextArea } = Input;

interface IChatItemNode {
  author: string;
  body: string;
  status?: boolean;
  timestamp?: number;
  recipeName?: string;
  isSaveRecipe?: boolean;
}

interface IChatChildNode {
  icon: string;
  isShowTime?: boolean;
  value: IChatItemNode;
  onClick?: any;
}

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_CHAT_DEV
  : process.env.REACT_APP_CHAT_PROD;

// request response
const callapi = async (url: string, data: any) => new Promise((resolve, reject) => {
  fetch(BASEURL + url, data)
    .then((response: any) => {
      resolve(response);
    })
    .catch((err: any) => {
      reject(err);
    });
});

// Time setting
const getDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份是從0開始的，所以需要+1，並使用padStart來確保總是兩位數
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  // combine
  const dateTimeString = `${day}/${month}/${year} ${hours}:${minutes}`;
  return dateTimeString;
};

//
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

function ChatItemLeft(
  {
    icon,
    isShowTime,
    value,
    onClick,
  }: IChatChildNode,
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
            <div className="chatbot-records-tips-auto col-item">
              { value.status ? (
                <div
                  tabIndex={0}
                  role="button"
                  className="chatbot-records-tips-centent chatbot-btn"
                  onClick={() => onClick('reanswer')}
                  onKeyDown={() => onClick('reanswer')}
                >
                  regenerate the answer
                </div>
              ) : (
                <div className="chatbot-records-tips-centent">AI is answering</div>
              ) }
            </div>
            { (!!value.recipeName && !value.isSaveRecipe && value.status) && (
              <div
                tabIndex={0}
                role="button"
                className="chatbot-records-tips-centent col-item"
                onClick={() => onClick('saveRecipe', value)}
                onKeyDown={() => onClick('saveRecipe', value)}
              >
                save recipes
              </div>
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
  }: IChatChildNode,
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
              title="resend"
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
  const userId = sessionStorage.getItem('email') || 'userId';
  const { token } = useContext(AuthTokenContext);
  const [streamRecords, setStreamRecords] = React.useState(null as any);
  const [streamChangeFlag, setStreamChangeFlag] = React.useState(0 as number);
  // change
  const [chatChangeFlah, setChatChangeFlah] = React.useState(0 as number);
  const [initFlag, setInitFlag] = React.useState(false as boolean);
  const [aiBusyFlag, setAiBusyFlag] = React.useState(false as boolean);
  const [allergensInfo, setAllergensInfo] = React.useState(null as any);
  const [foodStyleInfo, setFoodStyleInfo] = React.useState(null as any);
  const [chatList, setChatList] = React.useState([] as IChatItemNode[]);

  // chatbot
  const contentRef = React.useRef<HTMLDivElement>(null as any);
  // info
  const [messag, setMessag] = React.useState({} as IChatItemNode);
  // info
  const [inTxt, setIntxt] = React.useState('' as string);

  // get allergen style
  const getAllergensInfoEvent = async () => {
    const initAllergensInfo = await getAllergensInfo(token, userId);
    setAllergensInfo(initAllergensInfo);
  };

  // get food style
  const getFoodStyleEvent = async () => {
    const initFoodStyle = await getFoodStyleInfo(token, userId);
    setFoodStyleInfo(initFoodStyle);
  };

  // get chat history
  const getChatListEvent = async () => {
    const chatHistoryDefault = JSON.stringify([
      {
        author: 'assistant',
        body: 'This is a demo, please ask questions about meal planning!',
        status: true,
        timestamp: new Date().getTime(),
      },
    ] as IChatItemNode[]);
    const chatHistoryInfo = sessionStorage.getItem('chatHistory') || chatHistoryDefault;
    const chatHistoryCookie = JSON.parse(chatHistoryInfo);
    setChatList(chatHistoryCookie);
  };

  const initDataEvent = () => {
    // get allergen
    getAllergensInfoEvent();
    // get style
    getFoodStyleEvent();
    // get chat history
    getChatListEvent();
    // initialize
    setInitFlag(true);
  };

  // scroll height
  const setScrollHeightEvent = () => {
    const node = contentRef.current;
    if (node) {
      const height = contentRef.current?.scrollHeight || 0;
      node.scrollTop = height;
    }
  };

  // update chat history
  const uploadChatHistoryEvent = () => {
    const curChatListInfo = JSON.stringify(chatList);
    sessionStorage.setItem('chatHistory', curChatListInfo);
  };

  const handleResMsgEvent = async (decoded: string, done: any) => {
    const chatListArr = chatList;
    let lastRecord: IChatItemNode = chatListArr.pop() || {} as IChatItemNode;
    if (lastRecord.author === 'assistant') {
      lastRecord.body += decoded;
      // checking whether is recipe
      if (lastRecord.body.indexOf('《') > -1 && !lastRecord.recipeName) {
        const regex = /《([^>]*)》/g;
        const matches = lastRecord.body.match(regex);
        if (matches && matches.length > 0) {
          const recipeName: string = matches[0];
          lastRecord.recipeName = recipeName.replaceAll('《', '')
            .replaceAll('》', '');
        }
      }
    } else {
      if (lastRecord.author === 'user') lastRecord.status = true;
      chatListArr.push(JSON.parse(JSON.stringify(lastRecord)));
      lastRecord = {
        author: 'assistant',
        body: decoded,
        status: false,
        timestamp: new Date().getTime(),
      } as IChatItemNode;
    }
    if (done) {
      console.log('The ai replies to the message');
      lastRecord.status = true;
      lastRecord.timestamp = new Date().getTime();
    }
    chatListArr.push(lastRecord);
    setChatList(chatListArr);
    // update
    setChatChangeFlah(new Date().getTime());
  };

  const getChatHistoryEvent = () => {
    let chatHistoryList = [] as {
      author: string,
      body: string,
    }[];
    // get history
    const chatHistoryDefault = JSON.stringify([
      {
        author: 'assistant',
        body: 'This is a demo, please ask questions about meal planning!',
        status: true,
        timestamp: new Date().getTime(),
      },
    ] as IChatItemNode[]);
    const chatHistoryInfo = sessionStorage.getItem('chatHistory') || chatHistoryDefault;
    let chatHistorySession = JSON.parse(chatHistoryInfo);
    chatHistorySession = chatHistorySession.length > 10 ? chatHistorySession.slice(-10) : chatHistorySession;
    chatHistoryList = chatHistorySession
      .filter((obj: IChatItemNode) => obj.timestamp !== messag.timestamp && obj.status)
      .map((obj: IChatItemNode) => ({ author: obj.author, body: obj.body }));

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
    // get food choice
    const foodStyleInfos = [] as string[];
    const foodStyleInfoObj: any = foodStyleInfo;
    const foodStyleInfoKeys = Object.keys(foodStyleInfoObj);
    if (foodStyleInfoKeys.length > 0) {
      foodStyleInfoKeys.forEach((k: any) => {
        if (foodStyleInfoObj[k]) {
          foodStyleInfos.push(k);
        }
      });
    }
    // sys info combined
    const sysBody = {
      allergens: allergensInfos.join(),
      choicesFood: foodStyleInfos.join(),
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
    callapi('demo/db_demo_gen_recipe', data)
      .then((res: any) => {
        const reader = res.body.getReader();
        if (reader) {
          setStreamChangeFlag(new Date().getTime());
          setStreamRecords(reader);
        }
      })
      .catch(() => {
        messag.status = false;
        const curChatList = chatList.filter((obj: IChatItemNode) => messag.timestamp !== obj.timestamp);
        curChatList.push(messag);
        setChatList(curChatList);
        setAiBusyFlag(false);
        // update
        setChatChangeFlah(new Date().getTime());
      });
  };

  // save reciepe
  const saveRecipeEvent = async (obj: IChatItemNode) => {
    const reqData = {
      userId,
      name: obj.recipeName,
      body: obj.body,
    } as ISaveRecipeReqNode;
    await saveLoveRecipeInfo(token, reqData)
      .then(() => {
        const newChatList = chatList.map((val: IChatItemNode) => {
          const o = JSON.parse(JSON.stringify(val));
          if (val.timestamp === obj.timestamp) o.isSaveRecipe = true;
          return o;
        });
        setChatList(newChatList);
        setChatChangeFlah(new Date().getTime());
      });
  };

  // re-answer
  const onRereplyEvent = async () => {
    if (aiBusyFlag) {
      alert('AI is still busy. Wait for questions');
      return;
    }
    if (JSON.stringify(messag) !== '{}') {
      const newChatList: IChatItemNode[] = JSON.parse(JSON.stringify(chatList));
      newChatList.pop();
      setChatList(newChatList);
      const newMessage: IChatItemNode = JSON.parse(JSON.stringify(messag));
      newMessage.timestamp = new Date().getTime();
      setMessag(newMessage);
      // update icon
      setChatChangeFlah(new Date().getTime());
    } else {
      alert('Please submit your question first');
    }
  };

  const onChatItemLeftEvent = async (sign: string, obj: IChatItemNode) => {
    switch (sign) {
      case 'reanswer':
        onRereplyEvent();
        break;
      case 'saveRecipe':
        saveRecipeEvent(obj);
        break;
      default:
        break;
    }
  };

  // resend
  const onResendEvent = async (obj: IChatItemNode) => {
    if (aiBusyFlag) {
      alert('AI is still busy. Wait for questions');
      return;
    }
    const currentMessage = JSON.parse(JSON.stringify(obj));
    currentMessage.status = true;
    currentMessage.timestamp = new Date().getTime();
    setMessag(currentMessage);
    const currentChatList = chatList.filter((val: IChatItemNode) => val.timestamp !== obj.timestamp);
    currentChatList.push(currentMessage);
    setChatList(currentChatList);
    // change icon
    setChatChangeFlah(new Date().getTime());
  };

  // send message
  const onSendMsgEvent = async () => {
    const sendMsg = inTxt.trim();
    if (sendMsg.length === 0) return;
    if (aiBusyFlag) {
      alert('AI is still busy. Wait for questions');
      return;
    }
    const msgObj = {
      author: 'user',
      body: sendMsg,
      status: true,
      timestamp: new Date().getTime(),
    } as IChatItemNode;
    const chatListObj = JSON.parse(JSON.stringify(chatList));
    chatListObj.push(msgObj);
    setChatList(chatListObj);
    // save chat history
    setMessag(msgObj);
    // clear text
    setIntxt('');
    // 更新聊天变更标识
    setChatChangeFlah(new Date().getTime());
  };

  // 挂件组件时初始化数据
  React.useEffect(() => {
    // 初始化数据
    initDataEvent();
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
      uploadChatHistoryEvent();
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
            console.log('Close the connection at the end of the stream');
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
      <div ref={contentRef} className="chatbot-main">
        {
          chatList.map((obj: IChatItemNode, index: number) => {
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
                  onClick={onChatItemLeftEvent}
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
    </div>
  );
}

export default Home;
