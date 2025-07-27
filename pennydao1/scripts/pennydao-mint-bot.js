const fs = require("fs").promises
const path = require("path")
const axios = require("axios")

// PennyDAO Configuration
const CONFIG = {
  UNISAT_API_KEY: process.env.UNISAT_API_KEY, // Your API key is now available!
  UNISAT_API_URL: "https://api.unisat.io/v1/inscribe",
  PROPOSALS_DIR: "./proposals",
  LOG_FILE: "./mint_log.json",
  PENNY_TOKEN: "PENNY",
  COPPER_RATIO: 0.95,
}

/**
 * PennyDAO Mint Bot - Manages copper penny-backed BRC-20 token minting
 *
 * This system creates a stable asset backed by the intrinsic value of
 * pre-1982 copper pennies held in the PennyDAO treasury.
 */
class PennyDAOMintBot {
  constructor() {
    this.mintLog = []
    this.loadMintLog()
  }

  /**
   * Load existing mint log
   */
  async loadMintLog() {
    try {
      const logData = await fs.readFile(CONFIG.LOG_FILE, "utf8")
      this.mintLog = JSON.parse(logData)
      console.log(`📋 Loaded ${this.mintLog.length} previous mint operations`)
    } catch (error) {
      console.log("📋 Starting with empty mint log")
      this.mintLog = []
    }
  }

  /**
   * Save mint log to file
   */
  async saveMintLog() {
    try {
      await fs.writeFile(CONFIG.LOG_FILE, JSON.stringify(this.mintLog, null, 2))
      console.log(`💾 Mint log saved with ${this.mintLog.length} entries`)
    } catch (error) {
      console.error("❌ Failed to save mint log:", error.message)
    }
  }

  /**
   * Read and validate a PennyDAO proposal
   * @param {string} proposalPath - Path to the proposal file
   * @returns {Object} Validated proposal
   */
  async readProposal(proposalPath) {
    try {
      const data = await fs.readFile(proposalPath, "utf8")
      const proposal = JSON.parse(data)

      // Validate PennyDAO proposal format
      if (!this.isValidPennyDAOProposal(proposal)) {
        throw new Error("Invalid PennyDAO proposal format")
      }

      console.log(`📄 Loaded proposal: ${proposal.id} - ${proposal.amount} ${proposal.token} tokens`)
      return proposal
    } catch (error) {
      throw new Error(`Failed to read proposal: ${error.message}`)
    }
  }

  /**
   * Validate PennyDAO proposal structure
   * @param {Object} proposal - The proposal to validate
   * @returns {boolean} Whether the proposal is valid
   */
  isValidPennyDAOProposal(proposal) {
    const required = ["id", "type", "token", "amount", "to"]
    const hasAllFields = required.every((field) => proposal[field])

    const isValidType = proposal.type === "mint"
    const isValidAddress = proposal.to && proposal.to.startsWith("bc1")
    const isValidAmount = proposal.amount && !isNaN(Number(proposal.amount))

    if (!hasAllFields) {
      console.error(
        "❌ Missing required fields:",
        required.filter((f) => !proposal[f]),
      )
    }

    return hasAllFields && isValidType && isValidAddress && isValidAmount
  }

  /**
   * Calculate copper backing value for transparency
   * @param {number} amount - Number of tokens to mint
   * @returns {Object} Copper backing information
   */
  calculateCopperBacking(amount) {
    const copperWeight = amount * 3.11 * CONFIG.COPPER_RATIO // grams of copper
    const copperOunces = copperWeight / 28.35 // troy ounces

    return {
      totalPennies: amount,
      copperWeight: Math.round(copperWeight * 100) / 100,
      copperOunces: Math.round(copperOunces * 1000) / 1000,
      intrinsicValue: `Backed by ${amount} pre-1982 copper pennies`,
    }
  }

