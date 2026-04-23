#!/usr/bin/env python3
"""
CarboNode — Off-Chain Oracle Simulator
ReFi Carbon Footprint Tracker | Monad Hackathon MVP
"""

import time
import sys
import os
import ctypes

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

try:
    from web3 import Web3
    from web3.exceptions import ContractLogicError
except ImportError:
    print("\n  [ERROR] web3 kütüphanesi bulunamadı.")
    print("  Kurulum için: pip install web3\n")
    sys.exit(1)

# ──────────────────────────────────────────────────────────────────────────────
#  WINDOWS ANSI SUPPORT — ctypes ile VT100 modunu etkinleştir (Win10/11)
# ──────────────────────────────────────────────────────────────────────────────
if os.name == "nt":
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

# ──────────────────────────────────────────────────────────────────────────────
#  CONFIG — Deployment parametrelerini aşağıya gir
# ──────────────────────────────────────────────────────────────────────────────
RPC_URL              = "https://testnet-rpc.monad.xyz"                           # Monad Testnet RPC
CHAIN_ID             = 10143                                                      # Monad Testnet Chain ID
PRIVATE_KEY          = "0x1fcc3ea07f3f2f79ad79c415fa86b83f4e6c9a455b7581310cc83c3403e4b67b"
CONTRACT_ADDRESS     = "0x975F0226bAc7B3700C529C2db380Bac4E249d05F"              # EcoTrackerCore — Monad Testnet
DEFAULT_USER_ADDRESS = "0x9A98b0E5c3D315ab40CB1df47dE7A2e3741FDF11"              # Demo hedef cüzdan (Monad hesabı)

# ──────────────────────────────────────────────────────────────────────────────
#  ABI — Minimal: yalnızca recordEcoAction fonksiyonu
#  (Ham veri asla zincire yazılmaz; sadece doğrulanmış eylem tipi gönderilir)
# ──────────────────────────────────────────────────────────────────────────────
ECO_TRACKER_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "user",       "type": "address"},
            {"internalType": "uint8",   "name": "actionType", "type": "uint8"}
        ],
        "name":            "recordEcoAction",
        "outputs":         [],
        "stateMutability": "nonpayable",
        "type":            "function"
    }
]

# ──────────────────────────────────────────────────────────────────────────────
#  ACTION TYPE CONSTANTS — EcoTrackerCore.ActionType enum sırasına göre
# ──────────────────────────────────────────────────────────────────────────────
ACTION_RECYCLING        = 0  # → Mint 10 ECO  | +10 Carbon Credits
ACTION_PUBLIC_TRANSPORT = 1  # → Mint  5 ECO  |  +5 Carbon Credits

# ──────────────────────────────────────────────────────────────────────────────
#  TERMINAL COLORS
# ──────────────────────────────────────────────────────────────────────────────
class C:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    GREEN   = "\033[92m"
    CYAN    = "\033[96m"
    YELLOW  = "\033[93m"
    RED     = "\033[91m"
    MAGENTA = "\033[95m"
    BLUE    = "\033[94m"
    WHITE   = "\033[97m"

# ──────────────────────────────────────────────────────────────────────────────
#  LOGGER HELPERS
# ──────────────────────────────────────────────────────────────────────────────
def log_info(msg: str):
    print(f"  {C.CYAN}[INFO]{C.RESET}      {msg}")

def log_security(msg: str):
    print(f"  {C.YELLOW}[SECURITY]{C.RESET}  {msg}")

def log_oracle(msg: str):
    print(f"  {C.MAGENTA}[ORACLE]{C.RESET}    {msg}")

def log_chain(msg: str):
    print(f"  {C.BLUE}[CHAIN]{C.RESET}     {msg}")

def log_success(msg: str):
    print(f"  {C.GREEN}[SUCCESS]{C.RESET}   {msg}")

def log_error(msg: str):
    print(f"  {C.RED}[ERROR]{C.RESET}     {msg}")

# ──────────────────────────────────────────────────────────────────────────────
#  UI COMPONENTS
# ──────────────────────────────────────────────────────────────────────────────
def print_banner():
    print("\033[2J\033[H", end="")  # ANSI: ekranı temizle ve imleci başa al
    print(f"""
{C.GREEN}{C.BOLD}\
  ██████╗ █████╗ ██████╗ ██████╗  ██████╗ ███╗   ██╗ ██████╗ ██████╗ ███████╗
 ██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗████╗  ██║██╔═══██╗██╔══██╗██╔════╝
 ██║     ███████║██████╔╝██████╔╝██║   ██║██╔██╗ ██║██║   ██║██║  ██║█████╗
 ██║     ██╔══██║██╔══██╗██╔══██╗██║   ██║██║╚██╗██║██║   ██║██║  ██║██╔══╝
 ╚██████╗██║  ██║██║  ██║██████╔╝╚██████╔╝██║ ╚████║╚██████╔╝██████╔╝███████╗
  ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝ ╚═════╝ ╚══════╝
{C.RESET}""")
    sep = f"  {C.DIM}{'─' * 74}{C.RESET}"
    print(sep)
    print(f"  {C.CYAN}ReFi Carbon Footprint Tracker{C.RESET}  ·  {C.MAGENTA}Monad Network Oracle Simulator{C.RESET}")
    print(f"  {C.DIM}Off-Chain Computation Layer  ·  ZK-Proof Mock Engine  ·  v1.0.0{C.RESET}")
    print(sep)
    print()


