from Cryptodome.Cipher import AES
from Cryptodome.Random import get_random_bytes
import json

key = bytes.fromhex(input("Enter message key (32 bytes): "))
message = input("Enter the secret message: ")

iv = get_random_bytes(16)
cipher = AES.new(key, AES.MODE_CBC, iv)

# Pad message to multiple of 16 bytes
pad_len = 16 - len(message) % 16
padded_message = message + chr(pad_len)*pad_len

encrypted = cipher.encrypt(padded_message.encode('utf-8'))

with open("../messages/secret_message.enc", "w") as f:
    json.dump({"iv": iv.hex(), "data": encrypted.hex()}, f)

print("Completed")
