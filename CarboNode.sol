// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// =============================================================
// CarboNode — Sustainable Carbon Credit & Eco Incentive System
// Hackathon MVP | Monad L1 Network
// =============================================================
//
// DEPLOYMENT ORDER (important!):
//   1. Deploy EcoToken
//   2. Deploy EcoProfile
//   3. Deploy EcoTrackerCore (pass EcoToken & EcoProfile addresses)
//   4. Call EcoToken.setCoreContract(coreAddress)
//   5. Call EcoProfile.setCoreContract(coreAddress)
//   6. (Optional) Call EcoTrackerCore.addOracle(oracleAddress)
//
// OpenZeppelin v5 imports via Remix npm resolver
// =============================================================

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// =============================================================
// CONTRACT 1 — EcoToken (ERC-20)
// Kullanıcıların çevreci eylemlerinden kazandığı ödül token'ı.
// =============================================================
contract EcoToken is ERC20, Ownable {
    // Yalnızca EcoTrackerCore bu adreste mint yapabilir.
    address public coreContract;

    // Anlaşmalı yeşil işletmelerin listesi (Programmable Money vizyonu).
    mapping(address => bool) public isGreenBusiness;

    event CoreContractSet(address indexed core);
    event GreenBusinessApproved(address indexed business);
    event GreenBusinessRevoked(address indexed business);
    event SpentAtBusiness(address indexed user, address indexed business, uint256 amount);

    // Sadece CoreContract bu modifier'ı geçebilir.
    modifier onlyCore() {
        require(msg.sender == coreContract, "EcoToken: caller is not the core contract");
        _;
    }

    constructor() ERC20("EcoToken", "ECO") Ownable(msg.sender) {}

    // -------------------------------------------------------
    // setCoreContract — Sistemin ana kontratını bağlar.
    // Sadece owner (deployer) tarafından bir kez çağrılır.
    // -------------------------------------------------------
    function setCoreContract(address _core) external onlyOwner {
        require(_core != address(0), "EcoToken: zero address");
        coreContract = _core;
        emit CoreContractSet(_core);
    }

    // -------------------------------------------------------
    // mint — CoreContract kullanıcıya ödül token'ı basar.
    // Piyasaya arz yalnızca çevreci eylem karşılığında artar.
    // -------------------------------------------------------
    function mint(address to, uint256 amount) external onlyCore {
        _mint(to, amount);
    }

    // -------------------------------------------------------
    // approveGreenBusiness / revokeGreenBusiness
    // Owner, token'ın harcanabileceği yeşil işletmeleri yönetir.
    // -------------------------------------------------------
    function approveGreenBusiness(address business) external onlyOwner {
        require(business != address(0), "EcoToken: zero address");
        isGreenBusiness[business] = true;
        emit GreenBusinessApproved(business);
    }

    function revokeGreenBusiness(address business) external onlyOwner {
        isGreenBusiness[business] = false;
        emit GreenBusinessRevoked(business);
    }

    // -------------------------------------------------------
    // spendAtGreenBusiness — Programmable Money uygulama noktası.
    // Kullanıcı token'ını yalnızca onaylı yeşil işletmelerde harcar;
    // standart ERC-20 transferleri yine de serbesttir.
    // -------------------------------------------------------
    function spendAtGreenBusiness(address business, uint256 amount) external {
        require(isGreenBusiness[business], "EcoToken: not an approved green business");
        _transfer(msg.sender, business, amount);
        emit SpentAtBusiness(msg.sender, business, amount);
    }
}


