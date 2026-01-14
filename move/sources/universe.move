// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for managing universes within the Trade Wars game.
/// A universe represents a game world with galaxies, systems, and planets.
module trade_wars::universe;

// === Imports ===
use std::string::String;
use sui::display::{Self, Display};
use sui::event;
use sui::package::Publisher;
use sui::random::RandomGenerator;
use sui::table::{Self, Table};
use trade_wars::element_source::ElementSource;
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::planet::{Self, PlanetInfo, PlanetCap, create_planet_info};
use trade_wars::thorium::THORIUM;

// === Errors ===
/// Error code when an operation is attempted by someone who is not the universe creator
const ENotUniverseCreator: u64 = 0;
/// Error code when universe has no more free planets
const EUniverseFull: u64 = 1;

// === Constants ===
/// Percentage of system occupation that triggers frontier advancement (50%)
const FRONTIER_THRESHOLD_PERCENT: u8 = 50;

// === Structs ===
/// Cap that grants special rights to the creator of a Universe
public struct UniverseCreatorCap has key, store {
    id: UID,
    /// ID of the universe this capability has control over
    universe: ID,
}

/// Information about a universe that can be stored and emitted in events
public struct UniverseInfo has copy, drop, store {
    /// Name of the universe
    name: String,
    /// Number of galaxies in the universe
    galaxies: u8,
    /// Number of systems per galaxy
    systems: u8,
    /// Number of planets per system
    planets: u8,
    /// Flag indicating if the universe is open for registration
    open: bool,
}

/// The main Universe object that represents a game world
public struct Universe has key {
    id: UID,
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    open: bool,
    /// Current frontier galaxy for new player allocation
    active_galaxy: u8,
    /// Current frontier system for new player allocation
    active_system: u8,
    /// Per-system free planet positions: key = galaxy * systems + system_id
    system_free_planets: Table<u16, vector<u8>>,
}

// == Events ==
/// Event emitted when a new Universe is created
public struct UniverseCreated has copy, drop {
    /// ID of the newly created Universe
    id: ID,
    /// Timestamp of when the Universe was created
    genesis: u64,
    /// Information about the Universe
    info: UniverseInfo,
}

// === Public Functions ===

// === View Functions ===
public fun open(self: &Universe): bool {
    self.open
}

// === Admin Functions ===

// === Package Functions ===
/// Creates a new UniverseInfo object with the given parameters
public(package) fun create_universe_info(
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    open: bool,
): UniverseInfo {
    UniverseInfo {
        name,
        galaxies,
        systems,
        planets,
        open
    }
}

/// Creates a new Universe with the given info and genesis timestamp.
/// The Universe is immediately shared (since it contains Table which lacks store).
/// Returns the universe ID and creator capability.
public(package) fun create_universe(
    info: UniverseInfo,
    genesis: u64,
    ctx: &mut TxContext,
): (ID, UniverseCreatorCap) {
    let universe = Universe {
        id: object::new(ctx),
        name: info.name,
        galaxies: info.galaxies,
        systems: info.systems,
        planets: info.planets,
        open: info.open,
        active_galaxy: 0,
        active_system: 0,
        system_free_planets: initialize_system_free_planets(&info, ctx),
    };
    let universe_id = object::id(&universe);
    let capability = create_universe_creator_capability(&universe, ctx);
    event::emit(UniverseCreated {
        id: universe_id,
        genesis: genesis,
        info: info,
    });
    // Share immediately since Universe contains Table (no store ability)
    transfer::share_object(universe);
    (universe_id, capability)
}

/// Checks if the creator capability has access to this Universe
public(package) fun creator_has_access(
    self: &Universe,
    creator_cap: &UniverseCreatorCap,
): bool {
    object::id(self) == creator_cap.universe
}

/// Opens the universe for player registration (only callable by the universe creator)
public(package) fun open_universe(self: &mut Universe, creator_cap: &UniverseCreatorCap) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.open = true;
}

/// Closes the universe for player registration (only callable by the universe creator)
public(package) fun close_universe(self: &mut Universe, creator_cap: &UniverseCreatorCap) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.open = false;
}

/// Randomly chooses a planet from the free planet pool and occupies it for the overseer
public(package) fun occupy_planet(
    self: &mut Universe,
    erb_source: &ElementSource<ERBIUM>,
    lan_source: &ElementSource<LANTHANUM>,
    tho_source: &ElementSource<THORIUM>,
    now: u64,
    randomizer: &mut RandomGenerator,
    ctx: &mut TxContext,
): PlanetCap {
    let info = get_free_planet(self, randomizer);
    planet::create_and_share_planet(
        info,
        self.systems,
        erb_source,
        lan_source,
        tho_source,
        now,
        ctx,
    )
}

