import math
# from ..classes.demodata import *
from ..dependencies import getSessionVar, toJson
from ..utils.OpenAI import *

import numpy as np  # linear algebra
import pandas as pd  # data processing, CSV file I/O (e.g. pd.read_csv)

from app import db

engine = db.get_engine(bind_key="postgres")


# Endpoints with streaming requirements must be written this way, and for in must be written at the location directly called by the router
# Although this is the processing entry for the demo router, other structures that require AI streaming also need to be written according to the structure here.
# have not yet found a way to encapsulate this into a convenience subfunction
async def get_stream_recipe_gen(payload: any):
    instruction = """
    You are a chatbot that answers recipe questions accurately and intelligently using provided data.

    - Please utilize user questions, chat history context, and provided data to respond.
    - When suggesting recipes, avoid including ingredients that the user is allergic to.
    - Provide recipes according to the user's requested cuisine style, such as Chinese, Western, or Japanese.
    - Do not answer questions unrelated to recipes.
    - Please display the recipe name on the first line and enclose it in《》.
    """
    print("get_stream_recipe_gen start")

    # The API request for streaming generates SSE, so there is no need to return but to loop and keep yielding until Done
    # Utilizing SessionVar to request global effectiveness for some code division
    svar = getSessionVar()
    print("getSessionVar finish")
    the_resp = await get_chat_completion_stream(svar, instruction, get_his_formatted(payload.get('chat_history')),
                                                payload.get('question'))
    for chunk in the_resp:
        data = process_chunk(chunk, svar)
        print(chunk.choices[0].delta.content, end="")
        if not data is None:
            # print("data: "+data)
            yield data
    # print("finish stream:", svar)
    print("finish")

    # await post_stream_process(svar)


async def userdatasave(payload: any):
    with engine.connect() as con:
        con.execute(
            f"SELECT id FROM cb_basic_info where create_user = '{payload.get('reqData').get('userId')}' and type = '{payload.get('reqData').get('type')}'")
        dbresult = con.execute(
            f"SELECT id FROM cb_basic_info where create_user = '{payload.get('reqData').get('userId')}' and type = '{payload.get('reqData').get('type')}'")
        body = payload.get('reqData').get('body').replace("'", "''")
        results = dbresult.all()

        if (len(results) == 0):
            con.execute(
                f"INSERT INTO cb_basic_info (type, body, del_flag, create_user, create_time, update_time) VALUES ('{payload.get('reqData').get('type')}', '{body}', 0, '{payload.get('reqData').get('userId')}', now(), now())")
            dbresult = con.execute(
                f"SELECT id FROM cb_basic_info where create_user = '{payload.get('reqData').get('userId')}' and type = '{payload.get('reqData').get('type')}'")
            results = dbresult.all()
        else:
            con.execute(
                f"UPDATE cb_basic_info SET body = '{body}', update_time = now() WHERE id = '{results[0]['id']}'")

    return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
            "resData": {"id": results[0]['id'], "body": payload.get('reqData').get('body'),
                        "type": payload.get('reqData').get('type')}, "resTime": time.time()}


async def userdataget(payload: any):
    with engine.connect() as con:

        dbresult = con.execute(
            f"SELECT id, body, type FROM cb_basic_info where create_user = '{payload.get('reqData').get('userId')}' and type = '{payload.get('reqData').get('type')}'")

    result = dbresult.all()

    if (len(result) == 0):
        return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
                "resData": {"id": "", "body": "", "type": ""}, "resTime": time.time()}
    else:
        return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
                "resData": {"id": result[0]['id'], "body": result[0]['body'], "type": result[0]['type']},
                "resTime": time.time()}


async def saveLoveRecipe(payload: any):
    with engine.connect() as con:
        body = payload.get('reqData').get('body').replace("'", "''")
        dbresult = con.execute(
            f"insert into cb_love_recipe (name, body, del_flag, create_user, create_time, update_time) values('{payload.get('reqData').get('name')}', '{body}', '0', '{payload.get('reqData').get('userId')}', now(), now()) RETURNING id")
        insert_result = dbresult.all()

    return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
            "resData": {"id": insert_result[0]['id'], "body": body, "name": payload.get('reqData').get('name'),
                        "create_time": time.time(), "update_time": time.time()}, "resTime": time.time()}


async def getoneloverecipe(payload: any):
    with engine.connect() as con:
        dbresult = con.execute(f"select * from cb_love_recipe where id = '{payload.get('reqData').get('id')}'")
    result = dbresult.all()

    return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
            "resData": {"id": result[0]['id'], "body": result[0]['body'], "name": result[0]['name'],
                        "create_time": result[0]['create_time'], "update_time": result[0]['update_time']},
            "resTime": time.time()}


