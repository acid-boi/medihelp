import json
import base64
import redis
import os
import pytesseract
import cv2
import numpy as np
from ocr_worker.parser import parse_prescription

r = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, decode_responses=False)

TASK_QUEUE = "ocr:tasks"


def process_task(task):
    task_id = task["id"]
    img_bytes = base64.b64decode(task["image"])

    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

    raw_text = pytesseract.image_to_string(thresh, lang='eng', config='--psm 6')

    parsed = parse_prescription(raw_text)

    r.set(f"ocr:results:{task_id}", json.dumps(parsed))


def worker_loop():
    print("OCR worker started...")
    while True:
        _, raw_task = r.blpop(TASK_QUEUE, timeout=0)
        task = json.loads(raw_task)
        process_task(task)


if __name__ == "__main__":
    worker_loop()