/// Returns the name of the universe
public(package) fun name(self: &UniverseInfo): String {
    self.name
}

/// Returns the number of galaxies in the universe
public(package) fun galaxies(self: &UniverseInfo): u8 {
    self.galaxies
}

/// Returns the number of systems per galaxy
public(package) fun systems(self: &UniverseInfo): u8 {
    self.systems
}

/// Returns the number of planets per system
public(package) fun planets(self: &UniverseInfo): u8 {
    self.planets
}

/// Sets the universe info as open
public(package) fun open_universe_info(self: &mut UniverseInfo) {
    self.open = true
}

/// Sets the universe info as closed
public(package) fun close_universe_info(self: &mut UniverseInfo) {
    self.open = false
}

/// Creates a Display for Universe objects
public(package) fun get_universe_display(
    publisher: &Publisher,
    ctx: &mut TxContext,
): Display<Universe> {
    let keys = vector[
        b"name".to_string(),
        b"galaxies in universe".to_string(),
        b"systems per galaxy".to_string(),
        b"planets per system".to_string(),
        b"is open".to_string(),
    ];
    let values = vector[
        b"{name}".to_string(),
        b"{galaxies}".to_string(),
        b"{systems}".to_string(),
        b"{planets}".to_string(),
        b"{open}".to_string(),
    ];
    display::new_with_fields<Universe>(
        publisher,
        keys,
        values,
        ctx,
    )
}

// === Private Functions ===
/// Creates a new capability for the universe creator
fun create_universe_creator_capability(
    universe: &Universe,
    ctx: &mut TxContext,
): UniverseCreatorCap {
    UniverseCreatorCap {
        id: object::new(ctx),
        universe: object::id(universe),
    }
}

/// Computes a unique key for a system based on galaxy and system indices
fun system_key(galaxy: u8, system: u8, systems_per_galaxy: u8): u16 {
    (galaxy as u16) * (systems_per_galaxy as u16) + (system as u16)
}

/// Gets a free planet from the active frontier system
fun get_free_planet(self: &mut Universe, randomizer: &mut RandomGenerator): PlanetInfo {
    // Ensure universe is not full
    assert!(self.active_galaxy < self.galaxies, EUniverseFull);

    let key = system_key(self.active_galaxy, self.active_system, self.systems);
    let positions = self.system_free_planets.borrow_mut(key);

    // Shuffle and pop a random position from the active system
    randomizer.shuffle(positions);
    let position = positions.pop_back();

    // Create the planet info with current frontier coordinates
    let info = create_planet_info(self.active_galaxy, self.active_system, position);

    // Check if we should advance the frontier
    check_and_advance_frontier(self);

    info
}

/// Checks if the current system has reached the occupation threshold and advances if needed
fun check_and_advance_frontier(self: &mut Universe) {
    let key = system_key(self.active_galaxy, self.active_system, self.systems);
    let remaining = self.system_free_planets.borrow(key).length();
    let total = self.planets as u64;

    // Calculate occupied percentage
    let occupied = total - remaining;
    let occupied_percent = (occupied * 100) / total;

    if (occupied_percent >= (FRONTIER_THRESHOLD_PERCENT as u64)) {
        advance_frontier(self);
    }
}

/// Advances the frontier to the next system (or galaxy if needed)
fun advance_frontier(self: &mut Universe) {
    self.active_system = self.active_system + 1;
    if (self.active_system >= self.systems) {
        self.active_system = 0;
        self.active_galaxy = self.active_galaxy + 1;
    }
    // Note: If active_galaxy >= galaxies, universe is full (handled in get_free_planet)
}

/// Initializes the per-system free planets table for a new Universe
fun initialize_system_free_planets(
    info: &UniverseInfo,
    ctx: &mut TxContext,
): Table<u16, vector<u8>> {
    let mut system_planets = table::new<u16, vector<u8>>(ctx);

    let mut galaxy = 0u8;
    while (galaxy < info.galaxies) {
        let mut system = 0u8;
        while (system < info.systems) {
            // Create vector of all positions for this system
            let mut positions = vector::empty<u8>();
            let mut pos = 0u8;
            while (pos < info.planets) {
                positions.push_back(pos);
                pos = pos + 1;
            };

            let key = system_key(galaxy, system, info.systems);
            system_planets.add(key, positions);

            system = system + 1;
        };
        galaxy = galaxy + 1;
    };

    system_planets
}