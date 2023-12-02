# Real Estate Escrow Smart Contract
This project is a smart contract for a real estate escrow service, implemented in Solidity for the Ethereum blockchain. The contract uses the ERC721 standard for non-fungible tokens (NFTs) to represent properties in the real estate market.
## Contract Features
- **List Property**: Sellers can list properties for sale. Each property is represented as an NFT, and the listing includes details such as the buyer's address, the price, and the escrow amount.
- **Deposit Earnest**: Buyers can deposit an earnest amount to show interest in purchasing a property. The deposited amount is stored in the contract until the sale is finalized or cancelled.
- **Approve Sale**: The seller, lender, and buyer must all approve the sale before it can be finalized.
- **Finalize Sale**: Once all parties have approved the sale and the inspection has passed, the sale can be finalized. The earnest deposit is transferred to the seller, and the NFT representing the property is transferred to the buyer.
- **Cancel Sale**: If the inspection does not pass, the sale can be cancelled. The earnest deposit is returned to the buyer.
## Security Features
The contract includes several security features, such as:
- Access Control: Only the relevant parties (seller, buyer, lender, inspector) can call certain functions.
- Safe External Calls: The contract uses the "Checks-Effects-Interactions" pattern to mitigate re-entrancy attacks.
- Secure Funds Handling: The contract securely handles funds by keeping track of the earnest deposit for each sale separately.
## Future Work
The contract is a basic implementation of a real estate escrow service and does not include all potential features. Future work could include adding more complex features such as handling multiple currencies, integrating with a real estate data API, or implementing a bidding system for properties.