// =============================================================
// CONTRACT 2 — EcoProfile (Soulbound Token / ERC-721 + ERC-5192)
// Her kullanıcıya özgü, devredilemez çevreci itibar profili.
// =============================================================
contract EcoProfile is ERC721, Ownable {
    using Strings for uint256;

    address public coreContract;
    uint256 private _nextTokenId;

    // Kullanıcı profilindeki tüm istatistikler bu struct'ta tutulur.
    struct Profile {
        uint256 totalCarbonCredits; // Toplam kazanılan karbon kredisi (çevre puanı)
        uint8   level;              // Kullanıcı seviyesi (1–10)
        uint256 actionCount;        // Toplam kayıtlı çevreci eylem sayısı
        uint256 recyclingCount;     // Yalnızca geri dönüşüm eylemleri
        uint256 transportCount;     // Yalnızca toplu taşıma eylemleri
        uint256 createdAt;          // Profil oluşturma zamanı (Unix timestamp)
    }

    // tokenId → profil verisi
    mapping(uint256 => Profile) public profiles;

    // kullanıcı adresi → tokenId (adres başına tek profil)
    mapping(address => uint256) public userToken;

    // kullanıcı adresi → profil var mı?
    mapping(address => bool) public hasProfile;

    // Seviye eşik değerleri: levelThresholds[i] → i+1. seviyeye geçiş kredisi
    uint256[10] public levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 7000, 11000, 16000];

    // ERC-5192: locked() fonksiyonu için event
    event Locked(uint256 tokenId);
    event ProfileCreated(address indexed user, uint256 indexed tokenId);
    event ProfileUpdated(address indexed user, uint256 totalCredits, uint8 newLevel);

    modifier onlyCore() {
        require(msg.sender == coreContract, "EcoProfile: caller is not the core contract");
        _;
    }

    constructor() ERC721("EcoProfile", "ECOP") Ownable(msg.sender) {}

    function setCoreContract(address _core) external onlyOwner {
        require(_core != address(0), "EcoProfile: zero address");
        coreContract = _core;
    }

    // -------------------------------------------------------
    // _update — OZ v5'te transfer/mint/burn tek noktadan geçer.
    // from == address(0) → mint (izinli)
    // to   == address(0) → burn (izinli)
    // her ikisi de dolu   → transfer (ENGELLENDİ — Soulbound)
    // -------------------------------------------------------
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        require(
            from == address(0) || to == address(0),
            "EcoProfile: token is soulbound and non-transferable"
        );
        return super._update(to, tokenId, auth);
    }

    // SBT için approve tamamen engellenir.
    function approve(address, uint256) public pure override {
        revert("EcoProfile: approvals disabled for soulbound token");
    }

    // SBT için toplu approve tamamen engellenir.
    function setApprovalForAll(address, bool) public pure override {
        revert("EcoProfile: approvals disabled for soulbound token");
    }

    // ERC-5192 arayüzü: token her zaman kilitlidir.
    function locked(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "EcoProfile: token does not exist");
        return true;
    }

    // -------------------------------------------------------
    // createProfile — CoreContract yeni kullanıcı için SBT basar.
    // Her adrese yalnızca bir kez çağrılabilir.
    // -------------------------------------------------------
    function createProfile(address user) external onlyCore returns (uint256) {
        require(!hasProfile[user], "EcoProfile: user already has a profile");

        uint256 tokenId = ++_nextTokenId;

        profiles[tokenId] = Profile({
            totalCarbonCredits: 0,
            level: 1,
            actionCount: 0,
            recyclingCount: 0,
            transportCount: 0,
            createdAt: block.timestamp
        });

        userToken[user] = tokenId;
        hasProfile[user] = true;

        _safeMint(user, tokenId);

        // ERC-5192 kilitleme event'i
        emit Locked(tokenId);
        emit ProfileCreated(user, tokenId);

        return tokenId;
    }

    // -------------------------------------------------------
    // updateProfile — Eylem kaydedildiğinde CoreContract çağırır.
    // Kredi ekler, seviyeyi yeniden hesaplar, sayaçları artırır.
    // -------------------------------------------------------
    function updateProfile(
        address user,
        uint256 creditsEarned,
        bool isRecycling
    ) external onlyCore {
        require(hasProfile[user], "EcoProfile: user has no profile");

        uint256 tokenId = userToken[user];
        Profile storage p = profiles[tokenId];

        p.totalCarbonCredits += creditsEarned;
        p.actionCount++;

        if (isRecycling) {
            p.recyclingCount++;
        } else {
            p.transportCount++;
        }

        // Seviyeyi yeni toplam krediye göre güncelle.
        p.level = _calculateLevel(p.totalCarbonCredits);

        emit ProfileUpdated(user, p.totalCarbonCredits, p.level);
    }

    // -------------------------------------------------------
    // getProfile — Herhangi bir kullanıcının profil özetini döner.
    // -------------------------------------------------------
    function getProfile(address user) external view returns (Profile memory) {
        require(hasProfile[user], "EcoProfile: no profile found");
        return profiles[userToken[user]];
    }

    // -------------------------------------------------------
    // _calculateLevel — Toplam krediye göre 1–10 arası seviye döner.
    // -------------------------------------------------------
    function _calculateLevel(uint256 totalCredits) internal view returns (uint8) {
        uint8 level = 1;
        for (uint8 i = 1; i < 10; i++) {
            if (totalCredits >= levelThresholds[i]) {
                level = i + 1;
            } else {
                break;
            }
        }
        return level;
    }

    // On-chain metadata için basit URI; gerçek projede IPFS/SVG kullanılır.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "EcoProfile: token does not exist");
        return string(abi.encodePacked(
            "https://carbonode.io/api/profile/", tokenId.toString()
        ));
    }

    // ERC-165 arayüz desteği: ERC-5192 interface ID = 0xb45a3c0e
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override
        returns (bool)
    {
        return interfaceId == 0xb45a3c0e || super.supportsInterface(interfaceId);
    }
}


