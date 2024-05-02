import axios from 'axios';
import { getUUID } from './chatbot';
import {
  IDelRecipeReqNode,
  IGetBasicReqNode,
  IGetChatListReqNode,
  IGetRecipeListReqNode,
  IGetRecipeReqNode,
  IReqDataItem,
  IResDataItem,
  ISaveBasicReqNode,
  ISaveChatReqNode,
  ISaveRecipeReqNode,
} from './cbinterface';

const BASEURL = process.env.NODE_ENV === 'development'
  ? process.env.REACT_APP_CHAT_DEV
  : process.env.REACT_APP_CHAT_PROD;

const getChatHistory = async (data: IReqDataItem<IGetChatListReqNode>) => {
  console.log(data);
  return axios.get('/test/data.json');
};

const saveChatHistory = async (data: IReqDataItem<ISaveChatReqNode>) => {
  const resParam = {
    reqId: data.reqId,
    reqTime: `${new Date().getTime()}`,
    resTime: `${new Date().getTime()}`,
  } as IResDataItem<any>;
  return new Promise((resolve, reject) => {
    const resData: any = data?.reqData;
    if (resData) {
      resData.id = getUUID();
      resData.createTime = new Date().getTime();
      resData.updateTime = new Date().getTime();
      resParam.code = '0000';
      resParam.msg = 'success';
      resParam.resData = resData;
      resolve(resParam);
    } else {
      resParam.code = '9999';
      resParam.msg = 'error';
      reject(resParam);
    }
  });
};

const getBasicInfo = async (data: IReqDataItem<IGetBasicReqNode>) => {
  const url = `${BASEURL}demo/get_user_data`;
  return axios.post(url, data);
};

const saveBasicInfo = async (data: IReqDataItem<ISaveBasicReqNode>) => {
  const url = `${BASEURL}demo/save_user_data`;
  return axios.post(url, data);
};

const getLoveRecipe = async (data: IReqDataItem<IGetRecipeReqNode>) => {
  const url = `${BASEURL}demo/get_one_love_recipe`;
  return axios.post(url, data);
};

const getLoveRecipeList = async (data: IReqDataItem<IGetRecipeListReqNode>) => {
  const url = `${BASEURL}demo/get_list_love_recipe`;
  return axios.post(url, data);
};

const saveLoveRecipe = async (data: IReqDataItem<ISaveRecipeReqNode>) => {
  const url = `${BASEURL}demo/save_love_recipe`;
  return axios.post(url, data);
};

const delLoveRecipe = async (data: IReqDataItem<IDelRecipeReqNode>) => {
  const url = `${BASEURL}demo/del_one_love_recipe`;
  return axios.post(url, data);
};

export {
  getChatHistory,
  saveChatHistory,
  getBasicInfo,
  saveBasicInfo,
  getLoveRecipe,
  getLoveRecipeList,
  saveLoveRecipe,
  delLoveRecipe,
};
