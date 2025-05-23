// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for managing universes within the Trade Wars game.
/// A universe represents a game world with galaxies, systems, and planets.
module trade_wars::universe;

use std::string::String;
use sui::display::{Self, Display};
use sui::event;
use sui::package::Publisher;
use sui::random::RandomGenerator;
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::planet::{Self, PlanetInfo, PlanetCap, create_planet_info};
use trade_wars::thorium::THORIUM;
use trade_wars::universe_element_source::UniverseElementSource;

// === Errors ===
/// Error code when an operation is attempted by someone who is not the universe creator
const ENotUniverseCreator: u64 = 0;
const EUniverseNotInitialized: u64 = 1;
// === Constants ===

// === Structs ===
/// Cap that grants special rights to the creator of a Universe
public struct UniverseCreatorCap has key, store {
    id: UID,
    /// ID of the universe this capability has control over
    universe: ID,
}

// === ::UniverseCreatorCap Private Functions ===
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

// === ::UniverseInfo Package Functions ===
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
        open: false,
    }
}

// ::getters
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

/// Returns whether the universe is open for registration
public(package) fun open(self: &UniverseInfo): bool {
    self.open
}

// ::setters
/// Sets the universe info as open
public(package) fun open_universe_info(self: &mut UniverseInfo) {
    self.open = true
}

/// Sets the universe info as closed
public(package) fun close_universe_info(self: &mut UniverseInfo) {
    self.open = false
}

/// The main Universe object that represents a game world
public struct Universe has key, store {
    id: UID,
    /// Basic information about the universe
    info: UniverseInfo,
    /// List of available planets that have not been claimed
    free_planets: vector<PlanetInfo>,
    /// ID of the Erbium source for this universe
    erbium_source: Option<ID>,
    /// ID of the Lanthanum source for this universe
    lanthanum_source: Option<ID>,
    /// ID of the Thorium source for this universe
    thorium_source: Option<ID>,
}

// ::getters
/// Returns the info for this universe
public(package) fun info(self: &Universe): UniverseInfo {
    self.info
}

/// Returns the Erbium source for this universe
public fun erbium_source(self: &Universe): ID {
    assert!(self.erbium_source.is_some(), EUniverseNotInitialized);
    *self.erbium_source.borrow()
}

/// Returns the Lanthanum source for this universe
public fun lanthanum_source(self: &Universe): ID {
    assert!(self.lanthanum_source.is_some(), EUniverseNotInitialized);
    *self.lanthanum_source.borrow()
}

/// Returns the Thorium source for this universe
public fun thorium_source(self: &Universe): ID {
    assert!(self.thorium_source.is_some(), EUniverseNotInitialized);
    *self.thorium_source.borrow()
}

// ::constructor
/// Creates a new Universe with the given info and genesis timestamp
public(package) fun create_universe(
    info: UniverseInfo,
    genesis: u64,
    ctx: &mut TxContext,
): (Universe, UniverseCreatorCap) {
    let universe = Universe {
        id: object::new(ctx),
        info,
        erbium_source: option::none(),
        lanthanum_source: option::none(),
        thorium_source: option::none(),
        free_planets: initialize_free_planets(&info),
    };
    let capability = create_universe_creator_capability(&universe, ctx);
    event::emit(UniverseCreated {
        id: object::id(&universe),
        genesis: genesis,
        info: info,
    });
    (universe, capability)
}

// ::getters
/// Returns the UniverseInfo for this Universe
public(package) fun get_info(self: &Universe): UniverseInfo {
    self.info
}

/// Returns a mutable reference to the free planets vector
fun get_free_planet(self: &mut Universe, randomizer: &mut RandomGenerator): PlanetInfo {
    randomizer.shuffle<PlanetInfo>(&mut self.free_planets);
    self.free_planets.pop_back()
}

// ::setters
/// Links the element sources to this Universe
public(package) fun link_elements_sources(
    self: &mut Universe,
    erb_source: ID,
    lan_source: ID,
    tho_source: ID,
) {
    link_erbium_source(self, erb_source);
    link_lanthanum_source(self, lan_source);
    link_thorium_source(self, tho_source);
}

/// Opens the universe for player registration (only callable by the universe creator)
public(package) fun open_universe(self: &mut Universe, creator_cap: &UniverseCreatorCap) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.info.open = true;
}

/// Closes the universe for player registration (only callable by the universe creator)
public(package) fun close_universe(self: &mut Universe, creator_cap: &UniverseCreatorCap) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.info.open = false;
}

// ::Universe Package Functions
/// Checks if the creator capability has access to this Universe
public(package) fun creator_has_access(
    self: &Universe,
    creator_cap: &UniverseCreatorCap,
): bool {
    object::id(self) == creator_cap.universe
}

/// Randomly chooses a planet from the free planet pool and occupies it for the overseer
public(package) fun occupy_planet(
    self: &mut Universe,
    erb_source: &UniverseElementSource<ERBIUM>,
    lan_source: &UniverseElementSource<LANTHANUM>,
    tho_source: &UniverseElementSource<THORIUM>,
    randomizer: &mut RandomGenerator,
    ctx: &mut TxContext,
): PlanetCap {
    let info = get_free_planet(self, randomizer);
    planet::create_and_share_planet(
        info,
        self.info.systems,
        erb_source,
        lan_source,
        tho_source,
        ctx,
    )
}

// === ::Universe Private Functions ===
/// Links an erbium source to this Universe
fun link_erbium_source(self: &mut Universe, erb_source: ID) {
    self.erbium_source.fill(erb_source);
}

/// Links a lanthanum source to this Universe
fun link_lanthanum_source(self: &mut Universe, lan_source: ID) {
    self.lanthanum_source.fill(lan_source);
}

/// Links a thorium source to this Universe
fun link_thorium_source(self: &mut Universe, tho_source: ID) {
    self.thorium_source.fill(tho_source);
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

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===
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
        b"{info.name}".to_string(),
        b"{info.galaxies}".to_string(),
        b"{info.systems}".to_string(),
        b"{info.planets}".to_string(),
        b"{info.open}".to_string(),
    ];
    display::new_with_fields<Universe>(
        publisher,
        keys,
        values,
        ctx,
    )
}

// === Private Functions ===
/// Initializes the free planets list for a new Universe based on the UniverseInfo
fun initialize_free_planets(info: &UniverseInfo): vector<PlanetInfo> {
    let mut planets = vector::empty<PlanetInfo>();
    let mut i = 0;
    while (i < info.galaxies) {
        let mut j = 0;
        while (j < info.systems) {
            let mut k = 0;
            while (k < info.planets) {
                planets.push_back(create_planet_info(i, j, k));
                k = k + 1;
            };
            j = j + 1;
        };
        i = i + 1;
    };
    planets
}

// === Test Functions ===
