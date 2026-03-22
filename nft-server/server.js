require('dotenv').config(); 
const fs = require('fs');
const crypto = require ('crypto')
const express = require('express');
const path = require('path');
const session = require('express-session');
const { ethers } = require('ethers');
const { exec } = require("child_process");

const app = express();
//running on port 3000
const PORT = 3000;

//set api key (environment variable for security reasons)
const provider = new ethers.JsonRpcProvider(
	`https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
);

//set contract address
const CONTRACT_ADDRESS = "0xD10F1517Ff4DcC47b745358113a5731EAb1b02D0";
const ABI = [
	"function ownerOf(uint256 tokenId) view returns (address)"
];

const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
//token id is 1 because I only made 1 token
const TOKEN_ID= 1;

//helper function to decrypt the hidden message 
//the message is stored AES encrypted in secret_message.enc for security purposes
function decryptMessage(filePath) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.MESSAGE_KEY, 'hex');

    // Read the encrypted file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { iv, data } = JSON.parse(fileContents);

    // Decrypt
    const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

app.use(express.json());
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));

// Serve static files (images, etc.)
app.use('/static', express.static(path.join(__dirname, 'public')));

// View page (public NFT view)
app.get('/view', (req, res) => {
    res.sendFile(path.join(__dirname, "views", "view.html"));
});

// Login Page
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

//sends the message to be signed
app.get("/challenge", (req, res) => {
    const { address } = req.query;

    //I am keeping this value static for simplicity of encoding and decoding
    // but it is more secure if this is a nonce
    const message = "Crypto1sFun!"

    res.json({ message });
});


app.post("/verify", async (req, res) => {
    const { address, signature, message } = req.body;

    try {

        // Get wallet address from signature
        const recoveredAddress = ethers.verifyMessage(message, signature);

        //make sure that the signer address is the same as the wallett that was added
	if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.json({ success: false });
        }

        //  Get NFT owner from blockchain
        const owner = await contract.ownerOf(TOKEN_ID);

        // Compare signature with NFT owner
        if (owner.toLowerCase() !== recoveredAddress.toLowerCase()) {
            return res.json({ success: false });
        }

        // If ownership verified, allow a session
        req.session.verifiedOwner = true;
        req.session.ownerAddress = recoveredAddress;

        // To change message, run encrypt_message.py
	const hiddenMessage = decryptMessage('messages/secret_message.enc');

	// run encoding script with the signature and message
        const command = `python3 scripts/encode.py "${signature}" "${hiddenMessage}"`;
	
	//error stuff
        exec(command, (error, stdout, stderr) => {

            if (error) {
                console.error("encoding error:", error);
                return res.json({ success: false });
            }

            console.log("stego image generated");

            return res.json({ success: true });

        });

    } catch (err) {

        console.error("Verification error:", err);
        return res.json({ success: false });

    }
});

//if there is not a session, deny access
//if there is a session then go to the views/asset.html
app.get("/asset", (req, res) => {
    if (!req.session || !req.session.verifiedOwner) {
        return res.status(403).send("Access denied. You do not own this NFT.");
    }

    res.sendFile(path.join(__dirname, "views", "asset.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
