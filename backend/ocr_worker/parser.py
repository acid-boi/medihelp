import re

def parse_prescription(text: str) -> list:
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    
    medicines = []


    pattern = re.compile(r"^(.*?):\s*(.*)$", re.IGNORECASE)

    for line in lines:
        match = pattern.match(line)
        if match:
            medicine_name = match.group(1).strip()
            frequency = match.group(2).strip()
            
            medicines.append({
                "medicine_name": medicine_name,
                "dosage": None,
                "frequency": frequency,
                "notes": None
            })

    return medicines
