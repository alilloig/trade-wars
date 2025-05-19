// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::universe;

// === Imports ===
// trade_wars::
use trade_wars::erbium::{Self, ERBIUM};
// sui::
use sui::balance::{Self, Balance};
use sui::event::{Self};
use sui::display::{Self, Display};
use sui::package::{Publisher};
// std::
use std::string::{String};

// === Errors ===
const ENotEnoughReserves: u64 = 0;
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

public(package) fun open(self: &UniverseInfo): bool {
    self.open
}

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
    erbium_source: Option<ID>,
}

// === ::Universe Package Functions ===
public(package) fun create_universe(
    info: UniverseInfo,
    genesis: u64,
    ctx: &mut TxContext
): (Universe, UniverseCreatorCapability) {
    let universe = Universe {
        info,
        erbium_source: option::none(),
        id: object::new(ctx),
    };
    let capability = create_universe_creator_capability(&universe, ctx);
    event::emit(UniverseCreated {
        id: object::id(&universe),
        genesis: genesis,
        info: info
    });
    (universe, capability)
}

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

public(package) fun creator_has_access(self: &Universe, creator_cap: &UniverseCreatorCapability): bool {
    object::id(self) == creator_cap.universe
}

// === ::Universe Private Functions ===
fun link_erbium_source(self: &mut Universe, erb_source: ID) {
    self.erbium_source.fill(erb_source);
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


// === Test Functions ===