async def deloneloverecipe(payload: any):
    with engine.connect() as con:
        con.execute(f"delete from cb_love_recipe where id = '{payload.get('reqData').get('id')}'")

    return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
            "resData": None, "resTime": time.time()}


async def getlistloverecipe(payload: any):
    with engine.connect() as con:
        dbresult = con.execute(
            f"select * from cb_love_recipe where create_user = '{payload.get('reqData').get('userId')}'")
    result = dbresult.all()

    total = len(result)
    page = int(payload.get('reqData').get('page'))
    pageSize = int(payload.get('reqData').get('pageSize'))
    maxPage = math.ceil(total / pageSize)
    start = pageSize * (page - 1)
    end = pageSize * page

    data = []

    for i in result:
        data.append({"id": i['id'], "name": i['name'], "body": i['body'], "create_time": i['create_time'],
                     "update_time": i['update_time']})

    return {"reqId": payload.get('reqId'), "reqTime": payload.get('reqTime'), "code": "0000", "msg": "success",
            "resData": {"total": total, "page": page, "pageSize": pageSize, "maxPage": maxPage,
                        "data": data[start:end]}, "resTime": time.time()}


async def db_get_stream_recipe_gen(payload: any):
    print("AIDEMO.py")
    print(payload)

    keyword_instruction = """
    You are a keyword extraction bot that accurately and intelligently answers based on provided data.

    - Extract detailed keywords from user questions and chat history context for searching recipes the user desires.
    - Please do not use allergens as keywords
    - Keywords should be separated by space and translated into English.
    - You do not answer any of users question, only reply keywords.
    - If the question is not related to recipes, please respond with None.
    - Please infer from the question how many meals are needed and list the keywords required for each meal.
    - Use a space to separate keywords within the same meal, and a comma to separate different meals.
    - If a request is for one day's meals, the number of meals is 3.
    - The reply format should follow the format: number of meals, keyword, keyword
        Example: 3, breakfast American, lunch Chinese, dinner British 
        Example: 3, breakfast, lunch, dinner
    - "Please do not make replies outside of the specified format," this is important.
    - Before replying, please review the requirements above and ensure that your answer adheres to these rules.
    """

    keyword_instruction = await get_chat_completion(keyword_instruction, get_his_formatted(payload.get('chat_history')),
                                                    payload.get('question'))
    receipe = ''
    print('keyword_instruction : ' + keyword_instruction)
    if (keyword_instruction != 'None'):

        response = keyword_instruction.split(',')

        for x in range(1, int(response[0]) + 1):

            embeddedkw = get_embedding(response[x])
            with engine.connect() as con:
                dbresult = con.execute(
                    f"select name, description, keywords, ingredients, instructions from cb_recipe ORDER BY l2_distance('{embeddedkw}', vectors) asc LIMIT 3")
            result = dbresult.all()
            print(response[x])
            for row in result:
                s = {"Recipe name": row[0], "recipe simple description": row[1], "Recipe keywords": row[2],
                     "Recipe ingredients": row[3], "Recipe content": row[4]}
                print(row[0])
                ss = toJson(s)
                receipe += (ss + "\n\n")

    '''
        embeddedkw = get_embedding(keyword_instruction)
        dbresult = await database_instance.fetch_rows(f"select name, description, keywords, ingredients, instructions from cb_recipe ORDER BY l2_distance('{embeddedkw}', vectors) asc LIMIT 3")
        for row in dbresult:
            s = {"Recipe name": row[0], "recipe simple description": row[1], "Recipe keywords": row[2], 
                 "Recipe ingredients": row[3], "Recipe content": row[4]}
            ss = toJson(s)
            receipe +=  (ss + "\n\n")
    '''

    instruction = """
    You are a chatbot that answers recipe questions accurately and intelligently using provided data.

    - Please utilize user questions, chat history context, and provided data to respond.
    - When suggesting recipes, avoid including ingredients that the user is allergic to.
    - 'Please do not provide recipes that contain USER's allergens', THIS IS IMPORTANT.
    - Provide recipes according to the user's requested cuisine style, such as Asian or Japanese.
    - Do not answer questions unrelated to recipes.
    - Please display the recipe name on the first line and enclose it in《》.
    - Please list the recipe name, ingredients, and instruction in bullet points when answering.
    - Please review the above requirements before answering and ensure your response complies with these rules.
    """
    print("get_stream_recipe_gen start")


    svar = getSessionVar()
    print("getSessionVar finish")

    the_resp = await get_chat_completion_stream(svar, instruction, get_his_formatted(payload.get('chat_history')),
                                                payload.get('question'), receipe)
    print('create done')

    for chunk in the_resp:
        data = process_chunk(chunk, svar)
        print(chunk.choices[0].delta.content, end="")
        if not data is None:
            # print("data: "+data)
            yield data

    # print("finish stream:", svar)
    print("finish")

    # await post_stream_process(svar)





