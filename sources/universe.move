// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::universe;

// === Imports ===
// trade_wars::
use trade_wars::erbium::{Self, ERBIUM};
use trade_wars::lanthanum::{Self, LANTHANUM};
use trade_wars::thorium::{Self, THORIUM};
use trade_wars::planet::{Self, PlanetInfo, PlanetCapability, create_planet_info};
use trade_wars::universe_element_source::{Self, UniverseElementSource};
// sui::
use sui::event::{Self};
use sui::display::{Self, Display};
use sui::package::{Publisher};
use sui::random::RandomGenerator;
// std::
use std::string::{String};

// === Errors ===
const ENotUniverseCreator: u64 = 0;

// === Constants ===

// === Structs ===
// ::UniverseCreatorCapability
public struct UniverseCreatorCapability has key, store {
    id: UID,
    universe: ID
}
// === ::UniverseCreatorCapability Private Functions ===
fun create_universe_creator_capability(universe: &Universe, ctx: &mut TxContext): UniverseCreatorCapability {
    UniverseCreatorCapability { 
        id: object::new(ctx), 
        universe: object::id(universe) 
    }
}

// ::UniverseInfo
// needs copy and drop bc is emitted in the universe creation event
public struct UniverseInfo has store, copy, drop {
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    open: bool
}

// === ::UniverseInfo Package Functions ===
public(package) fun create_universe_info(name: String, galaxies: u8, systems: u8, planets: u8): UniverseInfo {
    UniverseInfo {
        name,
        galaxies,
        systems,
        planets,
        open: false
    }
}

// ::getters
public(package) fun open(self: &UniverseInfo): bool {
    self.open
}

// ::setters
public(package) fun open_universe_info(self: &mut UniverseInfo) {
    self.open = true
}

public(package) fun close_universe_info(self: &mut UniverseInfo) {
    self.open = false
}

// ::Universe
public struct Universe has key, store {
    id: UID,
    info: UniverseInfo,
    free_planets: vector<PlanetInfo>,
    erbium_source: Option<ID>,
    lanthanum_source: Option<ID>,
    thorium_source: Option<ID>,
}

// ::constructor
public(package) fun create_universe(
    info: UniverseInfo,
    genesis: u64,
    ctx: &mut TxContext
): (Universe, UniverseCreatorCapability) {
    let universe = Universe {
        id: object::new(ctx),
        info,
        erbium_source: option::none(),
        lanthanum_source: option::none(),
        thorium_source: option::none(),
        free_planets: initialize_free_planets(&info)
    };
    let capability = create_universe_creator_capability(&universe, ctx);
    event::emit(UniverseCreated {
        id: object::id(&universe),
        genesis: genesis,
        info: info
    });
    (universe, capability)
}

// ::getters
public(package) fun get_info(self: &Universe): UniverseInfo {
    self.info
}

fun borrow_free_planets_mut(self: &mut Universe): &mut vector<PlanetInfo> {
    &mut self.free_planets
}

// ::setters
public(package) fun link_elements_sources(self: &mut Universe, erb_source: ID) {
    link_erbium_source(self, erb_source);
}

public(package) fun open_universe(self: &mut Universe, creator_cap: &UniverseCreatorCapability) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.info.open = true;
}

public(package) fun close_universe(self: &mut Universe, creator_cap: &UniverseCreatorCapability) {
    assert!(creator_has_access(self, creator_cap), ENotUniverseCreator);
    self.info.open = false;
}

// ::Universe Package Functions
public(package) fun creator_has_access(self: &Universe, creator_cap: &UniverseCreatorCapability): bool {
    object::id(self) == creator_cap.universe
}

// Randomly chooses a planet from the free planet pool and occupies it for the overseer
public(package) fun occupy_planet(
    self: &mut Universe,
    erb_source: &UniverseElementSource<ERBIUM>,
    lan_source: &UniverseElementSource<LANTHANUM>,
    tho_source: &UniverseElementSource<THORIUM>,
    randomizer: &mut RandomGenerator,
    ctx: &mut TxContext
): PlanetCapability {
    let random_element = randomizer.generate_u64_in_range(1, 3);
    randomizer.shuffle<PlanetInfo>(borrow_free_planets_mut(self));
    let info = borrow_free_planets_mut(self).pop_back();
    let mut cap: Option<PlanetCapability> = option::none();
    if (random_element == 1 ) {
        cap.fill(
            planet::create_and_share_planet<ERBIUM>(
                info, 
                erb_source, 
                ctx
                )
            );
    } else if (random_element == 2 ) {
        cap.fill(
            planet::create_and_share_planet<LANTHANUM>(
                info, 
                lan_source, 
                ctx
                )
        );
    } else if (random_element == 3 ) {
        cap.fill(
            planet::create_and_share_planet<THORIUM>(
                info, 
                tho_source, 
                ctx
            )
        );
    };
    cap.destroy_some()
}

// === ::Universe Private Functions ===
fun link_erbium_source(self: &mut Universe, erb_source: ID) {
    self.erbium_source.fill(erb_source);
}

fun link_lanthanum_source(self: &mut Universe, lan_source: ID) {
    self.lanthanum_source.fill(lan_source);
}

fun link_thorium_source(self: &mut Universe, tho_source: ID) {
    self.thorium_source.fill(tho_source);
}


// == Events ==
public struct UniverseCreated has copy, drop {
    id: ID,
    genesis: u64,
    info: UniverseInfo
}

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===
public(package) fun get_universe_display(publisher: &Publisher, ctx: &mut TxContext): Display<Universe> {
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
        b"{info.open}".to_string(),
    ];
    display::new_with_fields<Universe>(
        publisher, keys, values, ctx
    )
}

// === Private Functions ===
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