const { PennyDAOMintBot } = require("./pennydao-mint-bot")

/**
 * Test the live UniSat API connection
 */
async function testLiveAPI() {
  console.log("🔑 Testing PennyDAO with Live UniSat API")
  console.log("═".repeat(50))

  // Check if API key is available
  if (!process.env.UNISAT_API_KEY || process.env.UNISAT_API_KEY === "YOUR_UNISAT_API_KEY") {
    console.error("❌ UNISAT_API_KEY not found in environment variables")
    console.log("💡 Set it with: export UNISAT_API_KEY=your_actual_key")
    return
  }

  console.log("✅ API Key found:", process.env.UNISAT_API_KEY.slice(0, 8) + "...")

  const bot = new PennyDAOMintBot()

  try {
    // First, let's do a dry run to test the logic
    console.log("\n🧪 Step 1: Dry Run Test")
    await bot.processMintProposal("proposals/mint_001.json", true)

    // Show current treasury status
    console.log("\n🏦 Current Treasury Status:")
    bot.displayTreasuryInfo()

    // Ask user if they want to proceed with live test
    console.log("\n⚠️  READY FOR LIVE TEST")
    console.log("This will make a real API call to UniSat and cost Bitcoin fees.")
    console.log("Make sure the recipient address in mint_001.json is correct!")
    console.log("\nTo proceed with live mint:")
    console.log("npm run mint proposals/mint_001.json --live")
  } catch (error) {
    console.error("❌ Test failed:", error.message)

    if (error.message.includes("401") || error.message.includes("unauthorized")) {
      console.log("💡 API key might be invalid. Check your UniSat dashboard.")
    } else if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("💡 Network issue. Check your internet connection.")
    }
  }
}

// Run the test
if (require.main === module) {
  testLiveAPI()
}

module.exports = { testLiveAPI }
