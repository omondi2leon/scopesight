/* eslint-disable */
const { execSync } = require('child_process')
const path = require('path')

exports.default = async function (context) {
  const { electronPlatformName, appOutDir } = context

  // We only run this on macOS.
  if (electronPlatformName !== 'mac') {
    return
  }

  // Find the exact path to the generated .app
  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(appOutDir, `${appName}.app`)

  try {
    console.log(`\n  • custom afterSign: forcing deep ad-hoc signature on ${appPath}`)
    // --force: replace any existing broken signatures or mismatched TeamIDs
    // --deep: recursively apply it to all internal frameworks and helpers
    // --sign -: sign with an ad-hoc (local, unsigned) identity
    execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' })
    console.log('  • custom afterSign: deep ad-hoc signature applied successfully.')
  } catch (error) {
    console.error('  • custom afterSign error:', error)
    process.exit(1)
  }
}
