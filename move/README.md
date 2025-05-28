# Trade Wars - Smart Contract Architecture

## Overview

Trade Wars is a space exploration and resource management game built on the Sui blockchain. The game revolves around players (called Overseers) who control planets that mine different elements (Erbium, Lanthanum, and Thorium), upgrade mining facilities, and trade resources to build their interstellar empires.

## Core Components

The game consists of several interconnected smart contract modules that define the game's universe, resources, and mechanics:

### Game Initialization and Administration

- **trade_wars:** The main module that initializes the game, manages universe creation, and handles global game settings.
- **GameAdminCap:** Grants administrative access to the game owner for configuring game parameters.
- **TradeWarsInfo:** A shared object that provides public information about the game state, reducing congestion on the main TradeWars object.

### Universe System

- **Universe:** Represents a game world with galaxies, systems, and planets. Multiple universes can exist within the game.
- **UniverseCreatorCap:** Grants special rights to universe creators to manage their universes.
- **UniverseInfo:** Stores basic information about a universe (name, dimensions, open status).

### Element System

- **ERBIUM, LANTHANUM, THORIUM:** The three primary resources in the game, implemented as fungible tokens.
- **ElementSource:** Wrappers around treasury capabilities for each element, allowing controlled minting of resources.
- **UniverseElementSource:** Universe-specific element sources that manage the resource reserves for a particular universe.
- **MineConfigurationParameters:** Configurable parameters for mining operations of each element type.

### Planet and Mining System

- **Planet:** Represents a planet with a mine that produces a specific element type.
- **PlanetInfo:** Stores information about a planet's location in the universe.
- **PlanetCap:** Grants ownership and control over a planet to an Overseer.
- **ElementMine:** Represents a mining facility that produces elements over time.

### Player System

- **Overseer:** Represents a player who can control planets and build an empire.

### Trading System (Early Stage)

- **TradePort:** Facilitates trading between different element types (under development).

## Game Flow

1. **Game Initialization:**
   - The module owner initializes the game and receives the `GameAdminCap`.
   - Element treasuries (ERBIUM, LANTHANUM, THORIUM) are created and stored in element sources.

2. **Universe Creation:**
   - Admin or players can create new universes by specifying dimensions and paying a fee.
   - Universe creators receive a `UniverseCreatorCap` to manage their universe.

3. **Player Onboarding:**
   - Players create an `Overseer` object and join open universes.
   - When joining, players are assigned a random planet with a random element mine.

4. **Resource Management:**
   - Players extract resources from their planets' mines.
   - Resources can be used to upgrade mines, increasing production.
   - Mining production scales with time since last extraction.

5. **Economy:**
   - Universe element sources act as resource reservoirs for their respective universes.
   - When reserves run low, universe creators can refill them from the main sources.

## Key Mechanisms

### Element Production and Resource Flow

1. **Mine Production:** Element mines produce resources based on their level and the time elapsed since the last extraction.
2. **Resource Efficiency:** To minimize blockchain calls, resources aren't minted continuously but calculated and extracted on demand.
3. **Universe Sources:** Each universe has dedicated element sources to maintain independent economies.

### Capability-Based Access Control

The game uses a capability pattern to manage access rights:
- **GameAdminCap:** Controls global game configuration.
- **UniverseCreatorCap:** Controls universe-specific settings.
- **PlanetCap:** Grants ownership rights over planets.

## Technical Implementations

### Shared Objects

- **TradeWars:** Main game object (shared).
- **TradeWarsInfo:** Information object to reduce congestion (shared).
- **Universe:** Game world object (shared).
- **UniverseElementSource:** Element reservoirs for universes (shared).
- **Planet:** Player-controlled planets (shared).

### Owned Objects

- **Overseer:** Owned by players.
- **GameAdminCap:** Owned by the game administrator.
- **UniverseCreatorCap:** Owned by universe creators.
- **PlanetCap:** Owned by players to control their planets.

### Phantom Type Parameters

