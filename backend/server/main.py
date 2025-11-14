from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uuid
import base64
import redis
import os
import json
import logging

app = FastAPI()
r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, decode_responses=False)

TASK_QUEUE = "ocr:tasks"

@app.on_event("startup")
async def startup_event():
    logging.basicConfig(level=logging.INFO)
    logging.info("Server started, listening for requests")

@app.post("/upload")
async def upload_image(file: UploadFile):
    task_id = str(uuid.uuid4())
    content = await file.read()

    # encode image as base64 so Redis can store it
    encoded = base64.b64encode(content)

    task = {
        "id": task_id,
        "image": encoded.decode()
    }

    # store as JSON
    r.rpush(TASK_QUEUE, json.dumps(task))

    return JSONResponse({"task_id": task_id})


@app.get("/result/{task_id}")
async def get_result(task_id: str):
    key = f"ocr:results:{task_id}"
    result = r.get(key)

    if result is None:
        return {"status": "pending"}
    
    return {"status": "done", "text": json.loads(result)}

