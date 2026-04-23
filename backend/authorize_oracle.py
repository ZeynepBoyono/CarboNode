#!/usr/bin/env python3
"""
CarboNode — Oracle Yetkilendirme (Tek Seferlik Kurulum)
Bu scripti bir kez çalıştır, oracle adresini kontrata yetkilendir.
"""

import sys
import os
import ctypes

try:
    from web3 import Web3
except ImportError:
    print("\n  [ERROR] web3 kütüphanesi bulunamadı.")
    print("  Kurulum için: pip install web3\n")
    sys.exit(1)

if os.name == "nt":
    kernel32 = ctypes.windll.kernel32
    kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)

# ──────────────────────────────────────────────────────────────────────────────
#  CONFIG — CarboNode.py ile aynı değerler
# ──────────────────────────────────────────────────────────────────────────────
RPC_URL          = "https://testnet-rpc.monad.xyz"
CHAIN_ID         = 10143
PRIVATE_KEY      = "0x1fcc3ea07f3f2f79ad79c415fa86b83f4e6c9a455b7581310cc83c3403e4b67b"
CONTRACT_ADDRESS = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"

# addOracle fonksiyonu için minimal ABI
ADD_ORACLE_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "oracle", "type": "address"}],
        "name": "addOracle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "", "type": "address"}],
        "name": "isOracle",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# ──────────────────────────────────────────────────────────────────────────────

C_GREEN   = "\033[92m"
C_CYAN    = "\033[96m"
C_YELLOW  = "\033[93m"
C_RED     = "\033[91m"
C_RESET   = "\033[0m"
C_BOLD    = "\033[1m"
C_DIM     = "\033[2m"

def main():
    print(f"\n  {C_BOLD}{C_GREEN}CarboNode — Oracle Yetkilendirme{C_RESET}")
    print(f"  {C_DIM}{'─' * 50}{C_RESET}\n")

    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    if not w3.is_connected():
        print(f"  {C_RED}[HATA]{C_RESET} Monad ağına bağlanılamadı: {RPC_URL}")
        sys.exit(1)

    # Deployer cüzdanı (owner) — kontratı kim deploy ettiyse o olmalı
    owner_account  = w3.eth.account.from_key(PRIVATE_KEY)
    oracle_address = owner_account.address  # oracle = private key'den türeyen adres

    print(f"  Owner / Oracle Adresi : {C_CYAN}{oracle_address}{C_RESET}")
    print(f"  Kontrat               : {C_CYAN}{CONTRACT_ADDRESS}{C_RESET}")
    print(f"  Bakiye                : {C_GREEN}{w3.from_wei(w3.eth.get_balance(owner_account.address), 'ether'):.4f} MON{C_RESET}\n")

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=ADD_ORACLE_ABI
    )

    # Zaten yetkili mi kontrol et
    already = contract.functions.isOracle(oracle_address).call()
    if already:
        print(f"  {C_GREEN}[OK]{C_RESET} Bu adres zaten yetkili oracle. Tekrar işlem gerekmez.\n")
        sys.exit(0)

    print(f"  {C_YELLOW}[INFO]{C_RESET} Oracle henüz yetkili değil. İşlem gönderiliyor...\n")

    nonce     = w3.eth.get_transaction_count(oracle_address)
    gas_price = w3.eth.gas_price
    gas_est   = contract.functions.addOracle(oracle_address).estimate_gas(
        {"from": oracle_address}
    )

    tx = contract.functions.addOracle(oracle_address).build_transaction({
        "chainId":  CHAIN_ID,
        "from":     oracle_address,
        "nonce":    nonce,
        "gas":      gas_est + 10_000,
        "gasPrice": gas_price,
    })

    signed  = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)

    print(f"  {C_YELLOW}[BEKLE]{C_RESET} Blok onayı bekleniyor...")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)

    print()
    if receipt.status == 1:
        print(f"  {C_GREEN}[BAŞARILI]{C_RESET} Oracle yetkilendirildi!")
        print(f"  TX Hash : {C_CYAN}{tx_hash.hex()}{C_RESET}")
        print(f"  Blok    : #{receipt.blockNumber}\n")
        print(f"  Artık {C_BOLD}python CarboNode.py{C_RESET} çalıştırabilirsin.\n")
    else:
        print(f"  {C_RED}[HATA]{C_RESET} İşlem revert oldu. Hash: {tx_hash.hex()}\n")

if __name__ == "__main__":
    main()
