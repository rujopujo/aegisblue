// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AegisBlueCarbonCredit
 * @notice ERC-1155 smart contract for the AegisBlue Blue Carbon Registry.
 * @dev Inherits OpenZeppelin ERC1155 and Ownable for administrative access control.
 */
contract AegisBlueCarbonCredit is ERC1155, Ownable {
    // Custom errors
    error InvalidRecipient();
    error InvalidAmount();
    error EmptyProjectId();
    error EmptyIpfsCid();
    error InvalidTokenId();
    error InvalidTotalCredits();
    error ProjectAlreadyRegistered();
    error TokenIdAlreadyRegistered();
    error ProjectNotRegistered();

    /**
     * @notice Project metadata structure linking an on-chain token ID to off-chain MRV audit evidence.
     * @param projectId Human-readable project identifier (e.g., "AEGIS-SUNDARBANS-001").
     * @param ipfsCid IPFS CID pointing to the immutable MRV audit dossier / metadata JSON.
     * @param auditHash Cryptographic hash (e.g., SHA-256 or Keccak-256) of the MRV audit report.
     * @param tokenId The ERC-1155 token identifier representing this project's carbon credits.
     * @param totalCredits Total number of verified metric tons (credits) approved for the project.
     * @param registered Flag indicating whether this project has been formally registered.
     */
    struct ProjectMetadata {
        string projectId;
        string ipfsCid;
        bytes32 auditHash;
        uint256 tokenId;
        uint256 totalCredits;
        bool registered;
    }

    // Mapping from tokenId to its corresponding ProjectMetadata
    mapping(uint256 => ProjectMetadata) public projects;

    // Mapping from projectId to its associated tokenId
    mapping(string => uint256) public projectIdToTokenId;

    // Mapping to track registered project IDs to prevent duplicates
    mapping(string => bool) public isProjectIdRegistered;

    // Event emitted when a new project and its MRV audit metadata are registered
    event ProjectRegistered(
        uint256 indexed tokenId,
        string projectId,
        string ipfsCid,
        bytes32 auditHash,
        uint256 totalCredits
    );

    // Event emitted when carbon credits are minted
    event CarbonCreditsMinted(
        address indexed recipient,
        uint256 indexed tokenId,
        uint256 amount,
        address indexed minter
    );

    // Event emitted when carbon credits are retired (burned)
    event CarbonCreditsRetired(
        address indexed account,
        uint256 indexed tokenId,
        uint256 amount
    );

    /**
     * @notice Initializes the ERC-1155 multi-token contract and designates the initial owner.
     * @param uri_ Base metadata URI template for token types.
     * @param initialOwner Address to be granted contract ownership.
     */
    constructor(
        string memory uri_,
        address initialOwner
    ) ERC1155(uri_) Ownable(initialOwner) {}

    /**
     * @notice Registers a blue carbon project and associates its MRV audit metadata with a token ID.
     * @dev Restricted to the contract owner. Does NOT mint tokens; minting is handled separately.
     * @param projectId Unique human-readable identifier for the carbon project.
     * @param ipfsCid IPFS CID referencing the off-chain MRV audit dossier.
     * @param auditHash Cryptographic hash of the verified MRV audit result.
     * @param tokenId The unique ERC-1155 token ID representing this project.
     * @param totalCredits Total quantity of verified metric tons of CO2 for this project.
     */
    function registerProject(
        string memory projectId,
        string memory ipfsCid,
        bytes32 auditHash,
        uint256 tokenId,
        uint256 totalCredits
    ) external onlyOwner {
        if (bytes(projectId).length == 0) {
            revert EmptyProjectId();
        }
        if (bytes(ipfsCid).length == 0) {
            revert EmptyIpfsCid();
        }
        if (tokenId == 0) {
            revert InvalidTokenId();
        }
        if (totalCredits == 0) {
            revert InvalidTotalCredits();
        }
        if (isProjectIdRegistered[projectId]) {
            revert ProjectAlreadyRegistered();
        }
        if (projects[tokenId].registered) {
            revert TokenIdAlreadyRegistered();
        }

        projects[tokenId] = ProjectMetadata({
            projectId: projectId,
            ipfsCid: ipfsCid,
            auditHash: auditHash,
            tokenId: tokenId,
            totalCredits: totalCredits,
            registered: true
        });

        projectIdToTokenId[projectId] = tokenId;
        isProjectIdRegistered[projectId] = true;

        emit ProjectRegistered(tokenId, projectId, ipfsCid, auditHash, totalCredits);
    }

    /**
     * @notice Convenience getter to retrieve the full ProjectMetadata struct for a given token ID.
     * @param tokenId The ERC-1155 token identifier.
     * @return The ProjectMetadata struct corresponding to the token ID.
     */
    function getProject(uint256 tokenId) external view returns (ProjectMetadata memory) {
        return projects[tokenId];
    }

    /**
     * @notice Mints a specified quantity of a blue carbon credit token ID to a recipient address.
     * @dev Restricted to the contract owner. Uses OpenZeppelin's internal _mint function.
     * @param recipient The address receiving the minted carbon credit tokens.
     * @param tokenId The ERC-1155 token identifier representing the carbon project/vintage.
     * @param amount The quantity of credits to mint (1 token = 1 metric ton of CO2).
     * @param data Additional arbitrary data passed to receiver contracts.
     */
    function mint(
        address recipient,
        uint256 tokenId,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        if (!projects[tokenId].registered) {
            revert ProjectNotRegistered();
        }
        if (recipient == address(0)) {
            revert InvalidRecipient();
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        _mint(recipient, tokenId, amount, data);

        emit CarbonCreditsMinted(recipient, tokenId, amount, _msgSender());
    }

    /**
     * @notice Overload of mint without additional data parameter.
     * @param recipient The address receiving the minted carbon credit tokens.
     * @param tokenId The ERC-1155 token identifier representing the carbon project/vintage.
     * @param amount The quantity of credits to mint.
     */
    function mint(
        address recipient,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        mint(recipient, tokenId, amount, "");
    }

    /**
     * @notice Permanently retires (burns) a specified amount of carbon credits owned by the caller.
     * @dev Irrevocably removes credits from circulation. Operates strictly on caller's balance.
     * @param tokenId The ERC-1155 token identifier representing the carbon credit project.
     * @param amount The quantity of carbon credits to permanently retire.
     */
    function retire(uint256 tokenId, uint256 amount) external {
        if (amount == 0) {
            revert InvalidAmount();
        }

        _burn(_msgSender(), tokenId, amount);

        emit CarbonCreditsRetired(_msgSender(), tokenId, amount);
    }
}
