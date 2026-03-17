import hashlib
import random
from PIL import Image
import sys

#Create seed from signature (Hash signature)
def seed(signature: str) -> int:
    hash = hashlib.sha256(signature.encode()).digest()
    return int.from_bytes(hash, byteorder="big")

#Generates the pixel ordering
#Shuffles order in which pixels should be encoded 
#Shuffling is deterministic so you can still decode
def generate_chain(rng, width, height, length):
    total = width * height
    indices = list(range(total))
    rng.shuffle(indices)
    coords = [(i % width, i // width) for i in indices[:length]]
    return coords

#Modify the image
#Cycles through modifyig red, green, and blue
#red only version is commented out
def modify_img(image, chain, bits):
    """pixels = image.load()
    for (x, y), bit in zip(chain, bits):
        r, g, b = pixels[x, y]
        r = (r & 0b11111110) | bit
        pixels[x, y] = (r, g, b)
    return image"""
    pixels = image.load()
    for i, ((x, y), bit) in enumerate(zip(chain, bits)):
        r, g, b = pixels[x, y]

        if i % 3 == 0:       # red
            r = (r & 0b11111110) | bit
        elif i % 3 == 1:     # green
            g = (g & 0b11111110) | bit
        else:                # blue
            b = (b & 0b11111110) | bit

        pixels[x, y] = (r, g, b)
    return image


def main():
    #modified to take arguments
    signature = sys.argv[1]
    message = sys.argv[2]
    seed_val = seed(signature)
    rng = random.Random(seed_val)

    img = Image.open("public/banana_duck_nft.png").convert("RGB")
    width, height = img.size

    message_bytes = message.encode("utf-8")
    msg_len = len(message_bytes)
    length_bits = f"{msg_len:032b}"
    message_bits = ''.join(f"{b:08b}" for b in message_bytes)
    bits = list(map(int, length_bits + message_bits))

    chain = generate_chain(rng, width, height, len(bits))
    stego_img = modify_img(img, chain, bits)

    stego_img.save("public/asset.png")

if __name__ == "__main__":
    main()

