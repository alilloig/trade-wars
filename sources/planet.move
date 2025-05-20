// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::planet;

// === Imports ===
// trade_wars::
use trade_wars::universe_element_source::{UniverseElementSource};
use trade_wars::element_mine::{Self, ElementMine};
use trade_wars::erbium::{ERBIUM};
use trade_wars::lanthanum::{LANTHANUM};
use trade_wars::thorium::{THORIUM};
// sui::
use sui::clock::Clock;
use sui::balance::{Self, Balance};
// === Errors ===
const ENotPlanetOverseer: u64 = 0;
//const ENotExpectedElement: u64 = 0;
//const EPurchaseElementNotMatching: u64 = 1;

// === Constants ===

// === Structs ===
// === ::PlanetCapability ===
// Identifies overseer as owner of planet and allows operations over it
public struct PlanetCapability has store {
    planet: ID,
}

fun create_planet_capability(planet: ID): PlanetCapability {
    PlanetCapability {
        planet
    }
}

public(package) fun planet(self: &PlanetCapability): ID {
    self.planet
}

// ::PlanetInfo
public struct PlanetInfo has store, copy, drop {
    galaxy: u8,
    system: u8,
    position: u8,
}

// === ::PlanetInfo Package Functions ===
public(package) fun create_planet_info(galaxy: u8, system: u8, position: u8): PlanetInfo {
    PlanetInfo { galaxy, system, position}
}

// === ::PlanetInfo Public Functions ===
// TO-DO: Implement this
public fun calculate_travel_distance(self: &PlanetInfo, destination: &PlanetInfo): u64 {
    let distance = 0;
    distance
}   

// === ::Planet ===
public struct Planet<phantom T> has key {
    id: UID,
    info: PlanetInfo,
    mine: ElementMine<T>,
    erbium_store: Balance<ERBIUM>,
    lanthanum_store: Balance<LANTHANUM>,
    thorium_store: Balance<THORIUM>,
}

// === ::Planet Private Functions ===
public(package) fun create_and_share_planet<T>(info: PlanetInfo, source: &UniverseElementSource<T>, ctx: &mut TxContext): PlanetCapability {
    let planet = Planet<T> {
        id: object::new(ctx),
        info: info,
        mine: element_mine::create_mine<T>(source),
        erbium_store: balance::zero<ERBIUM>(),
        lanthanum_store: balance::zero<LANTHANUM>(),
        thorium_store: balance::zero<THORIUM>(),
    };
    let cap = create_planet_capability(object::id(&planet));
    transfer::share_object(planet);
    cap
}

// Helper method to call on assert on authorized Planet operations
fun check_overseer_authority<T>(self: &Planet<T>, cap: &PlanetCapability): bool {
    object::id(self) == cap.planet
}

// esto hay que llamarlo desde el overseer para hacer una funcion entry que no se enfade xk 
// le estoy pasando la capability del planeta, que no tiene key, y sin key no puedes meter en las entrys
// === ::Planet Entry Functions ===
public(package) fun extract_erbium(
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

public(package) fun extract_lanthanum(
    self: &mut Planet<LANTHANUM>, 
    cap: &PlanetCapability, 
    source: &mut UniverseElementSource<LANTHANUM>, 
    c: &Clock
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.lanthanum_store.join<LANTHANUM>(
        self.mine.extract<LANTHANUM>(source, c.timestamp_ms())
    );
}

public(package) fun extract_thorium(
    self: &mut Planet<THORIUM>, 
    cap: &PlanetCapability, 
    source: &mut UniverseElementSource<THORIUM>, 
    c: &Clock
) { 
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.thorium_store.join<THORIUM>(
        self.mine.extract<THORIUM>(source, c.timestamp_ms())
    );
}

public(package) fun upgrade_mine<T>(
    self: &mut Planet<T>, 
    cap: &PlanetCapability,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb = self.erbium_store.split<ERBIUM>(self.mine.get_upgrade_erbium_cost());
    let lan = self.lanthanum_store.split<LANTHANUM>(self.mine.get_upgrade_lanthanum_cost());
    let tho = self.thorium_store.split<THORIUM>(self.mine.get_upgrade_thorium_cost());
    self.mine.upgrade_mine(erb_source, erb, lan_source, lan, tho_source, tho);
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

// === Test Functions ===