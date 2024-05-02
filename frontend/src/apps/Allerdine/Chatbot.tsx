import React, { useEffect, useState } from 'react';
import { Drawer } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router';
import menuL from '../../images/menu_l.png';
import menuI from '../../images/menu_i.png';
import aiPng from '../../images/chatbot.png';
import './useChatbot.scss';

interface MenuItemNode {
  id: string;
  name: string;
  title?: string;
  uri?: string;
  icon?: string;
  className?: string;
  child?: MenuItemNode;
}

function chatbot() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(true);
  // 菜单按钮标识
  const [isOpenMenu, setIsOpenMenu] = React.useState(false as boolean);
  // 标题
  const [title, setTitle] = React.useState('Allergen chatbot' as string);
  // 菜单按钮标识
  const [menuItemList, setMenuItemList] = React.useState([] as MenuItemNode[]);

  const onMenuEvent = (menu: MenuItemNode) => {
    if (menu.uri) navigate(menu.uri);
    setIsOpenMenu(false);
    if (menu.title) setTitle(menu.title);
  };
  // initialize
  useEffect(() => {
    // get browser info
    const ua = navigator.userAgent;
    if (!ua.match(/AppleWebKit.*Mobile.*/)) {
      setIsMobile(false);
    }

    const menuItems: MenuItemNode[] = [
      {
        id: '1',
        name: 'Allergy Chatbot',
        title: 'Allergen chatbot',
        uri: '/Allerdine/Chatbot',
      },
      {
        id: '2',
        name: 'Profile',
        title: 'Profile',
        uri: '/Allerdine/Chatbot/profile',
      },
      {
        id: '3',
        name: 'Allergens List',
        title: 'Allergens List',
        uri: '/Allerdine/Chatbot/allergens',
      },
      {
        id: '4',
        name: 'Food Choices',
        title: 'Food Choices',
        uri: '/Allerdine/Chatbot/choicesFood',
      },
      {
        id: '5',
        name: 'Terms and services',
        title: 'Terms and services',
        uri: '/Allerdine/Chatbot/terms',
      },
      {
        id: '6',
        name: 'My favorite recipe',
        title: 'My favorite recipe',
        uri: '/Allerdine/Chatbot/recipe',
      },
    ];
    setMenuItemList(menuItems);
  }, []);
  return (
    <div className={isMobile ? 'chatbot-container mobile' : 'chatbot-container desktop'}>
      <div className="container-nav">
        <div
          tabIndex={0}
          role="button"
          className="chatbot-nav-menu chatbot-icon"
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          onKeyDown={() => setIsOpenMenu(!isOpenMenu)}
        >
          <img src={isOpenMenu ? menuL : menuI} alt="menu" />
        </div>
        <div className="container-nav-title">
          <div className="chatbot-icon">
            <img src={aiPng} alt="menu" />
          </div>
          <div className="chatbot-label">
            {title}
          </div>
        </div>
      </div>
      <div className="container-main">
        <Outlet />
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
                  {title}
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
            {
              menuItemList.map((obj: MenuItemNode) => (
                <div className="sider-menu-item" key={obj.id}>
                  <div
                    tabIndex={0}
                    role="button"
                    className={obj.className}
                    onClick={() => onMenuEvent(obj)}
                    onKeyDown={() => onMenuEvent(obj)}
                  >
                    {obj.title}
                  </div>
                </div>
              ))
            }
          </div>
        </Drawer>
      </div>
    </div>
  );
}

export default chatbot;
