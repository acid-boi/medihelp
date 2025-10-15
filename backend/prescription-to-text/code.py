from PIL import Image
import pytesseract
import cv2
# Load image
img = cv2.imread("image.png")

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)


# OCR
text = pytesseract.image_to_string(thresh, lang='eng', config='--psm 6')
print(text)

