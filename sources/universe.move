// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::universe;

// === Imports ===
// TradeWars::
use trade_wars::erbium::{Self, ERBIUM};

// Sui:: Std::
use sui::balance::{Self, Balance};
use sui::event::{Self};
use sui::display::{Self, Display};
use sui::package::{Publisher};
use sui::bag::{Self, Bag};
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
    elements_sources: Option<Bag>,
    info: UniverseInfo
}

public(package) fun create_universe(
    info: UniverseInfo,
    genesis: u64,
    ctx: &mut TxContext
): (Universe, UniverseCreatorCapability) {
    let universe = Universe {
        id: object::new(ctx),
        elements_sources: option::none(),
        info: info,
    };
    let capability = create_universe_creator_capability(&universe, ctx);
    event::emit(UniverseCreated {
        id: object::id(&universe),
        genesis: genesis,
        info: info
    });
    (universe, capability)
}

public(package) fun set_universe_sources(self: &mut Universe, sources: Bag) {
    self.elements_sources.fill(sources);
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

// ::UniverseElementSource
public struct UniverseElementSource<phantom T> has key, store {
    id: UID,
    universe: ID,
    main_source: ID,
    mines_production_factor: u64,
    sources_refill_threshold: u64,
    reserves: Balance<T>,
}

public(package) fun create_universe_element_source<T>(
    universe: ID,
    main_source: ID,
    mines_production_factor: u64,
    sources_refill_threshold: u64,
    ctx: &mut TxContext
): UniverseElementSource<T> {
    UniverseElementSource<T> {
        id: object::new(ctx),
        universe,
        main_source,
        mines_production_factor,
        sources_refill_threshold,
        reserves: balance::zero<T>()
    }
}


public(package) fun extract<T>(self: &mut UniverseElementSource<T>, amount: u64): Balance<T> {
    assert!(self.reserves.value() <= amount, ENotEnoughReserves);
    let extraction = self.reserves.split(amount);
    if (self.reserves.value() < self.sources_refill_threshold) {
        event::emit(UniverseElementSourceLowReserves {
            id: object::id(self)
        });
    };
    extraction
}

public(package) fun join<T>(self: &mut UniverseElementSource<T>, balance: Balance<T>): u64 {
    self.reserves.join(balance)
}

public(package) fun get_reserves<T>(self: &UniverseElementSource<T>): u64 {
    self.reserves.value()
}

public(package) fun get_mines_production_factor<T>(self: &UniverseElementSource<T>): u64 {
    self.mines_production_factor
}

public(package) fun get_sources_refill_threshold<T>(self: &UniverseElementSource<T>): u64 {
    self.sources_refill_threshold
}

/*
// ::Galaxy
public struct Galaxy has store {
    position: u8,
    systems: vector<System>
}

fun create_galaxies(qty: u8, systems: u8): vector<Galaxy> {
    let mut galaxies = vector::empty<Galaxy>();
    let mut i: u8 = 0;
    while (i < qty) {
        galaxies.push_back(create_galaxy(i, systems));
        i = i + 1
    };
    galaxies
}

fun create_galaxy(position: u8, systems: u8): Galaxy {
    Galaxy {
        position: position,
        systems: create_systems(systems)
    }
}

// ::System
public struct System has store {
    position: u8,
    //planets: vector<Planet<Element>>,
}

fun create_systems(qty: u8): vector<System> {
    let mut systems = vector::empty<System>();
    let mut i: u8 = 0;
    while (i < qty) {
        systems.push_back(create_system(i));
        i = i + 1
    };
    systems    
}

fun create_system(position: u8): System {
    System {
        position: position
    }
}
*/

// == Events ==
public struct UniverseCreated has copy, drop {
    id: ID,
    genesis: u64,
    info: UniverseInfo
}

public struct UniverseElementSourceLowReserves has copy, drop {
    id: ID
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