The system makes extensive use of phantom type parameters to create generic components that are specialized for different element types:
- `ElementSource<T>`
- `UniverseElementSource<T>`
- `ElementMine<T>`
- `Planet<T>`

## Use Cases and Client Integration Guide

### Use Case 1: Admin Initializes the Game and Creates a New Universe

**Prerequisites:** 
- Game admin has deployed the smart contracts
- Admin possesses the `GameAdminCap` object
- Element treasury caps (ERBIUM, LANTHANUM, THORIUM) are available

**Step 1: Initialize Element Sources**
```move
// Entry function call
trade_wars::create_element_sources(
    trade_wars: &mut TradeWars,           // Main game object
    cap: &GameAdminCap,                   // Admin capability
    erb_treasury: TreasuryCap<ERBIUM>,    // Erbium treasury cap
    lan_treasury: TreasuryCap<LANTHANUM>, // Lanthanum treasury cap
    tho_treasury: TreasuryCap<THORIUM>,   // Thorium treasury cap
    ctx: &mut TxContext
)
```

**Step 2: Create a New Universe**
```move
// Entry function call
trade_wars::admin_start_universe(
    trade_wars: &mut TradeWars,                    // Main game object
    cap: &GameAdminCap,                           // Admin capability
    info: &mut TradeWarsInfo,                     // Public info object
    erb_source: &ElementSource<ERBIUM>,           // Global erbium source
    lan_source: &ElementSource<LANTHANUM>,        // Global lanthanum source
    tho_source: &ElementSource<THORIUM>,          // Global thorium source
    name: String,                                 // Universe name (e.g., "Alpha Universe")
    galaxies: u8,                                 // Number of galaxies (e.g., 3)
    systems: u8,                                  // Systems per galaxy (e.g., 5)
    planets: u8,                                  // Planets per system (e.g., 8)
    open: bool,                                   // Whether universe is open for players (true)
    clock: &Clock,                                // Sui clock object
    ctx: &mut TxContext
)
```

**Optional: Configure Universe Settings**
```move
// Set universe creation fees for public users
trade_wars::set_universe_creation_fees(
    trade_wars: &mut TradeWars,
    cap: &GameAdminCap,
    price: u64,                    // Price in SUI (e.g., 1000000000 for 1 SUI)
    info: &mut TradeWarsInfo
)

// Configure mining parameters for each element type
trade_wars::set_mines_parameters<ERBIUM>(
    source: &mut ElementSource<ERBIUM>,
    cap: &GameAdminCap,
    production: u64,              // Production factor
    erb_upgrade_cost: u64,        // Erbium cost for upgrades
    lan_upgrade_cost: u64,        // Lanthanum cost for upgrades
    tho_upgrade_cost: u64         // Thorium cost for upgrades
)
```

### Use Case 2: Player Registers for the First Time and Joins an Open Universe

**Prerequisites:**
- At least one open universe exists
- Player has a Sui wallet with some SUI for gas fees

**Step 1: Create an Overseer**
```move
// Entry function call
overseer::vest_overseer(ctx: &mut TxContext)
```
*This creates and transfers an `Overseer` object to the player's wallet.*

**Step 2: Query Available Universes**
```move
// Public function call to get open universes
trade_wars_info::open_universes(info: &TradeWarsInfo) -> vector<ID>
```
*Client should call this to display available universes to the player.*

**Step 3: Join a Universe**
```move
// Entry function call
overseer::join_universe(
    overseer: &mut Overseer,                           // Player's overseer object
    universe: &mut Universe,                           // Target universe (shared object)
    erb_source: &UniverseElementSource<ERBIUM>,        // Universe's erbium source
    lan_source: &UniverseElementSource<LANTHANUM>,     // Universe's lanthanum source
    tho_source: &UniverseElementSource<THORIUM>,       // Universe's thorium source
    random: &Random,                                   // Sui random object
    clock: &Clock,                                     // Sui clock object
    ctx: &mut TxContext
)
```
*This assigns the player a random planet and creates the necessary planet capability.*