// =============================================================
// CONTRACT 3 — EcoTrackerCore (Ana Mantık Kontratı)
// IoT/Oracle verilerini simüle eden merkezi orkestratör.
// EcoToken basar + EcoProfile günceller.
// =============================================================
contract EcoTrackerCore is Ownable {

    EcoToken   public ecoToken;
    EcoProfile public ecoProfile;

    // Yetkili oracle adresleri: IoT cihazı veya Chainlink Node simülasyonu.
    mapping(address => bool) public isOracle;

    // Desteklenen çevreci eylem türleri.
    enum ActionType {
        RECYCLING,        // Geri dönüşüm
        PUBLIC_TRANSPORT, // Toplu taşıma
        TREE_PLANTING,    // Ağaç dikimi
        CARPOOLING,       // Araç paylaşımı
        SOLAR_USAGE       // Güneş enerjisi kullanımı
    }

    // Eylem türüne göre token ödülü (18 ondalık basamak dahil).
    mapping(ActionType => uint256) public tokenRewards;

    // Eylem türüne göre karbon kredisi ödülü.
    mapping(ActionType => uint256) public creditRewards;

    // Kullanıcı geçmişi için hafif kayıt struct'ı.
    struct ActionRecord {
        ActionType actionType;
        uint256    timestamp;
        uint256    tokensEarned;
        uint256    creditsEarned;
    }

    // kullanıcı → eylem geçmişi dizisi
    mapping(address => ActionRecord[]) private _userActions;

    // Platforma ait küresel istatistikler (frontend/dashboard için).
    uint256 public totalActionsRecorded;
    uint256 public totalTokensMinted;
    uint256 public totalCarbonCreditsSaved;

    event OracleAdded(address indexed oracle);
    event OracleRemoved(address indexed oracle);
    event RewardsUpdated(ActionType indexed actionType, uint256 tokenReward, uint256 creditReward);
    event EcoActionRecorded(
        address    indexed user,
        ActionType indexed actionType,
        uint256    tokensEarned,
        uint256    creditsEarned,
        uint256    timestamp
    );

    // Sadece owner veya yetkili oracle çağırabilir.
    modifier onlyOracle() {
        require(
            msg.sender == owner() || isOracle[msg.sender],
            "EcoTrackerCore: not authorized"
        );
        _;
    }

    // -------------------------------------------------------
    // constructor — EcoToken ve EcoProfile adreslerini alır;
    // varsayılan ödül tablosunu başlatır.
    // -------------------------------------------------------
    constructor(address _ecoToken, address _ecoProfile) Ownable(msg.sender) {
        require(_ecoToken   != address(0), "EcoTrackerCore: invalid token address");
        require(_ecoProfile != address(0), "EcoTrackerCore: invalid profile address");

        ecoToken   = EcoToken(_ecoToken);
        ecoProfile = EcoProfile(_ecoProfile);

        // Token ödülleri (ECO, 18 ondalık)
        tokenRewards[ActionType.RECYCLING]        = 10  * 1e18;
        tokenRewards[ActionType.PUBLIC_TRANSPORT] = 5   * 1e18;
        tokenRewards[ActionType.TREE_PLANTING]    = 25  * 1e18;
        tokenRewards[ActionType.CARPOOLING]       = 8   * 1e18;
        tokenRewards[ActionType.SOLAR_USAGE]      = 15  * 1e18;

        // Karbon kredisi ödülleri (tam sayı, birimsiz)
        creditRewards[ActionType.RECYCLING]        = 10;
        creditRewards[ActionType.PUBLIC_TRANSPORT] = 5;
        creditRewards[ActionType.TREE_PLANTING]    = 25;
        creditRewards[ActionType.CARPOOLING]       = 8;
        creditRewards[ActionType.SOLAR_USAGE]      = 15;
    }

    // -------------------------------------------------------
    // addOracle / removeOracle — Yetkilendirilmiş oracle yönetimi.
    // Gerçek sistemde Chainlink Node veya güvenilir IoT backend'i.
    // -------------------------------------------------------
    function addOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "EcoTrackerCore: zero address");
        isOracle[oracle] = true;
        emit OracleAdded(oracle);
    }

    function removeOracle(address oracle) external onlyOwner {
        isOracle[oracle] = false;
        emit OracleRemoved(oracle);
    }

    // -------------------------------------------------------
    // recordEcoAction — SİSTEMİN ANA FONKSİYONU
    //
    // Akış:
    //   1. Kullanıcının profili yoksa otomatik oluştur (UX kolaylığı).
    //   2. Eylem türüne göre token miktarını ve karbon kredisini belirle.
    //   3. EcoToken.mint() ile kullanıcıya token bas.
    //   4. EcoProfile.updateProfile() ile itibar puanını güncelle.
    //   5. Kullanıcı geçmişine ve küresel istatistiklere kaydet.
    //
    // Kimin çağırabileceği: owner VEYA yetkili oracle adresi.
    // Gerçek senaryoda: IoT cihazı doğrulaması yapıldıktan sonra
    // backend oracle bu fonksiyonu imzalayarak zincire gönderir.
    // -------------------------------------------------------
    function recordEcoAction(address user, ActionType actionType) external onlyOracle {
        require(user != address(0), "EcoTrackerCore: invalid user address");

        // Yeni kullanıcı için profil otomatik açılır (gas-friendly UX).
        if (!ecoProfile.hasProfile(user)) {
            ecoProfile.createProfile(user);
        }

        uint256 tokens  = tokenRewards[actionType];
        uint256 credits = creditRewards[actionType];

        // isRecycling: EcoProfile'da geri dönüşüm sayacını ayırmak için.
        bool isRecycling = (actionType == ActionType.RECYCLING);

        // EcoToken kontratında mint yetkisi bu kontratta olduğu için çalışır.
        ecoToken.mint(user, tokens);

        // EcoProfile'daki karbon kredi puanı ve seviyesi güncellenir.
        ecoProfile.updateProfile(user, credits, isRecycling);

        // Kullanıcının kişisel eylem geçmişine ekle.
        _userActions[user].push(ActionRecord({
            actionType:   actionType,
            timestamp:    block.timestamp,
            tokensEarned: tokens,
            creditsEarned: credits
        }));

        // Küresel platform istatistiklerini güncelle.
        totalActionsRecorded++;
        totalTokensMinted      += tokens;
        totalCarbonCreditsSaved += credits;

        emit EcoActionRecorded(user, actionType, tokens, credits, block.timestamp);
    }

    // -------------------------------------------------------
    // updateRewards — Ödül miktarlarını güncellemek için.
    // Örn: yeni bir kampanya için RECYCLING ödülü artırılabilir.
    // -------------------------------------------------------
    function updateRewards(
        ActionType actionType,
        uint256 newTokenReward,
        uint256 newCreditReward
    ) external onlyOwner {
        tokenRewards[actionType]  = newTokenReward;
        creditRewards[actionType] = newCreditReward;
        emit RewardsUpdated(actionType, newTokenReward, newCreditReward);
    }

    // -------------------------------------------------------
    // getUserActionCount — Kullanıcının toplam eylem sayısını döner.
    // -------------------------------------------------------
    function getUserActionCount(address user) external view returns (uint256) {
        return _userActions[user].length;
    }

    // -------------------------------------------------------
    // getUserAction — Kullanıcının belirli bir eylem kaydını döner.
    // Frontend için sayfalama: index 0'dan başlar.
    // -------------------------------------------------------
    function getUserAction(address user, uint256 index)
        external
        view
        returns (ActionRecord memory)
    {
        require(index < _userActions[user].length, "EcoTrackerCore: index out of bounds");
        return _userActions[user][index];
    }

    // -------------------------------------------------------
    // getGlobalStats — Dashboard için platform geneli istatistik.
    // -------------------------------------------------------
    function getGlobalStats()
        external
        view
        returns (
            uint256 actions,
            uint256 tokensMinted,
            uint256 carbonCreditsSaved
        )
    {
        return (totalActionsRecorded, totalTokensMinted, totalCarbonCreditsSaved);
    }
}
