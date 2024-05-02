import {
  getBasicInfo,
  getLoveRecipeList,
  saveBasicInfo,
  saveLoveRecipe,
} from './request';
import {
  IGetBasicReqNode,
  IGetRecipeListReqNode,
  IPageItem,
  IRecipeItem,
  IReqDataItem,
  ISaveBasicReqNode,
  ISaveRecipeReqNode,
} from './cbinterface';

const getUUID = () => {
  const init = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  const uuid = init.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-bitwise
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return uuid;
};

const getPubildParam = (str: any) => {
  const token = str || '';
  const uuid = getUUID();
  const data = {
    reqId: uuid,
    reqTime: `${new Date().getTime()}`,
    token,
  } as IReqDataItem<any>;
  return data;
};

const getProfileInfo = async (token: any, userId: string) => {
  let profileDefault = {
    name: '',
    age: 0,
    gender: '',
  };
  const param: IReqDataItem<IGetBasicReqNode> = getPubildParam(token);
  param.reqData = {
    userId,
    type: 'profile',
  };
  await getBasicInfo(param)
    .then((res: any) => {
      const resObj = res.data;
      if (resObj.code === '0000') {
        profileDefault = JSON.parse(resObj.resData.body);
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
  const key = `${userId}_profile`;
  sessionStorage.setItem(key, JSON.stringify(profileDefault));
  return profileDefault;
};

const saveProfileInfo = async (token: any, data: any) => {
  const param: IReqDataItem<ISaveBasicReqNode> = getPubildParam(token);
  param.reqData = data;
  return new Promise((resolve, reject) => {
    saveBasicInfo(param)
      .then((res: any) => {
        const resObj = res.data;
        if (resObj.code === '0000') {
          const key = `${data.userId}_profile`;
          const { resData } = resObj;
          sessionStorage.setItem(key, resData.body);
          resolve(JSON.parse(resData.body));
        } else {
          alert(resObj.msg);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

const getAllergensInfo = async (token: any, userId: string) => {
  let allergensDefault = {
    milk: false,
    eggs: false,
    fish: false,
    crustaceanShellfish: false,
    treeNuts: false,
    peanuts: false,
    wheat: false,
    soybeans: false,
    sesame: false,
  };
  const param: IReqDataItem<IGetBasicReqNode> = getPubildParam(token);
  param.reqData = {
    userId,
    type: 'allergens',
  };
  await getBasicInfo(param)
    .then((res: any) => {
      const resObj = res.data;
      if (resObj.code === '0000') {
        allergensDefault = JSON.parse(resObj.resData.body);
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
  const key = `${userId}_allergens`;
  sessionStorage.setItem(key, JSON.stringify(allergensDefault));
  return allergensDefault;
};

const saveAllergensInfo = async (token: any, data: any) => {
  const param: IReqDataItem<ISaveBasicReqNode> = getPubildParam(token);
  param.reqData = data;
  return new Promise((resolve, reject) => {
    saveBasicInfo(param)
      .then((res: any) => {
        const resObj = res.data;
        if (resObj.code === '0000') {
          const key = `${data.userId}_allergens`;
          const { resData } = resObj;
          sessionStorage.setItem(key, resData.body);
          resolve(JSON.parse(resData.body));
        } else {
          alert(resObj.msg);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

const getFoodStyleInfo = async (token: any, userId: string) => {
  let foodStyleDefault = {
    european: false,
    asian: false,
  };
  const param: IReqDataItem<IGetBasicReqNode> = getPubildParam(token);
  param.reqData = {
    userId,
    type: 'foodStyle',
  };
  await getBasicInfo(param)
    .then((res: any) => {
      const resObj = res.data;
      if (resObj.code === '0000') {
        foodStyleDefault = JSON.parse(resObj.resData.body);
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
  const key = `${userId}_foodStyle`;
  sessionStorage.setItem(key, JSON.stringify(foodStyleDefault));
  return foodStyleDefault;
};

const saveFoodStyleInfo = async (token: any, data: any) => {
  const param: IReqDataItem<ISaveBasicReqNode> = getPubildParam(token);
  param.reqData = data;
  return new Promise((resolve, reject) => {
    saveBasicInfo(param)
      .then((res: any) => {
        const resObj = res.data;
        if (resObj.code === '0000') {
          const key = `${data.userId}_foodStyle`;
          const { resData } = resObj;
          sessionStorage.setItem(key, resData.body);
          resolve(JSON.parse(resData.body));
        } else {
          alert(resObj.msg);
        }
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

const getLoveRecipeListInfo = async (token: any, data: IGetRecipeListReqNode) => {
  let recipeListDefault = {
    total: 0,
    page: 0,
    pageSize: 0,
    maxPage: 0,
  } as IPageItem<IRecipeItem[]>;
  const param: IReqDataItem<IGetRecipeListReqNode> = getPubildParam(token);
  param.reqData = data;
  await getLoveRecipeList(param)
    .then((res: any) => {
      const resObj = res.data;
      if (resObj.code === '0000') {
        recipeListDefault = resObj.resData;
      }
    })
    .catch((err: any) => {
      console.log(err);
    });
  return recipeListDefault;
};

const saveLoveRecipeInfo = async (token: any, data: ISaveRecipeReqNode) => {
  const param: IReqDataItem<ISaveRecipeReqNode> = getPubildParam(token);
  param.reqData = data;
  return new Promise((resolve, reject) => {
    saveLoveRecipe(param)
      .then((res: any) => {
        const resObj = res.data;
        let msg = 'failed to save recipe';
        if (resObj.code === '0000') {
          msg = 'save recipe successfully';
        }
        alert(msg);
        resolve(resObj);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
};

export {
  getUUID,
  getProfileInfo,
  saveProfileInfo,
  getAllergensInfo,
  saveAllergensInfo,
  getFoodStyleInfo,
  saveFoodStyleInfo,
  getLoveRecipeListInfo,
  saveLoveRecipeInfo,
};
