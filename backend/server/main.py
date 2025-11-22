from fastapi import FastAPI, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
import uuid
import base64
import redis
import os
import json
import logging
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from rapidfuzz import fuzz, process
from server.store_finder import find_nearby_stores

app = FastAPI()

r = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=6379,
    decode_responses=False
)

TASK_QUEUE = "ocr:tasks"

DB_POOL = SimpleConnectionPool(
    1,
    10,
    user=os.getenv("DB_USER", "postgres"),
    password=os.getenv("DB_PASSWORD", "postgres"),
    host=os.getenv("DB_HOST", "localhost"),
    port=os.getenv("DB_PORT", "5432"),
    database=os.getenv("POSTGRES_DB", "medihelp")
)


@app.on_event("startup")
async def startup_event():
    logging.basicConfig(level=logging.INFO)
    logging.info("Server started, listening for requests")


@app.post("/upload")
async def upload_image(file: UploadFile):
    task_id = str(uuid.uuid4())
    content = await file.read()
    encoded = base64.b64encode(content)

    task = {
        "id": task_id,
        "image": encoded.decode()
    }

    r.rpush(TASK_QUEUE, json.dumps(task))

    return JSONResponse({"task_id": task_id})


@app.get("/result/{task_id}")
async def get_result(task_id: str):
    key = f"ocr:results:{task_id}"
    result = r.get(key)

    if result is None:
        return {"status": "pending"}

    return {"status": "done", "text": json.loads(result)}

@app.post("/findNearestStores")
def find_nearest_stores(latitude: float, longitude: float):
    try:
        result = find_nearby_stores(latitude, longitude, DB_POOL)
        
        return {
            "user_location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "s2_level_used": result["s2_level_used"],
            "stores_found": result["stores_found"],
            "nearest_stores": result["stores"]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))










@app.get("/getSuggestions")
def get_suggestions(q: str = Query(..., min_length=2)):
    conn = None
    try:
        conn = DB_POOL.getconn()
        cur = conn.cursor()

        search_pattern = f"%{q}%"
        cur.execute("""
            SELECT name, short_composition1, short_composition2 
            FROM medicines 
            WHERE name ILIKE %s
            LIMIT 100
        """, (search_pattern,))
        candidate_medicines = cur.fetchall()

        generic_cache_key = "generic_compositions_full"
        cached_generics = r.get(generic_cache_key)
        
        if cached_generics:
            all_generics = json.loads(cached_generics)
        else:
            cur.execute("""
                SELECT generic_name, drug_code, mrp, unit_size, group_name 
                FROM generic_medicines
            """)
            generic_rows = cur.fetchall()
            all_generics = {
                row[0]: {
                    "generic_name": row[0],
                    "drug_code": row[1],
                    "mrp": float(row[2]) if row[2] else None,
                    "unit_size": row[3],
                    "group_name": row[4]
                }
                for row in generic_rows
            }
            r.setex(generic_cache_key, 3600, json.dumps(all_generics))

        generic_names = list(all_generics.keys())
        brand_names = [m[0] for m in candidate_medicines]
        matched_medicines = process.extract(
            q,
            brand_names,
            scorer=fuzz.WRatio,
            limit=10
        )

        results = []
        for match_name, brand_score, idx in matched_medicines:
            brand_name, comp1, comp2 = candidate_medicines[idx]

            comp1_match = process.extractOne(comp1, generic_names, scorer=fuzz.WRatio)
            
            if not comp1_match or comp1_match[1] < 70:
                continue

            matched_generic_name = comp1_match[0]
            generic_data = all_generics[matched_generic_name]

            confidence = "weak"
            matched_generics = [generic_data]

            if comp2:
                comp2_match = process.extractOne(comp2, generic_names, scorer=fuzz.WRatio)
                if comp2_match and comp2_match[1] > 70:
                    confidence = "strong"
                    matched_generic_name_2 = comp2_match[0]
                    if matched_generic_name_2 != matched_generic_name:
                        matched_generics.append(all_generics[matched_generic_name_2])

            results.append({
                "brand_name": brand_name,
                "composition1": comp1,
                "composition2": comp2,
                "score": brand_score,
                "confidence": confidence,
                "matched_generics": matched_generics
            })

        return {"query": q, "results": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            DB_POOL.putconn(conn)
