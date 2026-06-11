# Disclaimer - use at your own risk

This document applies to [CDC Voucher Print](https://github.com/xieliwei/cdc_voucher_bookmarklet) (the "Software"), including any bookmarklet, release artifact, or source code in that repository.

## Inherent danger

Running a bookmarklet or third-party script on a web page gives that script the **same access you have in that browser session** on that page. On the RedeemSG voucher wallet, that can include:

- Reading voucher metadata from the page and API
- Triggering network requests using your session
- Opening new windows (for example, a print preview)

**This is always dangerous**, regardless of who published the script or how trustworthy they appear.

## AI-assisted development

This repository was **vibecoded** (built with substantial AI assistance). Treat it as experimental: review the code yourself, expect rough edges, and do not rely on it without independent verification.

## Do not blind trust

**Do not install or use this Software based on reputation alone - including if you trust the author.**

Before use you should:

1. Read the [source code](https://github.com/xieliwei/cdc_voucher_bookmarklet) for the version you intend to install.
2. Compare the release artifact (`cdc-voucher-collector.js`) against that tagged source.
3. Confirm the bookmarklet's embedded URL and SHA-384 integrity hash match the [release notes](https://github.com/xieliwei/cdc_voucher_bookmarklet/releases) for that version.
4. Prefer installing only a **specific release** you have reviewed, not a moving "latest" URL.

The version-pinned bookmarklet uses Subresource Integrity (SRI). If the release file is replaced after you install, the bookmark should **silently do nothing**. That reduces but does not eliminate risk - you are still responsible for choosing what to install.

## Secret voucher links

Your CDC voucher link contains a **secret group id**. Anyone with that link can access your vouchers. Do not share links, group ids, or API responses that contain them.

## No warranty

THE SOFTWARE IS PROVIDED **"AS IS"**, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

## Limitation of liability

TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE AUTHOR AND CONTRIBUTORS SHALL **NOT BE LIABLE** FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT, OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

This includes, without limitation, loss of vouchers, unauthorised redemption, financial loss, data exposure, printing errors, merchant scan failures, or any harm resulting from use or inability to use the Software.

## Your responsibility

You are **solely responsible** for deciding whether to use this Software and for securing your voucher links and devices.

## No affiliation

This Software is **not affiliated with, endorsed by, or supported by** RedeemSG, GovTech, the Community Development Councils, or any government agency.

## Changes

The author may update this disclaimer. The version in the repository at the tag you install applies to that release.
