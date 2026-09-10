const { expect } = require("chai");
const hre = require("hardhat");

describe("AegisBlueCarbonCredit", function () {
  let carbonCredit;
  let owner;
  let ngo;
  let nonOwner;
  const initialUri = "https://ipfs.io/ipfs/{id}.json";
  const tokenId = 1;
  const mintAmount = 5000; // 5,000 metric tons of CO2

  beforeEach(async function () {
    [owner, ngo, nonOwner] = await hre.ethers.getSigners();
    const AegisBlueCarbonCredit = await hre.ethers.getContractFactory("AegisBlueCarbonCredit");
    carbonCredit = await AegisBlueCarbonCredit.deploy(initialUri, owner.address);
    await carbonCredit.waitForDeployment();
  });

  describe("Deployment & Configuration", function () {
    it("should deploy with the correct initial owner and URI", async function () {
      expect(await carbonCredit.owner()).to.equal(owner.address);
      expect(await carbonCredit.uri(tokenId)).to.equal(initialUri);
    });
  });

  describe("Minting", function () {
    const registeredProjectId = "AEGIS-SUNDARBANS-001";
    const registeredIpfsCid = "QmZtmD2qt8STMQNd6pmm692bhTvAfDvy92qBx24qi44444";
    const registeredAuditHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MRV-AUDIT-2026"));
    const registeredTotalCredits = 10000;

    beforeEach(async function () {
      await carbonCredit.connect(owner).registerProject(
        registeredProjectId,
        registeredIpfsCid,
        registeredAuditHash,
        tokenId,
        registeredTotalCredits
      );
    });

    it("should allow the owner to mint carbon credits to a recipient after registration", async function () {
      const tx = await carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
        ngo.address,
        tokenId,
        mintAmount
      );
      await tx.wait();

      const balance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(balance).to.equal(mintAmount);
    });

    it("should reject minting when token ID corresponds to an unregistered project", async function () {
      const unregisteredTokenId = 999;
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256,bytes)"](
          ngo.address,
          unregisteredTokenId,
          mintAmount,
          "0x"
        )
      ).to.be.revertedWithCustomError(carbonCredit, "ProjectNotRegistered");
    });

    it("should reject the 3-argument mint overload when token ID corresponds to an unregistered project", async function () {
      const unregisteredTokenId = 999;
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
          ngo.address,
          unregisteredTokenId,
          mintAmount
        )
      ).to.be.revertedWithCustomError(carbonCredit, "ProjectNotRegistered");
    });

    it("should reject minting an unregistered token ID even when another project is registered", async function () {
      const differentUnregisteredTokenId = 2;
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
          ngo.address,
          differentUnregisteredTokenId,
          mintAmount
        )
      ).to.be.revertedWithCustomError(carbonCredit, "ProjectNotRegistered");
    });

    it("should emit CarbonCreditsMinted event upon successful minting", async function () {
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
          ngo.address,
          tokenId,
          mintAmount
        )
      )
        .to.emit(carbonCredit, "CarbonCreditsMinted")
        .withArgs(ngo.address, tokenId, mintAmount, owner.address);
    });

    it("should support the mint overload with custom data bytes", async function () {
      const customData = hre.ethers.toUtf8Bytes("Sundarbans Batch 2026");
      const tx = await carbonCredit.connect(owner)["mint(address,uint256,uint256,bytes)"](
        ngo.address,
        tokenId,
        mintAmount,
        customData
      );
      await tx.wait();

      const balance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(balance).to.equal(mintAmount);
    });

    it("should reject minting when caller is not the owner even if project is registered", async function () {
      await expect(
        carbonCredit.connect(nonOwner)["mint(address,uint256,uint256)"](
          ngo.address,
          tokenId,
          mintAmount
        )
      )
        .to.be.revertedWithCustomError(carbonCredit, "OwnableUnauthorizedAccount")
        .withArgs(nonOwner.address);
    });

    it("should reject minting to the zero address", async function () {
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
          hre.ethers.ZeroAddress,
          tokenId,
          mintAmount
        )
      ).to.be.revertedWithCustomError(carbonCredit, "InvalidRecipient");
    });

    it("should reject minting with zero amount", async function () {
      await expect(
        carbonCredit.connect(owner)["mint(address,uint256,uint256)"](
          ngo.address,
          tokenId,
          0
        )
      ).to.be.revertedWithCustomError(carbonCredit, "InvalidAmount");
    });

    it("should accurately accumulate recipient balances on consecutive mints", async function () {
      await carbonCredit.connect(owner)["mint(address,uint256,uint256)"](ngo.address, tokenId, 2000);
      await carbonCredit.connect(owner)["mint(address,uint256,uint256)"](ngo.address, tokenId, 3000);

      const balance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(balance).to.equal(5000);
    });
  });

  describe("Retirement (Burning)", function () {
    beforeEach(async function () {
      // Register project first so minting seed credits is permitted
      await carbonCredit.connect(owner).registerProject(
        "AEGIS-RETIREMENT-PROJECT",
        "QmRetirementIpfsCid1234567890",
        hre.ethers.keccak256(hre.ethers.toUtf8Bytes("RETIREMENT-AUDIT-HASH")),
        tokenId,
        10000
      );
      // Seed balances: 1,000 credits to owner, 2,000 credits to ngo
      await carbonCredit.connect(owner)["mint(address,uint256,uint256)"](owner.address, tokenId, 1000);
      await carbonCredit.connect(owner)["mint(address,uint256,uint256)"](ngo.address, tokenId, 2000);
    });

    it("should allow the owner to retire their own minted credits", async function () {
      const tx = await carbonCredit.connect(owner).retire(tokenId, 400);
      await tx.wait();

      const remaining = await carbonCredit.balanceOf(owner.address, tokenId);
      expect(remaining).to.equal(600);
    });

    it("should allow a non-owner/token holder to retire their own credits without requiring owner privileges", async function () {
      const tx = await carbonCredit.connect(ngo).retire(tokenId, 500);
      await tx.wait();

      const remaining = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(remaining).to.equal(1500);
    });

    it("should correctly decrease the holder's ERC-1155 balance after retirement", async function () {
      const initialBalance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(initialBalance).to.equal(2000);

      await carbonCredit.connect(ngo).retire(tokenId, 750);

      const newBalance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(newBalance).to.equal(1250);
    });

    it("should result in zero balance when retiring the full balance", async function () {
      await carbonCredit.connect(ngo).retire(tokenId, 2000);

      const remaining = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(remaining).to.equal(0);
    });

    it("should revert when attempting to retire zero amount", async function () {
      await expect(
        carbonCredit.connect(ngo).retire(tokenId, 0)
      ).to.be.revertedWithCustomError(carbonCredit, "InvalidAmount");
    });

    it("should revert when attempting to retire more credits than the caller owns", async function () {
      await expect(
        carbonCredit.connect(ngo).retire(tokenId, 2001)
      ).to.be.revertedWithCustomError(carbonCredit, "ERC1155InsufficientBalance")
        .withArgs(ngo.address, 2000, 2001, tokenId);
    });

    it("should prevent an account from retiring another user's credits", async function () {
      // nonOwner has 0 balance; attempting to retire burns from nonOwner's balance, not ngo's
      const nonOwnerBalance = await carbonCredit.balanceOf(nonOwner.address, tokenId);
      expect(nonOwnerBalance).to.equal(0);

      await expect(
        carbonCredit.connect(nonOwner).retire(tokenId, 100)
      ).to.be.revertedWithCustomError(carbonCredit, "ERC1155InsufficientBalance")
        .withArgs(nonOwner.address, 0, 100, tokenId);

      // ngo's balance must remain untouched
      const ngoBalance = await carbonCredit.balanceOf(ngo.address, tokenId);
      expect(ngoBalance).to.equal(2000);
    });

    it("should emit CarbonCreditsRetired event with correct arguments", async function () {
      await expect(carbonCredit.connect(ngo).retire(tokenId, 650))
        .to.emit(carbonCredit, "CarbonCreditsRetired")
        .withArgs(ngo.address, tokenId, 650);
    });

    it("should also emit standard ERC-1155 TransferSingle event to zero address upon burn", async function () {
      await expect(carbonCredit.connect(ngo).retire(tokenId, 300))
        .to.emit(carbonCredit, "TransferSingle")
        .withArgs(ngo.address, ngo.address, hre.ethers.ZeroAddress, tokenId, 300);
    });
  });

  describe("Project Registration & Audit Metadata", function () {
    const sampleProjectId = "AEGIS-SUNDARBANS-001";
    const sampleIpfsCid = "QmZtmD2qt8STMQNd6pmm692bhTvAfDvy92qBx24qi44444";
    const sampleAuditHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MRV-AUDIT-VERIFIED-DATA-2026"));
    const sampleTokenId = 101;
    const sampleTotalCredits = 10000;

    it("should allow the owner to register a valid project", async function () {
      const tx = await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );
      await tx.wait();

      const isRegistered = await carbonCredit.isProjectIdRegistered(sampleProjectId);
      expect(isRegistered).to.be.true;
    });

    it("should store the correct project metadata on-chain and retrieve via getProject", async function () {
      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      const project = await carbonCredit.getProject(sampleTokenId);
      expect(project.projectId).to.equal(sampleProjectId);
      expect(project.ipfsCid).to.equal(sampleIpfsCid);
      expect(project.auditHash).to.equal(sampleAuditHash);
      expect(project.tokenId).to.equal(sampleTokenId);
      expect(project.totalCredits).to.equal(sampleTotalCredits);
      expect(project.registered).to.be.true;
    });

    it("should accurately populate the projectId -> tokenId mapping", async function () {
      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      const mappedTokenId = await carbonCredit.projectIdToTokenId(sampleProjectId);
      expect(mappedTokenId).to.equal(sampleTokenId);
    });

    it("should accurately populate the tokenId -> project metadata mapping", async function () {
      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      const project = await carbonCredit.projects(sampleTokenId);
      expect(project.projectId).to.equal(sampleProjectId);
      expect(project.ipfsCid).to.equal(sampleIpfsCid);
      expect(project.auditHash).to.equal(sampleAuditHash);
      expect(project.tokenId).to.equal(sampleTokenId);
      expect(project.totalCredits).to.equal(sampleTotalCredits);
      expect(project.registered).to.be.true;
    });

    it("should reject project registration when caller is not the owner", async function () {
      await expect(
        carbonCredit.connect(nonOwner).registerProject(
          sampleProjectId,
          sampleIpfsCid,
          sampleAuditHash,
          sampleTokenId,
          sampleTotalCredits
        )
      )
        .to.be.revertedWithCustomError(carbonCredit, "OwnableUnauthorizedAccount")
        .withArgs(nonOwner.address);
    });

    it("should reject project registration with an empty projectId", async function () {
      await expect(
        carbonCredit.connect(owner).registerProject(
          "",
          sampleIpfsCid,
          sampleAuditHash,
          sampleTokenId,
          sampleTotalCredits
        )
      ).to.be.revertedWithCustomError(carbonCredit, "EmptyProjectId");
    });

    it("should reject project registration with an empty IPFS CID", async function () {
      await expect(
        carbonCredit.connect(owner).registerProject(
          sampleProjectId,
          "",
          sampleAuditHash,
          sampleTokenId,
          sampleTotalCredits
        )
      ).to.be.revertedWithCustomError(carbonCredit, "EmptyIpfsCid");
    });

    it("should reject project registration with zero tokenId", async function () {
      await expect(
        carbonCredit.connect(owner).registerProject(
          sampleProjectId,
          sampleIpfsCid,
          sampleAuditHash,
          0,
          sampleTotalCredits
        )
      ).to.be.revertedWithCustomError(carbonCredit, "InvalidTokenId");
    });

    it("should reject project registration with zero totalCredits", async function () {
      await expect(
        carbonCredit.connect(owner).registerProject(
          sampleProjectId,
          sampleIpfsCid,
          sampleAuditHash,
          sampleTokenId,
          0
        )
      ).to.be.revertedWithCustomError(carbonCredit, "InvalidTotalCredits");
    });

    it("should reject registering the same projectId more than once", async function () {
      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      await expect(
        carbonCredit.connect(owner).registerProject(
          sampleProjectId,
          "QmDifferentCid1234567890",
          sampleAuditHash,
          102,
          5000
        )
      ).to.be.revertedWithCustomError(carbonCredit, "ProjectAlreadyRegistered");
    });

    it("should reject registering an already-registered tokenId for a different project", async function () {
      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      await expect(
        carbonCredit.connect(owner).registerProject(
          "AEGIS-GULF-MANNAR-002",
          "QmDifferentCid1234567890",
          sampleAuditHash,
          sampleTokenId,
          5000
        )
      ).to.be.revertedWithCustomError(carbonCredit, "TokenIdAlreadyRegistered");
    });

    it("should emit ProjectRegistered event with exact parameters", async function () {
      await expect(
        carbonCredit.connect(owner).registerProject(
          sampleProjectId,
          sampleIpfsCid,
          sampleAuditHash,
          sampleTokenId,
          sampleTotalCredits
        )
      )
        .to.emit(carbonCredit, "ProjectRegistered")
        .withArgs(
          sampleTokenId,
          sampleProjectId,
          sampleIpfsCid,
          sampleAuditHash,
          sampleTotalCredits
        );
    });

    it("should allow registering multiple distinct projects with unique tokenIds", async function () {
      const project2Id = "AEGIS-CHILIKA-002";
      const project2Cid = "QmChilikaLakeAuditReportDossierCid987654321";
      const project2Hash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("CHILIKA-AUDIT-2026"));
      const project2TokenId = 102;
      const project2Credits = 7500;

      await carbonCredit.connect(owner).registerProject(
        sampleProjectId,
        sampleIpfsCid,
        sampleAuditHash,
        sampleTokenId,
        sampleTotalCredits
      );

      await carbonCredit.connect(owner).registerProject(
        project2Id,
        project2Cid,
        project2Hash,
        project2TokenId,
        project2Credits
      );

      const p1 = await carbonCredit.getProject(sampleTokenId);
      const p2 = await carbonCredit.getProject(project2TokenId);

      expect(p1.projectId).to.equal(sampleProjectId);
      expect(p2.projectId).to.equal(project2Id);
      expect(await carbonCredit.projectIdToTokenId(sampleProjectId)).to.equal(sampleTokenId);
      expect(await carbonCredit.projectIdToTokenId(project2Id)).to.equal(project2TokenId);
    });

    it("should return registered as false for an unregistered tokenId", async function () {
      const unregistered = await carbonCredit.getProject(999);
      expect(unregistered.registered).to.be.false;
      expect(unregistered.totalCredits).to.equal(0);
      expect(unregistered.projectId).to.equal("");
    });
  });
});