  /**
   * Create BRC-20 mint inscription via UniSat API
   * @param {Object} proposal - The mint proposal
   * @param {boolean} dryRun - Whether to simulate the API call
   * @returns {Object} API response or simulated response
   */
  async createMintInscription(proposal, dryRun = false) {
    // Calculate copper backing for logging
    const copperInfo = this.calculateCopperBacking(Number(proposal.amount))

    console.log(`🪙 PennyDAO Mint Request:`)
    console.log(`   Token: ${proposal.token}`)
    console.log(`   Amount: ${proposal.amount}`)
    console.log(`   ${copperInfo.intrinsicValue}`)
    console.log(`   Copper Weight: ${copperInfo.copperWeight}g`)

    // Format the BRC-20 mint content
    const mintContent = JSON.stringify({
      p: "brc-20",
      op: "mint",
      tick: proposal.token,
      amt: proposal.amount,
    })

    const payload = {
      address: proposal.to,
      content: mintContent,
      content_type: "application/json",
    }

    if (dryRun) {
      console.log("🧪 DRY RUN - Would send to UniSat:", payload)
      return {
        success: true,
        dryRun: true,
        txid: `dry-run-${Date.now()}`,
        inscriptionId: `dry-run-inscription-${Date.now()}`,
        copperBacking: copperInfo,
      }
    }

    try {
      console.log("🚀 Calling UniSat API...")
      const response = await axios.post(CONFIG.UNISAT_API_URL, payload, {
        headers: {
          Authorization: `Bearer ${CONFIG.UNISAT_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30 second timeout
      })

      console.log("✅ UniSat API response received")
      return {
        ...response.data,
        copperBacking: copperInfo,
      }
    } catch (error) {
      console.error("❌ UniSat API Error:", error.response?.data || error.message)
      throw new Error(`UniSat API error: ${error.message}`)
    }
  }

  /**
   * Log mint result to the mint log
   * @param {Object} proposal - The proposal
   * @param {Object} result - The API response
   */
  async logMintResult(proposal, result) {
    const logEntry = {
      proposalId: proposal.id,
      token: proposal.token,
      amount: proposal.amount,
      to: proposal.to,
      txid: result.txid,
      inscriptionId: result.inscriptionId,
      status: result.dryRun ? "simulated" : "submitted",
      timestamp: new Date().toISOString(),
      copperBacking: result.copperBacking,
      pennyDAOTreasury: {
        penniesAdded: Number(proposal.amount),
        copperWeight: result.copperBacking.copperWeight,
        note: "Pre-1982 copper pennies added to treasury",
      },
    }

    this.mintLog.push(logEntry)
    await this.saveMintLog()

    console.log(`📝 Logged mint operation for proposal ${proposal.id}`)
    return logEntry
  }

  /**
   * Process a single PennyDAO mint proposal
   * @param {string} proposalPath - Path to the proposal file
   * @param {boolean} dryRun - Whether to simulate the operation
   * @returns {Promise<Object>} Result of the mint operation
   */
  async processMintProposal(proposalPath, dryRun = false) {
    try {
      console.log(`\n🏛️  PennyDAO Mint Bot - Processing Proposal`)
      console.log(`📁 Proposal: ${proposalPath}`)
      console.log(`🧪 Mode: ${dryRun ? "DRY RUN" : "LIVE MINT"}`)
      console.log("─".repeat(50))

      // Read and validate proposal
      const proposal = await this.readProposal(proposalPath)

      // Create inscription
      const result = await this.createMintInscription(proposal, dryRun)

      // Log result
      const logEntry = await this.logMintResult(proposal, result)

      console.log("\n✅ PennyDAO Mint Completed Successfully!")
      console.log(`🪙 Minted: ${proposal.amount} ${proposal.token} tokens`)
      console.log(`🔗 Transaction: ${result.txid}`)
      if (result.inscriptionId) {
        console.log(`📜 Inscription: ${result.inscriptionId}`)
      }
      console.log(`🏦 Treasury: +${proposal.amount} copper pennies`)

      return {
        success: true,
        proposal,
        result,
        logEntry,
      }
    } catch (error) {
      console.error(`\n❌ PennyDAO Mint Failed: ${error.message}`)
      throw error
    }
  }

  /**
   * Process all approved proposals in the proposals directory
   * @param {boolean} dryRun - Whether to simulate operations
   * @returns {Promise<Array>} Results of all operations
   */
  async processAllProposals(dryRun = false) {
    try {
      console.log(`\n🏛️  PennyDAO Batch Processing`)
      console.log(`📁 Scanning: ${CONFIG.PROPOSALS_DIR}`)

      const files = await fs.readdir(CONFIG.PROPOSALS_DIR)
      const jsonFiles = files.filter((file) => path.extname(file) === ".json")

      console.log(`📄 Found ${jsonFiles.length} proposal files`)

      const results = []

      for (const file of jsonFiles) {
        const proposalPath = path.join(CONFIG.PROPOSALS_DIR, file)
        try {
          const result = await this.processMintProposal(proposalPath, dryRun)
          results.push(result)
        } catch (error) {
          results.push({
            success: false,
            file,
            error: error.message,
          })
        }
      }

      // Summary
      const successful = results.filter((r) => r.success).length
      const failed = results.length - successful

      console.log(`\n📊 PennyDAO Batch Summary:`)
      console.log(`✅ Successful: ${successful}`)
      console.log(`❌ Failed: ${failed}`)

      return results
    } catch (error) {
      throw new Error(`Failed to process proposals: ${error.message}`)
    }
  }

  /**
   * Get treasury statistics
   * @returns {Object} Treasury information
   */
  getTreasuryStats() {
    const successfulMints = this.mintLog.filter((log) => log.status === "submitted")
    const totalPennies = successfulMints.reduce((sum, log) => sum + Number(log.amount), 0)
    const totalCopper = successfulMints.reduce((sum, log) => sum + (log.copperBacking?.copperWeight || 0), 0)

    return {
      totalMints: this.mintLog.length,
      successfulMints: successfulMints.length,
      totalPenniesInTreasury: totalPennies,
      totalCopperWeight: Math.round(totalCopper * 100) / 100,
      totalCopperOunces: Math.round((totalCopper / 28.35) * 1000) / 1000,
      lastMint: this.mintLog.length > 0 ? this.mintLog[this.mintLog.length - 1].timestamp : null,
    }
  }

  /**
   * Display treasury information
   */
  displayTreasuryInfo() {
    const stats = this.getTreasuryStats()

    console.log("\n🏦 PennyDAO Treasury Status:")
    console.log("─".repeat(40))
    console.log(`🪙 Total Pennies: ${stats.totalPenniesInTreasury.toLocaleString()}`)
    console.log(`⚖️  Copper Weight: ${stats.totalCopperWeight}g`)
    console.log(`🥉 Copper Ounces: ${stats.totalCopperOunces} oz`)
    console.log(`📊 Total Mints: ${stats.totalMints}`)
    console.log(`✅ Successful: ${stats.successfulMints}`)
    if (stats.lastMint) {
      console.log(`📅 Last Mint: ${new Date(stats.lastMint).toLocaleString()}`)
    }
    console.log("─".repeat(40))
  }
}

/**
 * Manual test function for PennyDAO
 * @param {string} proposalPath - Path to test proposal
 * @param {boolean} dryRun - Whether to simulate
 */
async function run(proposalPath = "proposals/mint_001.json", dryRun = true) {
  console.log("🚀 PennyDAO Mint Bot - Manual Test")
  console.log("🪙 Copper Penny-Backed Token System")
  console.log("═".repeat(60))

  const bot = new PennyDAOMintBot()

  try {
    // Display current treasury status
    bot.displayTreasuryInfo()

    // Process the proposal
    await bot.processMintProposal(proposalPath, dryRun)

    // Display updated treasury status
    console.log("\n📈 Updated Treasury:")
    bot.displayTreasuryInfo()
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Export for use as module
module.exports = {
  PennyDAOMintBot,
  run,
  CONFIG,
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const dryRun = !args.includes("--live")
  const proposalPath = args.find((arg) => !arg.startsWith("--")) || "proposals/mint_001.json"

  if (args.includes("--batch")) {
    // Process all proposals
    const bot = new PennyDAOMintBot()
    bot
      .processAllProposals(dryRun)
      .then((results) => {
        console.log("\n🎉 Batch processing completed")
        process.exit(0)
      })
      .catch((error) => {
        console.error("❌ Batch processing failed:", error.message)
        process.exit(1)
      })
  } else {
    // Process single proposal
    run(proposalPath, dryRun)
      .then(() => {
        console.log("\n🎉 Manual test completed")
        process.exit(0)
      })
      .catch(() => {
        process.exit(1)
      })
  }
}
