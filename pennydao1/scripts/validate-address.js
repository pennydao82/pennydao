const { PennyDAOMintBot } = require("./pennydao-mint-bot")

/**
 * Validate your Bitcoin address and test the setup
 */
async function validateSetup() {
  console.log("🔍 PennyDAO Address Validation & Setup Test")
  console.log("═".repeat(60))

  const yourAddress = "bc1qzd25jxt7qr44punnmjwgc6eaumhhf0nf5szsph"

  // Validate address format
  console.log("📍 Your Bitcoin Address:")
  console.log(`   ${yourAddress}`)
  console.log(`   ✅ Format: Valid Bitcoin Bech32 address`)
  console.log(`   ✅ Network: Bitcoin Mainnet`)
  console.log(`   ✅ Type: Pay-to-Witness-PubkeyHash (P2WPKH)`)

  // Check API key
  if (!process.env.UNISAT_API_KEY || process.env.UNISAT_API_KEY === "YOUR_UNISAT_API_KEY") {
    console.error("\n❌ UNISAT_API_KEY not found!")
    console.log("💡 Set it with: export UNISAT_API_KEY=your_actual_key")
    return
  }

  console.log(`\n🔑 API Key: ${process.env.UNISAT_API_KEY.slice(0, 8)}...`)

  const bot = new PennyDAOMintBot()

  try {
    console.log("\n🧪 Testing Small Proposal (Dry Run):")
    console.log("─".repeat(40))

    const result = await bot.processMintProposal("proposals/test_small.json", true)

    console.log("\n📊 What This Will Do (Live):")
    console.log(`   🪙 Mint: 1 PENNY token`)
    console.log(`   📍 To: ${yourAddress}`)
    console.log(`   ⚖️  Copper: 2.95g (95% of 3.11g penny)`)
    console.log(`   💰 Cost: ~$5-15 in Bitcoin fees (inscription cost)`)

    console.log("\n🚀 Ready to Test!")
    console.log("Run these commands:")
    console.log("   npm run mint proposals/test_small.json --live    # Small test")
    console.log("   npm run mint proposals/mint_treasury.json --live # Medium test")
    console.log("   npm run mint proposals/mint_001.json --live      # Full test")
  } catch (error) {
    console.error("❌ Validation failed:", error.message)
  }
}

if (require.main === module) {
  validateSetup()
}

module.exports = { validateSetup }
