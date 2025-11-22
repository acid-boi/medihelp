import s2sphere
import psycopg2
from psycopg2.pool import SimpleConnectionPool


def get_neighbor_cells(lat, lng, level=13):
    latlng = s2sphere.LatLng.from_degrees(lat, lng)
    cell_id = s2sphere.CellId.from_lat_lng(latlng).parent(level)
    
    neighbor_ids = [cell_id.id()]
    
    for neighbor in cell_id.get_all_neighbors(level):
        neighbor_ids.append(neighbor.id())
    
    return neighbor_ids


def find_nearby_stores(latitude, longitude, db_pool):
    conn = None
    try:
        conn = db_pool.getconn()
        cur = conn.cursor()
        
        levels = [15, 14, 13, 12]
        
        for level in levels:
            cell_ids = get_neighbor_cells(latitude, longitude, level=level)
            
            placeholders = ','.join(['%s'] * len(cell_ids))
            query = f"""
                SELECT id, contact_person, contact_number, store_code, 
                       latitude, longitude, kendra_address, pin_code,
                       state_name, district_name
                FROM stores
                WHERE s2_cell_id_level_{level} IN ({placeholders})
            """
            
            cur.execute(query, cell_ids)
            stores = cur.fetchall()
            
            if stores:
                results = []
                seen_store_ids = set()
                
                for store in stores:
                    store_id, contact_person, contact_number, store_code, lat, lng, address, pin_code, state, district = store
                    
                    if store_id in seen_store_ids:
                        continue
                    
                    seen_store_ids.add(store_id)
                    results.append({
                        "store_id": store_id,
                        "owner_name": contact_person,
                        "phone_number": contact_number,
                        "store_code": store_code,
                        "address": address,
                        "pin_code": pin_code,
                        "state": state,
                        "district": district,
                        "latitude": lat,
                        "longitude": lng
                    })
                
                return {
                    "s2_level_used": level,
                    "stores_found": len(results),
                    "stores": results
                }
        
        return {
            "s2_level_used": None,
            "stores_found": 0,
            "stores": []
        }
    
    finally:
        if conn:
            db_pool.putconn(conn)
