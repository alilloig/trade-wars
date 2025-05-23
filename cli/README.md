# Trade Wars CLI tool

## Commands

### Publish Package

```console
$ trade-wars publish [--package-path <path>]
```
Publishes the Move package to the Sui network and automatically updates environment files with the package ID and created object IDs. By default, publishes the package in `../move` directory.

**Options:**
- `--package-path <path>`: Specify a custom path to the Move package directory (default: `../move`)

**What it does:**
- Validates the Move package structure
- Executes `sui client publish` to deploy the package
- Extracts the Package ID and created object IDs from the output
- Updates `cli/.env` with:
  - `TRADE_WARS_PKG` (Package ID)
  - `TRADE_WARS_ID` (TradeWars object)
  - `TRADE_WARS_INFO` (TradeWarsInfo object)
  - `ADM_CAP_ID` (GameAdminCap object)
  - `ERB_CAP_ID` (TreasuryCap<ERBIUM> object)
  - `LAN_CAP_ID` (TreasuryCap<LANTHANUM> object)
  - `THO_CAP_ID` (TreasuryCap<THORIUM> object)
- Updates `web/.env` with:
  - `VITE_TRADE_WARS_PKG_DEV` (Package ID)
  - `VITE_TRADE_WARS_ID_DEV` (TradeWars object)
  - `VITE_TRADE_WARS_INFO_DEV` (TradeWarsInfo object)
- Records the transaction digest in `tx-digests.json`

### Create Element Sources

```console
$ trade-wars create-sources
```
Creates the objects that mint all the resources mined by players. Needs to be run just once after the contracts have been published.

### Start a new universe

```console
$ trade-wars start-universe --name <name> --galaxies <number> --systems <number> --planets <number>
```
Creates a new game server with the specified parameters.

**Options:**
- `--name <name>`: Universe name (required)
- `--galaxies <number>`: Number of galaxies (1-255, required)
- `--systems <number>`: Number of systems (1-255, required)  
- `--planets <number>`: Number of planets (1-255, required)

### Open Universe

```console
$ trade-wars open-universe --universe-cap <id> --universe <id>
```
Opens a universe for player registration.

**Options:**
- `--universe-cap <id>`: Universe creator capability ID (required)
- `--universe <id>`: Universe ID (required)

### Close Universe

```console
$ trade-wars close-universe --universe-cap <id> --universe <id>
```
Closes a universe for player registration.

**Options:**
- `--universe-cap <id>`: Universe creator capability ID (required)
- `--universe <id>`: Universe ID (required)