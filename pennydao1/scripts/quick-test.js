const { PennyDAOMintBot } = require("./pennydao-mint-bot")

/**
 * Quick test with your address
 */
async function quickTest() {
  console.log("⚡ PennyDAO Quick Test")
  console.log("🪙 Testing with your address: bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph")
  console.log("═".repeat(70))

  const bot = new PennyDAOMintBot()

  try {
    // Test the small proposal
    console.log("🧪 Dry Run Test:")
    await bot.processMintProposal("proposals/test_small.json", true)

    // Show treasury stats
    bot.displayTreasuryInfo()

    console.log("\n✅ Everything looks good!")
    console.log("💡 To do a real mint: npm run mint proposals/test_small.json --live")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
  }
}

if (require.main === module) {
  quickTest()
}

module.exports = { quickTest }
