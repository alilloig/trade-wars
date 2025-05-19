// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::planet;

// === Imports ===
// trade_wars::
use trade_wars::universe_element_source::{Self, UniverseElementSource};
use trade_wars::element_store::{Self, ElementStore};
use trade_wars::element_mine::{Self, ElementMine};
use trade_wars::erbium::{Self, ERBIUM};
//use trade_wars::lanthanum::{Self, LANTHANUM};
//use trade_wars::thorium::{Self, THORIUM};
// sui::
use sui::balance::{Self, Balance};
use sui::random::RandomGenerator;
use sui::clock::Clock;

// === Errors ===
const ENotPlanetOverseer: u64 = 0;
//const ENotExpectedElement: u64 = 0;
//const EPurchaseElementNotMatching: u64 = 1;

// === Constants ===

// === Structs ===
// ::PlanetInfo
public struct PlanetInfo has store, copy, drop {
    galaxy: u64,
    system: u64,
    position: u64,
}

// === ::PlanetInfo Package Functions ===
public(package) fun create_planet_info(galaxy: u64, system: u64, position: u64): PlanetInfo {
    PlanetInfo { galaxy, system, position}
}

// === ::PlanetInfo Public Functions ===
public fun calculate_travel_distance(self: &PlanetInfo, destination: &PlanetInfo): u64 {
    // lol came up with how to calculate travel costs
    1
}   

// === ::Planet ===
public struct Planet<phantom T> has key {
    id: UID,
    info: PlanetInfo,
    mine: ElementMine<T>,
    erbium_store: ElementStore<ERBIUM>,
    //lanthanum_store: ElementStore<LANTHANUM>,
    //thorium_store: ElementStore<THORIUM>,
}

// === ::Planet Private Functions ===
fun create_planet<T>(info: PlanetInfo, source: ID, ctx: &mut TxContext): Planet<T> {
    Planet {
        id: object::new(ctx),
        info: info,
        mine: element_mine::create_mine<T>(source, 100),
        erbium_store: element_store::create_store<ERBIUM>(),
        //lanthanum_store: element_store::create_store<LANTHANUM>(),
        //thorium_store: element_store::create_store<THORIUM>(),
    }
}

// Helper method to call on assert on authorized Planet operations
fun check_overseer_authority<T>(self: &Planet<T>, cap: &PlanetCapability): bool {
    object::id_address(self) == cap.direction
}

// === ::Planet Entry Functions ===
entry fun extract_erbium(
    self: &mut Planet<ERBIUM>, 
    cap: &PlanetCapability, 
    source: &mut UniverseElementSource<ERBIUM>, 
    c: &Clock
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.erbium_store.join<ERBIUM>(
        self.mine.extract<ERBIUM>(source, c.timestamp_ms())
    );
}

entry fun upgrade_mine<T>(
    self: &mut Planet<T>, 
    cap: &PlanetCapability,
    erb_source: &mut UniverseElementSource<ERBIUM>,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb = self.erbium_store.split<ERBIUM>(self.mine.get_upgrade_erbium_cost());
    self.mine.upgrade_mine(erb_source, erb);
}

// === ::PlanetCapability ===
// Identifies overseer as owner of planet and allows operations over it
public struct PlanetCapability has key, store {
    id: UID,
    direction: address,
}

// === ::PlanetCapability Private Functions ===
fun create_planet_capability(addr: address, ctx: &mut TxContext): PlanetCapability {
    PlanetCapability {
        id: object::new(ctx),
        direction: addr 
    }
}

fun get_direction(self: &PlanetCapability): address {
    self.direction
}

// === Events ===
// === Method Aliases ===
// === Public Functions ===
// === View Functions ===
// === Admin Functions ===

// === Package Functions ===
/*public(package) fun occupy_planet(info: PlanetInfo, ctx: &mut TxContext): PlanetCapability {
    let planet = create_planet<ERBIUM>(info, ctx);
    let cap = create_planet_capability(object::id_address(&planet), ctx);
    transfer::share_object(planet);
    cap
}*/

// === Private Functions ===
// Medio aleatoriamente hay que determinar donde se encuentra el planeta y actualizarlo como ocupado POR ESO ESTABA EN UNIVERSE ANORMAL
// necesitamos mut Universe para actualizar el nuevo planeta
fun generate_random_planet(randomizer: &mut RandomGenerator): PlanetInfo {
    let random_element = randomizer.generate_u64_in_range(1, 3);
    let mut planet_info: Option<PlanetInfo> = option::none();
    if (random_element == 1 ) {
        planet_info.fill(create_planet_info(1, 1, 1));
    } else if (random_element == 2 ) {
        planet_info.fill(create_planet_info(1, 1, 1));
    } else if (random_element == 3 ) {
        planet_info.fill(create_planet_info(1, 1, 1));
    };
    planet_info.destroy_some()
}

// === Test Functions ===