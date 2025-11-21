from rembg import remove
from PIL import Image
import io

input_path = 'public/logo_new.jpg'
output_path = 'public/logo_transparent.png'

try:
    with open(input_path, 'rb') as i:
        input_data = i.read()
        output_data = remove(input_data)
        
    with open(output_path, 'wb') as o:
        o.write(output_data)
        
    print("Background removed successfully.")
except Exception as e:
    print(f"Error removing background: {e}")
