
from openai import OpenAI, embeddings
import tiktoken
from ..dependencies import get_settings
import time
#from .MainDBPool import database_instance

#All API concatenations that require OpenAI should be concentrated in this file, and do not import OpenAI elsewhere
#When there is any abnormality in the serial interface, it is also concentrated here for modification. If you need to call OpenAI elsewhere, simply call the functions provided here to avoid confusion and bug catching everywhere
settings = get_settings()
#openai.api_key = get_settings()['OPENAI_API_KEY']
client = OpenAI(api_key = settings['OPENAI_API_KEY'])


def get_embedding(src: str):
    model_id = "text-embedding-ada-002"
    embedding = embeddings.create(input=src, model=model_id).model_dump()
    return embedding['data'][0]['embedding']



#The interface is basically the same as the get_chatcompletion interface, and the implementation is basically the same. The only difference is that the stream parameter is true and must be async, but the implementation of the return is completely different.
async def get_chat_completion_stream(svar:any, instruction: str, history: list, question: str, knowledge: str = "", model: str ="gpt-4-0613", temperature: float=0.1, imgType:str = None, imgData:list = []):
    print("get_chat_completion_stream start")
    messages = [
        {"role": "system", "content": instruction}
    ]
    if len(history):
        for chat in history:
            messages.append(chat)
    if knowledge:
        messages.append({"role":"system", "content": "use these embed knowledgeto answer the question:\n"+knowledge})
    qdic = {"role": "user", "content": question}
    maxTokens = None
    messages.append(qdic)
    svar['extra']['stream_start'] = time.time()
    # select model for token calculation
    svar['extra']['stream_model'] = model
    print("before create")
    return client.chat.completions.create(messages=messages, model=model, temperature=temperature, stream=True, max_tokens=maxTokens, timeout=60)
    



# calculate tokens
def get_val_tokens(value:str, model="gpt-3.5-turbo-0613"):
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print("Warning: model not found. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")    
    return len(encoding.encode(value))



# This SDK did not call OpenAI, but it is highly related to OpenAI's chat completion requirements. It is better to focus on it here for now
# MaxLen is a parameter that truncates older conversation processes. A small number results in poor memory, while a larger number of requests can easily cause token limits and increase the cost of each request
# The current purpose of metaKeys is to pass ["recipe id"], and the conversation records sent by the front-end request will have properties for different contexts other than the author and body.
# These properties will not be included in the chat completion process. When a specified metaKey is specified, the corresponding key will be found and placed at the end of that body
# So when AI answers with a certain recipe, the response they receive is created by AI using that recipe (not in the displayed text, extracting JSON format and presenting hyperlinks, etc.).
# During the request dialogue, they will see AI: Recommend XXXX recipe because of OOOO (recipe id=RA000017)
# When AI determines that the user is asking for details about the recipe that was just answered, there is no information about that recipe during the chat process (we did not provide it to avoid excessive expansion of rag knowledge during the chat process).
# He knows the ID of that recipe and can request us to retrieve the information of that recipe ID for it to use as an answer
# Note that using this method will bind the Vue chat component currently used in the front-end, where the conversation record is between the author and the body, and the author is an interface such as you=user then=ai
def get_his_formatted(his:list, maxLen:int = 10, metaKeys:list = [], maxToken:int = 1000):
    message = []

    hisToken = 0
    if not his:
        return message


    for row in reversed(his):

        hisToken += get_val_tokens(str(row['body'])) + 3

        if len(message) == maxLen:
            break
        if hisToken >= maxToken:
            break
        content = row['body']
        if row['author'] == "them":
            role = "assistant"
            for metakey in metaKeys:
                if metakey in row and str(row[metakey]) != '':
                   content += " ("+metakey+"="+str(row[metakey])+")"
        elif row['author'] == "you":
            role = "user"
        else :
            role = row['author']
        message.insert(0, {"role": role, "content": content})
    #
    # for row in his[maxLen*-1:]:
    #     content = row['body']
    #     if row['author'] == "them":
    #         role = "assistant"
    #
    #         for metakey in metaKeys:
    #             if metakey in row:
    #                content += " ("+metakey+"="+str(row[metakey])+")"
    #     elif row['author'] == "you":
    #         role = "user"
    #     message.append({"role": role, "content": content})
    return message






#The second parameter is the ref obtained by getSessionVar, as it is difficult to adjust the structure and encapsulate it.
# At least put the accumulated data of the stream process into the session Var, which can be easily disposed of later
def process_chunk(chunk:any, svar:any):
    try:
        data = chunk.choices[0].delta.content
        if not data is None:
            if not 'streamed' in svar['extra']:
                svar['extra']['streamed'] = [data]
            else:
                svar['extra']['streamed'].append(data)
    except Exception as e:
        data = f"Error{e}"
        print('error', data)
    finally:
        return data




#It is copied from OpenAI and will not return the number of tokens used in the request and response during the stream. This function is used to calculate the input token
def num_tokens_from_messages(messages, model="gpt-3.5-turbo"):
    """Return the number of tokens used by a list of messages."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print("Warning: model not found. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")
    if model in {
        "gpt-3.5-turbo-0613",
        "gpt-3.5-turbo-16k-0613",
        "gpt-4-0314",
        "gpt-4-32k-0314",
        "gpt-4-0613",
        "gpt-4-32k-0613",
        }:
        tokens_per_message = 3
        tokens_per_name = 1
    elif model == "gpt-3.5-turbo-0301":
        tokens_per_message = 4  # every message follows <|start|>{role/name}\n{content}<|end|>\n
        tokens_per_name = -1  # if there's a name, the role is omitted
    elif "gpt-3.5-turbo" in model:
        print("Warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0613.")
        return num_tokens_from_messages(messages, model="gpt-3.5-turbo-0613")
    elif "gpt-4" in model:
        print("Warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.")
        return num_tokens_from_messages(messages, model="gpt-4-0613")
    else:
        raise NotImplementedError(
            f"""num_tokens_from_messages() is not implemented for model {model}. See https://github.com/openai/openai-python/blob/main/chatml.md for information on how messages are converted to tokens."""
        )
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            valtoken = 0
            try:
                valtoken = len(encoding.encode(value))
            except Exception as e:
                print("count token failed:", value, e)
                valtoken = 0
            num_tokens += valtoken            
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3  # every reply is primed with <|start|>assistant<|message|>
    return num_tokens





def get_val_tokens(value:str, model="gpt-3.5-turbo-0613"):
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print("Warning: model not found. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")    
    return len(encoding.encode(value))



async def get_chat_completion(instruction: str, history: list, question: str, knowledge: str = "", model: str ="gpt-4-0613", temperature: float=0.7, imgType:str = None, imgData:list = []):
    messages = [
        {"role": "system", "content": instruction}
    ]
    if len(history):
        for chat in history:
            messages.append(chat)
    #Unified RAG format approach, where knowledge is automatically appended to a set of questions in a single string of characters
    if knowledge:
        messages.append({"role":"assistant", "content": "use these embed knowledgeto answer the question:\n"+knowledge})

    qdic = {"role": "user", "content": question}
    maxTokens = None
    messages.append(qdic)
    resp = client.chat.completions.create(messages=messages, model=model, temperature=temperature, max_tokens=maxTokens)
    #print(resp)
    return resp.choices[0].message.content
