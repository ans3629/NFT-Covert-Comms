# NFT-Covert-Comms
**Code for covert communications using NFTs**     
This is the code for the primary server of a covert communications channel which hosts an NFT and embeds the NFT with a secret message using the signature of the NFT owner's crypto wallet. This web server has three pages:      
/view: for anyone to view the NFT      
/login: for the NFT owner to log in. This page connects to the user's crypto wallet, collects a signature, compares the signature public key derived from the signature against the NFT owner according to the blockchain. If the user attempting to log in is the owner, the message is embedded in various pixels of the image with the order and location being dependent on the owner's signature.      
/asset: Once the owner has logged in, they are redirected to the /asset page where they can view and download the version of the image which has the message embedded.       

Once the encoded image has been downloaded, it can be decoded using the web server on my NFT-Covert-Comms-Decode repo.       

**Technical Details**        

.env file must contain:        
INFURA\_KEY     
SESSION\_SECRET     
MESSAGE\_KEY       

The Infura key is an API key that is used to query the blockchain. In this case, I chose to use Infura, but there are other blockchain API sites available as well.       

The session secret is a string that is used when creating the session. You can choose the string.       

To add a new message to the web server, you must run scripts/encrypt\_message.py, which will ask you for a 32 byte message key and the message you would like to send. You can randomly generate a message key, but ensure that it stays consistent throughout your environment until you change the message key manually. The message key will be added to the .env file.      

If using the covert channel, you will have to mint an original NFT to the blockchain. I minted my NFT on Ethereum Sepolia so it did not cost any money. Since NFT ownership is required for the channel to work, you will never be able to log in to this server when testing ownership of my NFT (because I am the owner). To change the NFT contract address, modify the CONTRACT\_ADDRESS variable in server.js.       

Dependencies:      
npm install dotenv express express-session ethers        

**Security Concerns**        
It is not recommended that this code is implemented for public use without adding additional security features. This code is provided as a proof of concept only and should be modified before being used in a real world application.         


