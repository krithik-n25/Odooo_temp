import random
import string
from datetime import datetime

def generate_number(prefix: str) -> str:
    # Example: RFQ-20260606-ABC1
    date_str = datetime.now().strftime("%Y%m%d")
    rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{date_str}-{rand_str}"
