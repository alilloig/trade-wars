# Trade Wars - Smart Contract Architecture

## Overview

Trade Wars is a space exploration and resource management game built on the Sui blockchain. The game revolves around players (called Overseers) who control planets that mine different elements (Erbium, Lanthanum, and Thorium), upgrade mining facilities, and trade resources to build their interstellar empires.

## Core Components

The game consists of several interconnected smart contract modules that define the game's universe, resources, and mechanics:

### Game Initialization and Administration

- **trade_wars:** The main module that initializes the game, manages universe creation, and handles global game settings.
- **GameAdminCapability:** Grants administrative access to the game owner for configuring game parameters.
- **TradeWarsPublicInfo:** A shared object that provides public information about the game state, reducing congestion on the main TradeWars object.

### Universe System

- **Universe:** Represents a game world with galaxies, systems, and planets. Multiple universes can exist within the game.
- **UniverseCreatorCapability:** Grants special rights to universe creators to manage their universes.
- **UniverseInfo:** Stores basic information about a universe (name, dimensions, open status).

### Element System

- **ERBIUM, LANTHANUM, THORIUM:** The three primary resources in the game, implemented as fungible tokens.
- **ElementSource:** Wrappers around treasury capabilities for each element, allowing controlled minting of resources.
- **UniverseElementSource:** Universe-specific element sources that manage the resource reserves for a particular universe.
- **MineConfigurationParameters:** Configurable parameters for mining operations of each element type.

### Planet and Mining System

- **Planet:** Represents a planet with a mine that produces a specific element type.
- **PlanetInfo:** Stores information about a planet's location in the universe.
- **PlanetCapability:** Grants ownership and control over a planet to an Overseer.
- **ElementMine:** Represents a mining facility that produces elements over time.

### Player System

- **Overseer:** Represents a player who can control planets and build an empire.

### Trading System (Early Stage)

- **TradePort:** Facilitates trading between different element types (under development).

## Game Flow

1. **Game Initialization:**
   - The module owner initializes the game and receives the `GameAdminCapability`.
   - Element treasuries (ERBIUM, LANTHANUM, THORIUM) are created and stored in element sources.

2. **Universe Creation:**
   - Admin or players can create new universes by specifying dimensions and paying a fee.
   - Universe creators receive a `UniverseCreatorCapability` to manage their universe.

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
- **GameAdminCapability:** Controls global game configuration.
- **UniverseCreatorCapability:** Controls universe-specific settings.
- **PlanetCapability:** Grants ownership rights over planets.

## Technical Implementations

### Shared Objects

- **TradeWars:** Main game object (shared).
- **TradeWarsPublicInfo:** Information object to reduce congestion (shared).
- **Universe:** Game world object (shared).
- **UniverseElementSource:** Element reservoirs for universes (shared).
- **Planet:** Player-controlled planets (shared).

### Owned Objects

- **Overseer:** Owned by players.
- **GameAdminCapability:** Owned by the game administrator.
- **UniverseCreatorCapability:** Owned by universe creators.
- **PlanetCapability:** Owned by players to control their planets.

### Phantom Type Parameters

The system makes extensive use of phantom type parameters to create generic components that are specialized for different element types:
- `ElementSource<T>`
- `UniverseElementSource<T>`
- `ElementMine<T>`
- `Planet<T>`

## Current Development Status

The smart contracts are in an early stage of development. The core resource management and universe systems are functional, while more advanced features like trading, fleet management, and combat systems are planned for future implementation.

## Next Steps

- Complete the `TradePort` implementation for resource trading.
- Implement fleet management and travel between planets.
- Create more extensive upgrade paths for mines and planets.
- Develop combat and conquest mechanics.