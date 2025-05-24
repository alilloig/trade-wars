# Trade Wars CLI tool

## Quick Start

To set up and start a new Trade Wars game, run these commands in order:

```console
$ trade-wars publish
$ trade-wars create-sources
$ trade-wars start-universe
$ trade-wars refill-sources
```

This will:
1. Deploy the Move contracts to the blockchain
2. Create the main element sources for mining resources
3. Start a new universe named "alpha" with default settings
4. Refill the universe sources so players can start mining

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

**What it does:**
- Creates three element source objects (ERBIUM, LANTHANUM, THORIUM)
- Updates `cli/.env` with:
  - `ERB_SOURCE_ID` (ERBIUM source object)
  - `LAN_SOURCE_ID` (LANTHANUM source object)
  - `THO_SOURCE_ID` (THORIUM source object)
- Updates `web/.env` with:
  - `VITE_ERB_SOURCE_ID_DEV` (ERBIUM source object)
  - `VITE_LAN_SOURCE_ID_DEV` (LANTHANUM source object)
  - `VITE_THO_SOURCE_ID_DEV` (THORIUM source object)
- Records the transaction digest in `tx-digests.json`

### Start a new universe

```console
$ trade-wars start-universe [--name <name>] [--galaxies <number>] [--systems <number>] [--planets <number>] [--open <boolean>]
```
Creates a new game server with the specified parameters.

**Options:**
- `--name <name>`: Universe name (default: alpha)
- `--galaxies <number>`: Number of galaxies (1-255, default: 1)
- `--systems <number>`: Number of systems per galaxy (1-255, default: 1)  
- `--planets <number>`: Number of planets per system (1-255, default: 255)
- `--open <boolean>`: Whether the universe should be open for registration (default: true)

**What it does:**
- Creates a new Universe object with the specified parameters
- Creates a UniverseCreatorCap for admin control
- Creates three UniverseElementSource objects (ERBIUM, LANTHANUM, THORIUM) linked to the universe
- Updates `cli/.env` with:
  - `{NAME}_UNIVERSE_ID` (Universe object)
  - `{NAME}_UNIVERSE_CAP_ID` (UniverseCreatorCap object)
  - `{NAME}_ERB_ELEMENT_SOURCE_ID` (ERBIUM universe source object)
  - `{NAME}_LAN_ELEMENT_SOURCE_ID` (LANTHANUM universe source object)
  - `{NAME}_THO_ELEMENT_SOURCE_ID` (THORIUM universe source object)
- Records the transaction digest in `tx-digests.json`

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

### Refill Sources

```console
$ trade-wars refill-sources [--universe <name>]
```
Refills the universe element sources for mining by transferring resources from the main element sources.

**Options:**
- `--universe <name>`: Universe name to refill sources for (default: alpha)

**What it does:**
- Calls the `refill_universe_source<T>` function for each element type (ERBIUM, LANTHANUM, THORIUM)
- Uses element source IDs from `.env` (ERB_SOURCE_ID, LAN_SOURCE_ID, THO_SOURCE_ID)
- Uses universe-specific IDs from `.env` based on the universe name (e.g., ALPHA_UNIVERSE_CAP_ID, ALPHA_ERB_ELEMENT_SOURCE_ID, etc.)
- Records the transaction digest in `tx-digests.json`
- Returns the quantity of each element refilled