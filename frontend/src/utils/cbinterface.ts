export interface IReqDataItem<T> {
  reqId: string;
  reqTime: string;
  token: string;
  reqData?: T;
}

export interface IResDataItem<T> {
  code: string;
  msg: string;
  reqId: string;
  reqTime: string;
  resTime: string;
  resData?: T;
}

export interface IPageItem<T> {
  total: number;
  page: number;
  pageSize: number;
  maxPage: number;
  data?: T;
}

export interface IChatRecordNode {
  id?: string;
  userId: string;
  author: string;
  body: string;
  msgType: string;
  msgStatus: number;
  extend?: IExtendItem;
  createTime?: number;
  updateTime?: number;
}

export interface IChatListItem {
  icon?: string;
  isShowTime?: boolean;
  value: IChatRecordNode;
  onClick?: any;
}

export interface IGetChatListReqNode {
  userId: string;
}

export interface ISaveChatReqNode {
  id?: string;
  userId: string;
  author: string;
  body: string;
  msgType: string;
  msgStatus: number;
  extend: IExtendItem
}

export interface IExtendItem {
  allergens?: string;
  foodStyle?: string;
  profile?: string;
}

export interface IGetBasicReqNode {
  userId: string;
  type: string;
}

export interface ISaveBasicReqNode {
  id?: string;
  userId: string;
  type: string;
  body: string;
}

export interface IBasicResNode {
  id: string;
  type: string;
  body: string;
}

export interface IGetRecipeReqNode {
  id: string;
}

export interface IGetRecipeListReqNode {
  userId: string,
  page: string;
  pageSize: string;
}

export interface ISaveRecipeReqNode {
  id?: string;
  userId: string;
  name: string;
  body: string;
}

export interface IDelRecipeReqNode {
  id: string;
}

export interface IRecipeItem {
  id?: string;
  name: string;
  body?: string;
  create_time?: string;
  update_time?: string;
}