**Step 4: Query Player's Planets**
```move
// Public function call to get player's planets in a universe
overseer::get_universe_planets(overseer: &Overseer, universe: ID) -> vector<ID>
```

### Use Case 3: Registered Player Upgrades One of Their Resource Mines

**Prerequisites:**
- Player has an `Overseer` object with at least one planet
- Player has joined a universe
- Planet has sufficient resources for the upgrade

**Step 1: Check Current Planet Status**
```move
// Public function calls to check planet state
planet::get_erbium_reserves(planet: &Planet, clock: &Clock) -> u64
planet::get_lanthanum_reserves(planet: &Planet, clock: &Clock) -> u64
planet::get_thorium_reserves(planet: &Planet, clock: &Clock) -> u64

// Check current mine levels
planet::get_erbium_mine_level(planet: &Planet) -> u64
planet::get_lanthanum_mine_level(planet: &Planet) -> u64
planet::get_thorium_mine_level(planet: &Planet) -> u64

// Check upgrade costs for each mine type
planet::get_erbium_mine_erbium_upgrade_cost(planet: &Planet) -> u64
planet::get_erbium_mine_lanthanum_upgrade_cost(planet: &Planet) -> u64
planet::get_erbium_mine_thorium_upgrade_cost(planet: &Planet) -> u64
```

**Step 2: Upgrade a Specific Mine**

**For Erbium Mine Upgrade:**
```move
// Entry function call
overseer::upgrade_erbium_planet_mine(
    overseer: &Overseer,                               // Player's overseer
    universe: ID,                                      // Universe ID
    planet: &mut Planet,                               // Target planet (shared object)
    erb_source: &mut UniverseElementSource<ERBIUM>,    // Universe erbium source
    lan_source: &mut UniverseElementSource<LANTHANUM>, // Universe lanthanum source
    tho_source: &mut UniverseElementSource<THORIUM>,   // Universe thorium source
    clock: &Clock                                      // Sui clock object
)
```

**For Lanthanum Mine Upgrade:**
```move
// Entry function call
overseer::upgrade_lanthanum_planet_mine(
    overseer: &Overseer,                               // Player's overseer
    universe: ID,                                      // Universe ID
    planet: &mut Planet,                               // Target planet (shared object)
    erb_source: &mut UniverseElementSource<ERBIUM>,    // Universe erbium source
    lan_source: &mut UniverseElementSource<LANTHANUM>, // Universe lanthanum source
    tho_source: &mut UniverseElementSource<THORIUM>,   // Universe thorium source
    clock: &Clock                                      // Sui clock object
)
```

**For Thorium Mine Upgrade:**
```move
// Entry function call
overseer::upgrade_thorium_planet_mine(
    overseer: &Overseer,                               // Player's overseer
    universe: ID,                                      // Universe ID
    planet: &mut Planet,                               // Target planet (shared object)
    erb_source: &mut UniverseElementSource<ERBIUM>,    // Universe erbium source
    lan_source: &mut UniverseElementSource<LANTHANUM>, // Universe lanthanum source
    tho_source: &mut UniverseElementSource<THORIUM>,   // Universe thorium source
    clock: &Clock                                      // Sui clock object
)
```

## Important Notes for Client Applications

1. **Object References:** Most functions require references to shared objects. Clients must fetch these objects using their IDs before making function calls.

1. **Transaction Building:** For complex operations, clients should use Programmable Transaction Blocks (PTBs) to combine multiple function calls efficiently.

1. **Error Handling:** Functions may abort with specific error codes. Clients should handle these gracefully and provide meaningful error messages to users.

1. **Real-time Updates:** Since mining production is time-based, clients should regularly refresh planet data to show current resource levels.

1. **Random Number Generation:** Universe joining requires access to Sui's `Random` object, which may need special handling in transaction construction.

## Current Development Status

The smart contracts are in an early stage of development. The core resource management and universe systems are functional, while more advanced features like trading, fleet management, and combat systems are planned for future implementation.

## Next Steps