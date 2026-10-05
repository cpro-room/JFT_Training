from PIL import Image

img = Image.open("dog3.png")

img.crop((0, 0, 250, 250)).save("dog_1.png")
img.crop((250, 0, 500, 250)).save("dog_2.png")
img.crop((0, 250, 250, 500)).save("dog_3.png")
img.crop((250, 250, 500, 500)).save("dog_4.png")