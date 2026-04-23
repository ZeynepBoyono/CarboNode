# CLAUDE.md — EcoTracker: ReFi Carbon & Incentive System (Monad Hackathon MVP)

## 🚨 Hackathon Context (Important)
This project is being built for a 24-hour Web3 Hackathon on the Monad Network. Prioritize speed, functional MVPs, and clean simulations over over-engineered production setups. 
- Use **OpenZeppelin (v4 or v5)** libraries strictly.
- Write highly readable, well-commented code (in English or Turkish) so the logic can be easily explained to a jury.

## Core Smart Contract Architecture
The system consists of three main components. **Invoke the `smart-contract-review` skill** before modifying this core logic.

### 1. EcoToken (ERC-20)
- **Purpose:** The spendable reward token earned via eco-friendly actions (recycling, public transit).
- **Minting Rule:** Can ONLY be minted by the `EcoTracker Core` contract.
- **Programmability:** Include a specific function/modifier that allows the token to be spent/burned at designated "green business" wallets (Programmable money vision).

### 2. EcoProfile (SBT - Soulbound Token / ERC-721)
- **Purpose:** A non-transferable 'Environmental Reputation' profile for each user.
- **SBT Constraint:** All transfer functions (e.g., `transferFrom`, `safeTransferFrom`) MUST be disabled/reverted to make it non-transferable (similar to ERC-5192 standard).
- **Data Storage:** Must contain on-chain variables to track the user's `totalCarbonCredit` earned and their current `ecoLevel`.

### 3. EcoTracker Core (Main Logic Contract)
- **Purpose:** The central hub that connects Oracle data to token issuance.
- **Trigger Function:** Must have a `recordEcoAction` function.
- **Security:** This function can ONLY be triggered by an authorized wallet (e.g., `OnlyOwner` or a mapped Oracle address) to simulate IoT/external data validation.
- **Action Flow:** When `recordEcoAction` is called, it must:
  1. Mint `EcoToken` (ERC-20) to the user's wallet.
  2. Update the environmental score/level in the user's `EcoProfile` (SBT).

## Smart Contract Workflow (Solidity)
- **Environment:** Code should be provided in a way that it can be easily copied into a single file or logically separated blocks for immediate deployment via **Remix IDE** to the Monad Testnet.
- **Performance:** Optimize for Monad's parallel execution. Keep state changes minimal.

## Off-Chain Simulation (Python & Frontend)
- **Oracle Simulation:** External IoT or transit data will be simulated via a Python backend using `web3.py`. The Python script will act as the "Authorized Oracle" calling the `recordEcoAction` function.
- **Frontend:** Next.js with `viem`/`wagmi` for wallet connection. The UI must clearly display the non-transferable `EcoProfile` stats alongside the spendable `EcoToken` balance.

## Hard Rules
- **Never** make the `EcoProfile` SBT transferable.
- **Never** allow public minting of the `EcoToken`.
- **Always** include clear comments (`//`) explaining the business logic of each function for jury presentation purposes.