def print_status(w3: Web3, oracle_addr: str, contract_addr: str):
    balance = w3.from_wei(w3.eth.get_balance(oracle_addr), "ether")
    log_info(f"Network : {C.CYAN}Monad Testnet{C.RESET}  |  Chain ID: {C.CYAN}{w3.eth.chain_id}{C.RESET}")
    log_info(f"Oracle  : {C.MAGENTA}{oracle_addr}{C.RESET}")
    log_info(f"Balance : {C.GREEN}{balance:.4f} MON{C.RESET}")
    log_info(f"Contract: {C.CYAN}{contract_addr}{C.RESET}")
    print()


def print_menu():
    sep = f"  {C.DIM}{'─' * 55}{C.RESET}"
    print(f"  {C.BOLD}{C.WHITE}SELECT ORACLE SIGNAL SOURCE{C.RESET}")
    print(sep)
    print(
        f"  {C.GREEN}[1]{C.RESET}  Simulate Smart Recycling Bin Hardware Signal\n"
        f"       {C.DIM}IoT Sensor → RFID scan validated → recordEcoAction(RECYCLING){C.RESET}"
    )
    print()
    print(
        f"  {C.CYAN}[2]{C.RESET}  Simulate Public Transit API Webhook  "
        f"{C.YELLOW}(ZK-Proof Mock){C.RESET}\n"
        f"       {C.DIM}Metro API → Route stripped → recordEcoAction(PUBLIC_TRANSPORT){C.RESET}"
    )
    print()
    print(f"  {C.RED}[0]{C.RESET}  Exit")
    print(sep)

# ──────────────────────────────────────────────────────────────────────────────
#  OFF-CHAIN PIPELINE SIMÜLASYONLARI
#  Privacy kuralı: ham konum/rota verisi ASLA zincire gönderilmez.
#  Sadece ZK ispatı doğrulandıktan sonra eylem tipi blokzincire yazılır.
# ──────────────────────────────────────────────────────────────────────────────
def simulate_recycling_pipeline():
    sep = f"  {C.DIM}{'─' * 62}{C.RESET}"
    print()
    print(sep)
    print(f"  {C.GREEN}{C.BOLD} RECYCLING BIN ORACLE PIPELINE{C.RESET}")
    print(sep)
    print()

    steps = [
        (log_info,     "Smart bin hardware signal received  (RFID tag: #****-****-7E3F)"),
        (log_info,     "Processing off-chain action data..."),
        (log_info,     "Bin ID validated: CB-IST-KADIKÖY-042  |  Material: PET Plastic"),
        (log_security, "GPS coordinates stripped from payload.  [LAT/LON → NULL]"),
        (log_security, "Device fingerprint hashed. Raw hardware ID removed from memory."),
        (log_security, "Generating ZK-Proof mock...  proof_hash=0x3a7f9c…c91b  ✓ VALID"),
        (log_oracle,   "Action type resolved: RECYCLING  (ActionType = 0)"),
        (log_oracle,   "Reward preview: +10 ECO Token  |  +10 Carbon Credits"),
    ]
    for fn, msg in steps:
        fn(msg)
        time.sleep(0.45)
    print()


def simulate_transit_pipeline():
    sep = f"  {C.DIM}{'─' * 62}{C.RESET}"
    print()
    print(sep)
    print(f"  {C.CYAN}{C.BOLD} PUBLIC TRANSIT API WEBHOOK PIPELINE{C.RESET}")
    print(sep)
    print()

    steps = [
        (log_info,     "Transit API webhook received  (provider: Metro Istanbul)"),
        (log_info,     "Processing off-chain action data..."),
        (log_info,     "Trip ID validated: TRP-2025-****-****  |  Line: M2 Yenikapı–Hacıosman"),
        (log_security, "GPS/Transit routes stripped.  [ROUTE_POLYLINE → NULL]"),
        (log_security, "User travel pattern anonymized. Origin/Destination removed."),
        (log_security, "Generating ZK-Proof mock...  proof_hash=0x9c2ef1…f047  ✓ VALID"),
        (log_oracle,   "Action type resolved: PUBLIC_TRANSPORT  (ActionType = 1)"),
        (log_oracle,   "Reward preview: +5 ECO Token   |  +5 Carbon Credits"),
    ]
    for fn, msg in steps:
        fn(msg)
        time.sleep(0.45)
    print()

