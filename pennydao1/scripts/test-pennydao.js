const { PennyDAOMintBot, run } = require("./pennydao-mint-bot")

/**
 * Comprehensive test suite for PennyDAO Mint Bot
 */
async function runTests() {
  console.log("🧪 PennyDAO Mint Bot - Test Suite")
  console.log("🪙 Testing Copper Penny-Backed Token System")
  console.log("═".repeat(60))

  const bot = new PennyDAOMintBot()

  try {
    // Test 1: Single proposal dry run
    console.log("\n📋 Test 1: Single Proposal (Dry Run)")
    await run("proposals/mint_001.json", true)

    // Test 2: Batch processing dry run
    console.log("\n📋 Test 2: Batch Processing (Dry Run)")
    const results = await bot.processAllProposals(true)
    console.log(`Processed ${results.length} proposals`)

    // Test 3: Treasury statistics
    console.log("\n📋 Test 3: Treasury Statistics")
    bot.displayTreasuryInfo()

    // Test 4: Copper backing calculation
    console.log("\n📋 Test 4: Copper Backing Calculation")
    const copperInfo = bot.calculateCopperBacking(1000)
    console.log("Copper backing for 1000 tokens:", copperInfo)

    console.log("\n✅ All tests completed successfully!")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests()
}

module.exports = { runTests }
