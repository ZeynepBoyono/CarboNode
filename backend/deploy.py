#!/usr/bin/env python3
"""
CarboNode — Monad Testnet Otomatik Deploy Script
  1. OpenZeppelin kontratlarını kurar (npm)
  2. CarboNode.sol'u derler (py-solc-x)
  3. EcoToken → EcoProfile → EcoTrackerCore sırasıyla deploy eder
  4. setCoreContract + addOracle çağrılarını yapar
  5. CarboNode.py'daki CONTRACT_ADDRESS'i otomatik günceller
"""

import subprocess
import sys
import os
import json
import re
import time
import ctypes

# ── UTF-8 stdout (Windows terminal encoding fix) ──────────────────────────────
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# ── Windows ANSI renk desteği ─────────────────────────────────────────────────
if os.name == "nt":
    ctypes.windll.kernel32.SetConsoleMode(ctypes.windll.kernel32.GetStdHandle(-11), 7)

# ── Renk sabitleri ─────────────────────────────────────────────────────────────
G  = "\033[92m"
C  = "\033[96m"
Y  = "\033[93m"
R  = "\033[91m"
B  = "\033[1m"
D  = "\033[2m"
RS = "\033[0m"

def ok(msg):    print(f"  {G}[OK]{RS}   {msg}")
def info(msg):  print(f"  {C}[..]{RS}   {msg}")
def warn(msg):  print(f"  {Y}[!!]{RS}   {msg}")
def fail(msg):  print(f"\n  {R}[ERR] {msg}{RS}\n"); sys.exit(1)
def sep():      print(f"  {'─' * 58}")

# ── Bağımlılık auto-install ───────────────────────────────────────────────────
def ensure_pip(pkg, import_name=None):
    name = import_name or pkg.replace("-", "_")
    try:
        __import__(name)
    except ImportError:
        print(f"  [..] pip install {pkg} ...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", pkg, "-q"])

ensure_pip("web3")
ensure_pip("py-solc-x", "solcx")

from web3 import Web3
import solcx

# ── CONFIG ────────────────────────────────────────────────────────────────────
RPC_URL     = "https://testnet-rpc.monad.xyz"
CHAIN_ID    = 10143
PRIVATE_KEY = "0x1fcc3ea07f3f2f79ad79c415fa86b83f4e6c9a455b7581310cc83c3403e4b67b"

BASE_DIR       = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR       = os.path.dirname(BASE_DIR)
SOL_FILE       = os.path.join(ROOT_DIR, "CarboNode.sol")
CARBONODE_PY   = os.path.join(BASE_DIR, "CarboNode.py")
NODE_MODULES   = os.path.join(BASE_DIR, "node_modules")
OZ_DIR         = os.path.join(NODE_MODULES, "@openzeppelin")

