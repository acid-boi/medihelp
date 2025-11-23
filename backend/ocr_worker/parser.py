import re

def parse_prescription(text: str) -> list:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    medicines = []
    
    for line in lines:
        dosage_match = re.search(r'(\d+)\s*(mg|g|ml|mcg|µg)', line, re.IGNORECASE)
        dosage = dosage_match.group(0) if dosage_match else None
        
        medicine_name_match = re.match(r'^([^:0-9]+?)(?:\s*\d+\s*(?:mg|g|ml|mcg|µg))?:', line, re.IGNORECASE)
        if medicine_name_match:
            medicine_name = medicine_name_match.group(1).strip()
        else:
            continue
        
        frequency_match = re.search(r':\s*(.+)$', line)
        frequency = frequency_match.group(1).strip() if frequency_match else None
        
        medicines.append({
            "medicine_name": medicine_name,
            "dosage": dosage,
            "frequency": frequency,
            "notes": None
        })
    
    return medicines
