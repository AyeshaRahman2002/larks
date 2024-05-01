import asyncio
from contextlib import asynccontextmanager
import json
import time
from typing import Dict
from flask import request, Blueprint, stream_with_context
import flask
from pydantic import BaseModel
#from __init__ import db

from app.modules.AIDemo import *

recipe_route = Blueprint('recipe', __name__)

class SaveUserData(BaseModel):
    reqId: str
    reqTime: str
    token: str
    reqData: Dict[str, str]
    


@recipe_route.route('/demo/save_user_data', methods=['POST'])
#async def save_user_data(payload:SaveUserData):
async def save_user_data():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        
        return await userdatasave(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}



@recipe_route.route("/demo/get_user_data", methods=['POST'])
async def get_user_data():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        
        return await userdataget(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}


@recipe_route.route("/demo/save_love_recipe", methods=['POST'])
async def save_love_recipe():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        print(payload)
        return await saveLoveRecipe(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}


@recipe_route.route("/demo/get_one_love_recipe", methods=['POST'])
async def get_one_love_recipe():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        
        return await getoneloverecipe(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}


@recipe_route.route("/demo/del_one_love_recipe", methods=['POST'])
async def del_one_love_recipe():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        
        return await deloneloverecipe(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}



@recipe_route.route("/demo/get_list_love_recipe", methods=['POST'])
async def get_list_love_recipe():
    try:
        payload = json.loads(request.data.decode('utf-8'))
        
        return await getlistloverecipe(payload)
    except Exception as e:
        print(f"Encounter exception: {e}")
        return {"reqId": payload.get('reqId'),"reqTime": payload.get('reqTime'),"code": "9999","msg": "fail","resData": '',"resTime": time.time()}





@recipe_route.route("/demo/db_demo_gen_recipe", methods=['POST'])
def db_demo_gen_recipe():
    """
    demo api, stream's api

    """
    payload = json.loads(request.data.decode('utf-8'))
        
    print("get request")
    try:
        headers = {
            "Content-Type": "text/event-stream",
            "Transfer-Encoding": "chunked",
            "Cache-Control": "no-cache, must-revalidate"
        }
        #print(db_get_stream_recipe_gen(payload))
        #print(type(db_get_stream_recipe_gen(payload)))
        #async for x in db_get_stream_recipe_gen(payload):
        #    print("")
        #    print(type(x))
        #    return x, headers
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        iter = iter_over_async(db_get_stream_recipe_gen(payload), loop)
        ctx = flask.stream_with_context(iter)
        response = flask.Response(ctx, content_type='text/event-stream')
        response.headers['Cache-Control'] = 'no-cache, must-revalidate'
        response.headers['Transfer-Encoding'] = 'chunked'
        return response

    except Exception as e:
        print(f"Encounter exception: {e}")
        #return StreamingResponse("[Done]", media_type="text/event-stream", headers={"Cache-Control": "no-cache"})
        return stream_with_context("[Done]"), headers


def iter_over_async(ait, loop):
    ait = ait.__aiter__()
    async def get_next():
        try: obj = await ait.__anext__(); return False, obj
        except StopAsyncIteration: return True, None
    while True:
        done, obj = loop.run_until_complete(get_next())
        if done: break
        yield obj

async def async_gen():
    for i in range(5):
        yield f"{i}\n"
        await asyncio.sleep(1)
'''
@recipe_route.route("/app/async")
def get_data():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    iter = iter_over_async(async_gen(), loop)
    ctx = flask.stream_with_context(iter)
    response = flask.Response(ctx, content_type='application/json')
    response.headers['X-Accel-Buffering'] = 'no'
    response.headers['Transfer-Encoding'] = 'chunked'
    return response
'''