# ──────────────────────────────────────────────────────────────────────────────
#  TRANSACTION BUILDER / SIGNER / BROADCASTER
# ──────────────────────────────────────────────────────────────────────────────
def send_eco_action(
    w3: Web3,
    contract,
    oracle_address: str,
    user_address: str,
    action_type: int,
) -> tuple[str, object]:
    checksum_user = Web3.to_checksum_address(user_address)

    log_chain(f"Building transaction  →  user: {C.CYAN}{checksum_user}{C.RESET}")
    time.sleep(0.3)

    nonce     = w3.eth.get_transaction_count(oracle_address)
    gas_price = w3.eth.gas_price

    gas_est = contract.functions.recordEcoAction(
        checksum_user, action_type
    ).estimate_gas({"from": oracle_address})

    log_chain(
        f"Nonce: {nonce}  |  Gas: {gas_est}  |  "
        f"Gas Price: {w3.from_wei(gas_price, 'gwei'):.2f} Gwei"
    )
    time.sleep(0.3)

    tx = contract.functions.recordEcoAction(
        checksum_user, action_type
    ).build_transaction({
        "chainId":  CHAIN_ID,
        "from":     oracle_address,
        "nonce":    nonce,
        "gas":      gas_est + 10_000,  # küçük güvenlik tamponu
        "gasPrice": gas_price,
    })

    log_chain("Signing raw transaction with Oracle private key...")
    time.sleep(0.4)

    signed  = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)

    log_chain("Broadcasting to Monad Network...")
    time.sleep(0.3)

    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

    log_chain("Waiting for block confirmation...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    return tx_hash.hex(), receipt

# ──────────────────────────────────────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────────────────────────────────────
def main():
    print_banner()

    # ── Web3 bağlantısı ────────────────────────────────────────────────────────
    w3 = Web3(Web3.HTTPProvider(RPC_URL))

    if not w3.is_connected():
        log_error(f"Cannot connect to Monad RPC endpoint: {RPC_URL}")
        log_error("Check your internet connection or update RPC_URL in CarboNode.py")
        sys.exit(1)

    checksum_contract = Web3.to_checksum_address(CONTRACT_ADDRESS)
    contract          = w3.eth.contract(address=checksum_contract, abi=ECO_TRACKER_ABI)
    oracle_account    = w3.eth.account.from_key(PRIVATE_KEY)

    print_status(w3, oracle_account.address, checksum_contract)

    # ── Ana menü döngüsü ───────────────────────────────────────────────────────
    while True:
        print_menu()
        choice = input(f"  {C.BOLD}{C.WHITE}> Enter choice: {C.RESET}").strip()

        if choice == "0":
            print()
            log_info("Oracle process terminated. All off-chain data purged from memory.")
            print()
            sys.exit(0)

        elif choice in ("1", "2"):
            action_type = ACTION_RECYCLING if choice == "1" else ACTION_PUBLIC_TRANSPORT
            action_name = "RECYCLING"       if choice == "1" else "PUBLIC_TRANSPORT"

            # Off-chain pipeline simülasyonu (privacy katmanı)
            if choice == "1":
                simulate_recycling_pipeline()
            else:
                simulate_transit_pipeline()

            # Hedef cüzdan adresini al (boş bırakılırsa DEFAULT_USER_ADDRESS kullanılır)
            user_input = input(
                f"  {C.BOLD}{C.WHITE}> Target wallet address "
                f"{C.DIM}[Enter = {DEFAULT_USER_ADDRESS[:10]}...]{C.RESET}"
                f"{C.BOLD}{C.WHITE}: {C.RESET}"
            ).strip()

            if not user_input:
                user_input = DEFAULT_USER_ADDRESS
                log_info(f"Using default wallet: {C.CYAN}{DEFAULT_USER_ADDRESS}{C.RESET}")
                print()

            if not Web3.is_address(user_input):
                print()
                log_error("Invalid Ethereum address format. Please try again.")
                time.sleep(1.5)
                print_banner()
                print_status(w3, oracle_account.address, checksum_contract)
                continue

            print()
            log_chain(f"Initiating on-chain oracle call → recordEcoAction({action_name})")
            time.sleep(0.4)
            print()

            try:
                t0 = time.time()
                tx_hex, receipt = send_eco_action(
                    w3, contract, oracle_account.address, user_input, action_type
                )
                elapsed = time.time() - t0

                sep = f"  {C.DIM}{'─' * 62}{C.RESET}"
                print()
                print(sep)

                if receipt.status == 1:
                    log_success(
                        f"Transaction confirmed on Monad in {elapsed:.1f}s!  "
                        f"Hash: {C.CYAN}{tx_hex}{C.RESET}"
                    )
                    log_success(
                        f"Block: #{receipt.blockNumber}  |  Gas Used: {receipt.gasUsed}"
                    )
                    log_success(
                        "EcoToken minted to user ✓  |  EcoProfile updated ✓"
                    )
                else:
                    log_error(f"Transaction reverted on-chain. Hash: {tx_hex}")

                print(sep)

            except ContractLogicError as exc:
                log_error(f"Contract reverted: {exc}")
            except Exception as exc:
                log_error(f"Transaction failed: {exc}")

            print()
            input(f"  {C.DIM}Press ENTER to return to main menu...{C.RESET}")
            print_banner()
            print_status(w3, oracle_account.address, checksum_contract)

        else:
            log_error("Invalid option. Please enter 1, 2, or 0.")
            time.sleep(1)
            print_banner()
            print_status(w3, oracle_account.address, checksum_contract)


if __name__ == "__main__":
    main()