# ── ADIM 1: OpenZeppelin kur ──────────────────────────────────────────────────
def ensure_openzeppelin():
    if os.path.isdir(OZ_DIR):
        ok("OpenZeppelin contracts mevcut.")
        return

    info("npm ile @openzeppelin/contracts kuruluyor...")
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    result = subprocess.run(
        [npm_cmd, "install", "@openzeppelin/contracts@5.0.2", "--prefix", BASE_DIR],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        fail(
            "npm install başarısız. Node.js kurulu mu?\n"
            "  https://nodejs.org/en/download adresinden Node.js'i kur, "
            "ardından bu scripti tekrar çalıştır.\n"
            f"  Hata: {result.stderr[:300]}"
        )
    ok("OpenZeppelin kuruldu.")


# ── ADIM 2a: Tüm import kaynaklarını recursive yükle ─────────────────────────
def load_all_sources(sol_file: str) -> dict:
    """
    Tüm kaynak dosyaları (OZ dahil) inline yükler.
    Göreli importları key'e göre normalize eder — solc remapping gerekmez.
    """
    sources: dict = {}
    IMPORT_RE = re.compile(r'import\s+(?:\{[^}]*\}\s+from\s+|)["\']([^"\']+)["\']')

    def resolve_key(current_key: str, imp: str) -> str:
        """Göreli import path'ini current_key'e göre absolute key'e çevirir."""
        parts = current_key.split("/")[:-1] + imp.split("/")
        out: list = []
        for p in parts:
            if p == "..":
                if out:
                    out.pop()
            elif p and p != ".":
                out.append(p)
        return "/".join(out)

    def add(abs_path: str, key: str):
        if key in sources:
            return
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        sources[key] = {"content": content}

        for m in IMPORT_RE.finditer(content):
            imp = m.group(1)
            if imp.startswith("@openzeppelin/"):
                child_key = imp
                child_abs = os.path.join(NODE_MODULES, imp.replace("/", os.sep))
            else:
                child_key = resolve_key(key, imp)
                child_abs = os.path.normpath(
                    os.path.join(os.path.dirname(abs_path), imp.replace("/", os.sep))
                )
            add(child_abs, child_key)

    add(sol_file, "CarboNode.sol")
    return sources


# ── ADIM 2b: Derle ───────────────────────────────────────────────────────────
def compile_contracts():
    info("solc 0.8.24 kuruluyor / kontrol ediliyor...")
    solcx.install_solc("0.8.24", show_progress=False)
    solcx.set_solc_version("0.8.24")
    ok("solc 0.8.24 hazir.")

    info("Kaynak dosyalar yukleniyor...")
    sources = load_all_sources(SOL_FILE)
    ok(f"{len(sources)} kaynak dosya yuklendi.")

    info("CarboNode.sol derleniyor...")
    try:
        result = solcx.compile_standard(
            {
                "language": "Solidity",
                "sources": sources,
                "settings": {
                    "optimizer": {"enabled": True, "runs": 200},
                    "outputSelection": {
                        "*": {"*": ["abi", "evm.bytecode"]}
                    }
                }
            }
        )
    except solcx.exceptions.SolcError as e:
        fail(f"Derleme hatasi:\n{e}")

    ok("Derleme basarili.")
    return result["contracts"]["CarboNode.sol"]


# ── ADIM 3: Tek kontrat deploy ────────────────────────────────────────────────
def deploy_one(w3, deployer, abi, bytecode, label, *args):
    info(f"{label} deploy ediliyor...")
    factory = w3.eth.contract(abi=abi, bytecode=bytecode)
    nonce   = w3.eth.get_transaction_count(deployer.address)

    build_tx = factory.constructor(*args).build_transaction({
        "chainId":  CHAIN_ID,
        "from":     deployer.address,
        "nonce":    nonce,
        "gasPrice": w3.eth.gas_price,
    })
    build_tx["gas"] = w3.eth.estimate_gas(build_tx) + 60_000

    signed  = w3.eth.account.sign_transaction(build_tx, deployer.key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status != 1:
        fail(f"{label} deploy revert etti. Tx: {tx_hash.hex()}")

    addr = receipt.contractAddress
    ok(f"{label:<20} → {C}{addr}{RS}  (block #{receipt.blockNumber})")
    return addr


# ── ADIM 4: Kontrat fonksiyon çağrısı ─────────────────────────────────────────
def send_tx(w3, deployer, contract, fn_name, *args):
    fn    = getattr(contract.functions, fn_name)
    nonce = w3.eth.get_transaction_count(deployer.address)

    build_tx = fn(*args).build_transaction({
        "chainId":  CHAIN_ID,
        "from":     deployer.address,
        "nonce":    nonce,
        "gasPrice": w3.eth.gas_price,
    })
    build_tx["gas"] = w3.eth.estimate_gas(build_tx) + 30_000

    signed  = w3.eth.account.sign_transaction(build_tx, deployer.key)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)

    if receipt.status != 1:
        fail(f"{fn_name}() revert etti. Tx: {tx_hash.hex()}")
    return receipt


# ── ADIM 5: CarboNode.py'ı güncelle ──────────────────────────────────────────
def patch_carbonode_py(new_address):
    with open(CARBONODE_PY, "r", encoding="utf-8") as f:
        text = f.read()

    patched = re.sub(
        r'(CONTRACT_ADDRESS\s*=\s*")[^"]*(")',
        rf'\g<1>{new_address}\g<2>',
        text
    )

    with open(CARBONODE_PY, "w", encoding="utf-8") as f:
        f.write(patched)

    ok(f"CarboNode.py güncellendi → CONTRACT_ADDRESS = {new_address}")


# ── MAIN ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{B}{G}  CarboNode — Monad Testnet Deploy{RS}\n")
    sep()

    # Bağlantı
    info("Monad Testnet'e bağlanılıyor...")
    w3 = Web3(Web3.HTTPProvider(RPC_URL, request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        fail("RPC bağlantısı kurulamadı. İnternet bağlantını kontrol et.")

    ok(f"Bağlandı. Chain ID: {w3.eth.chain_id}")

    deployer = w3.eth.account.from_key(PRIVATE_KEY)
    balance  = w3.from_wei(w3.eth.get_balance(deployer.address), "ether")
    ok(f"Cüzdan  : {deployer.address}")
    ok(f"Bakiye  : {G}{balance:.4f} MON{RS}")

    if balance < 0.005:
        fail(
            "Yetersiz bakiye. En az 0.005 MON gerekli.\n"
            "  Faucet: https://faucet.monad.xyz"
        )

    sep()

    # Derleme
    ensure_openzeppelin()
    compiled = compile_contracts()

    eco_token_abi  = compiled["EcoToken"]["abi"]
    eco_token_bc   = compiled["EcoToken"]["evm"]["bytecode"]["object"]
    eco_profile_abi = compiled["EcoProfile"]["abi"]
    eco_profile_bc  = compiled["EcoProfile"]["evm"]["bytecode"]["object"]
    eco_core_abi   = compiled["EcoTrackerCore"]["abi"]
    eco_core_bc    = compiled["EcoTrackerCore"]["evm"]["bytecode"]["object"]

    sep()
    print(f"  {B}Deploy sırası başlıyor...{RS}\n")

    # 1. EcoToken
    eco_token_addr = deploy_one(w3, deployer, eco_token_abi, eco_token_bc, "EcoToken")
    time.sleep(2)

    # 2. EcoProfile
    eco_profile_addr = deploy_one(w3, deployer, eco_profile_abi, eco_profile_bc, "EcoProfile")
    time.sleep(2)

    # 3. EcoTrackerCore (token + profile adreslerini constructor'a ver)
    eco_core_addr = deploy_one(
        w3, deployer, eco_core_abi, eco_core_bc, "EcoTrackerCore",
        Web3.to_checksum_address(eco_token_addr),
        Web3.to_checksum_address(eco_profile_addr)
    )
    time.sleep(2)

    sep()
    print(f"  {B}Kontratlar birbirine bağlanıyor...{RS}\n")

    # 4. EcoToken.setCoreContract(coreAddress)
    eco_token_c = w3.eth.contract(
        address=Web3.to_checksum_address(eco_token_addr), abi=eco_token_abi
    )
    send_tx(w3, deployer, eco_token_c, "setCoreContract",
            Web3.to_checksum_address(eco_core_addr))
    ok("EcoToken.setCoreContract    ✓")
    time.sleep(2)

    # 5. EcoProfile.setCoreContract(coreAddress)
    eco_profile_c = w3.eth.contract(
        address=Web3.to_checksum_address(eco_profile_addr), abi=eco_profile_abi
    )
    send_tx(w3, deployer, eco_profile_c, "setCoreContract",
            Web3.to_checksum_address(eco_core_addr))
    ok("EcoProfile.setCoreContract  ✓")
    time.sleep(2)

    # 6. EcoTrackerCore.addOracle(deployerAddress)
    eco_core_c = w3.eth.contract(
        address=Web3.to_checksum_address(eco_core_addr), abi=eco_core_abi
    )
    send_tx(w3, deployer, eco_core_c, "addOracle", deployer.address)
    ok(f"addOracle({deployer.address[:10]}...)  ✓")
    time.sleep(1)

    sep()
    print(f"  {B}CarboNode.py güncelleniyor...{RS}\n")
    patch_carbonode_py(eco_core_addr)

    sep()
    print(f"""
  {B}{G}  DEPLOYMENT TAMAMLANDI!{RS}

  {B}EcoToken      :{RS} {C}{eco_token_addr}{RS}
  {B}EcoProfile    :{RS} {C}{eco_profile_addr}{RS}
  {B}EcoTrackerCore:{RS} {C}{eco_core_addr}{RS}

  {Y}Şimdi şunu çalıştır:{RS}
    python CarboNode.py
""")


if __name__ == "__main__":
    main()
