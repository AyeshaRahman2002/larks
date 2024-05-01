from fastapi.requests import Request
import json
import os
from dotenv import load_dotenv
from contextvars import ContextVar
from os.path import exists
from pathlib import Path

load_dotenv()

sessionVar: ContextVar[dict] = ContextVar("context_var", default={"extra":{}})

#下面是先寫檔案緩存機制=>用檔案當cache的話, 硬碟要是ssd才會快,用傳統硬碟延遲就增加了,之後再看怎麼搞是否要換redis
def getCachePath(token:str):
    baseDir = str(Path(os.getcwd()))
    return baseDir+str(Path("/src/logs/tmpsessions/"))+str(Path("/"))+"s_"+token+".cache"

def restoreSessionVar(token:str):
    #預設關閉 如果啟用, 每個連線階段唯一的sessionToken會在cache資料夾生成與sessionToken名稱對應的cache file
    #同一個連線跨請求的共用狀態就可以透過這個cache file共用(別做太複雜的事情,別依賴這個做transaction)
    DISABLE_SESSION_FILE_CACHE = os.getenv("DISABLE_SESSION_FILE_CACHE", 1)
    if DISABLE_SESSION_FILE_CACHE or not token:
        return
    filepathname = getCachePath(token)
    file_exists = exists(filepathname)
    if file_exists:
        with open(filepathname) as f:
            sessionVarRaw = f.read()
            print("loaded", sessionVarRaw)
            obj = json.loads(sessionVarRaw) #parseJson(sessionVarRaw)
            setSessionVar(obj)
    else:
        with open(filepathname, "w") as f:
            f.write('{"sessionToken":"'+token+'"}')


def updSessionVar(key:str, value:any):
    svar = sessionVar.get()
    svar[key] = value
    sessionVar.set(svar)

def setSessionVar(value:dict):
    sessionVar.set(value)

def getSessionVar():
    return sessionVar.get()

#環境設定不要寫死代碼裡,用可以不用進git的.env動態載入替換,這檔案負責處理參數載入
def get_settings():
    PROJECT_NAME = str = "AIChatFlowAPI"
    PROJECT_VERSION = str = "1.0.0"

    POSTGRES_USER : str = os.getenv("POSTGRES_USER")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
    POSTGRES_SERVER : str = os.getenv("POSTGRES_SERVER","localhost")
    POSTGRES_PORT : str = os.getenv("POSTGRES_PORT",5432)
    POSTGRES_DB : str = os.getenv("POSTGRES_DB","aivector")
    POSTGRES_POOL_MIN : str = os.getenv("POSTGRES_POOL_MIN",1)
    POSTGRES_POOL_MAX : str = os.getenv("POSTGRES_POOL_MAX",4)
    POSTGRES_TIMEOUT : str = os.getenv("POSTGRES_TIMEOUT", 60)    
    DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

    OPENAI_API_KEY = str = os.getenv("OPENAI_API_KEY", "thisistest")
    DISABLE_AI_LOG = str = os.getenv("DISABLE_AI_LOG", 0)
    DISABLE_SESSION_FILE_CACHE = str = os.getenv("DISABLE_SESSION_FILE_CACHE", 1)
    return {
        "PROJECT_NAME": PROJECT_NAME,
        "PROJECT_VERSION": PROJECT_VERSION,
        "POSTGRES_USER": POSTGRES_USER,
        "POSTGRES_PASSWORD": POSTGRES_PASSWORD,
        "POSTGRES_SERVER": POSTGRES_SERVER,
        "POSTGRES_PORT": POSTGRES_PORT,
        "POSTGRES_DB": POSTGRES_DB,
        "POSTGRES_POOL_MIN": POSTGRES_POOL_MIN,
        "POSTGRES_POOL_MAX": POSTGRES_POOL_MAX,
        "POSTGRES_TIMEOUT": POSTGRES_TIMEOUT,
        "DATABASE_URL": DATABASE_URL,
        "OPENAI_API_KEY": OPENAI_API_KEY,
        "DISABLE_AI_LOG": DISABLE_AI_LOG,
        "DISABLE_SESSION_FILE_CACHE": DISABLE_SESSION_FILE_CACHE
    }


"""
async def process_body_and_header(request: Request):
 
    if 'content-type' in request.headers and request.headers['content-type'].startswith("multipart/form-data;"):
    
        #form = await request.form()
        formparsed = {}
        # print('form', form)
        # for key, val in form:
        #     formparsed.setdefault(key, []).append(val)
        return formparsed
    reqBody = await request.body() #parseJson(req)
    bodydecoded = reqBody.decode('utf-8')

    if bodydecoded:
        bodyparsed = parseJson(bodydecoded)
    else:
        bodyparsed = {}
 
    # if 'content-type' in request.headers and request.headers['content-type'] == 'text/plain':
    #     request._body = toJson(bodyparsed).encode('utf-8')
    #     cindex = [x[0] for x in request.scope['headers']].index(b'content-type')
 
    #     request.scope['headers'][cindex] = b'content-type',b'application/json'
 
    svar = getSessionVar()
    svar['reqBody'] = bodyparsed
    if 'sessionToken' in bodyparsed:
        restoreSessionVar(bodyparsed['sessionToken'])
    return bodyparsed
"""

def toJson(jsonableObj:any, ensure_ascii:bool = False):
    return json.dumps(jsonableObj, ensure_ascii=ensure_ascii)

def parseJson(jsonStr:str):
    return json.loads(jsonStr)
