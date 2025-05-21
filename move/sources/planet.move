// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for handling planets within the Trade Wars game.
/// Planets are the primary resource-generating assets that players control.
module trade_wars::planet;

use sui::balance::{Self, Balance};
use sui::clock::Clock;
use trade_wars::element_mine::{Self, ElementMine};
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::thorium::THORIUM;
use trade_wars::universe_element_source::UniverseElementSource;

// === Errors ===
/// Error code when an operation is attempted by someone who is not the planet's overseer
const ENotPlanetOverseer: u64 = 0;
//const ENotExpectedElement: u64 = 0;
//const EPurchaseElementNotMatching: u64 = 1;

// === Constants ===

// === Structs ===
// === ::PlanetCap ===
/// Cap that grants ownership and control over a planet
public struct PlanetCap has store {
    /// ID of the planet this capability controls
    planet: ID,
}

/// Creates a new PlanetCap for the given planet ID
fun create_planet_capability(planet: ID): PlanetCap {
    PlanetCap {
        planet,
    }
}

/// Returns the ID of the planet this capability controls
public(package) fun planet(self: &PlanetCap): ID {
    self.planet
}

// ::PlanetInfo
/// Information about a planet's location in the universe
public struct PlanetInfo has copy, drop, store {
    /// Galaxy coordinate
    galaxy: u8,
    /// System coordinate within the galaxy
    system: u8,
    /// Position coordinate within the system
    position: u8,
}

// === ::PlanetInfo Package Functions ===
/// Creates a new PlanetInfo with the given coordinates
public(package) fun create_planet_info(galaxy: u8, system: u8, position: u8): PlanetInfo {
    PlanetInfo { galaxy, system, position }
}

// === ::PlanetInfo Public Functions ===
/// Calculates the travel distance between two planets
/// TODO: What is the formula for this?
public fun calculate_travel_distance(self: &PlanetInfo, destination: &PlanetInfo): u64 {
    let distance = 0;
    distance
}

// === ::Planet ===
/// A planet with a mine that produces a specific element type
public struct Planet<phantom T> has key {
    id: UID,
    /// Coordinates and location information
    info: PlanetInfo,
    /// The mine that produces elements of type T
    mine: ElementMine<T>,
    /// Balance of erbium stored on the planet
    erbium_store: Balance<ERBIUM>,
    /// Balance of lanthanum stored on the planet
    lanthanum_store: Balance<LANTHANUM>,
    /// Balance of thorium stored on the planet
    thorium_store: Balance<THORIUM>,
}

// === ::Planet Private Functions ===
/// Creates a new Planet and shares it, returning a capability to control it
public(package) fun create_and_share_planet<T>(
    info: PlanetInfo,
    source: &UniverseElementSource<T>,
    ctx: &mut TxContext,
): PlanetCap {
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

/// Verifies that the capability has authority over this planet
fun check_overseer_authority<T>(self: &Planet<T>, cap: &PlanetCap): bool {
    object::id(self) == cap.planet
}

/// Extracts erbium from an erbium planet's mine
public(package) fun extract_erbium(
    self: &mut Planet<ERBIUM>,
    cap: &PlanetCap,
    source: &mut UniverseElementSource<ERBIUM>,
    c: &Clock,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.erbium_store.join<ERBIUM>(self.mine.extract<ERBIUM>(source, c.timestamp_ms()));
}

/// Extracts lanthanum from a lanthanum planet's mine
public(package) fun extract_lanthanum(
    self: &mut Planet<LANTHANUM>,
    cap: &PlanetCap,
    source: &mut UniverseElementSource<LANTHANUM>,
    c: &Clock,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.lanthanum_store.join<LANTHANUM>(self.mine.extract<LANTHANUM>(source, c.timestamp_ms()));
}

/// Extracts thorium from a thorium planet's mine
public(package) fun extract_thorium(
    self: &mut Planet<THORIUM>,
    cap: &PlanetCap,
    source: &mut UniverseElementSource<THORIUM>,
    c: &Clock,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    self.thorium_store.join<THORIUM>(self.mine.extract<THORIUM>(source, c.timestamp_ms()));
}

/// Upgrades a planet's mine to increase its production
public(package) fun upgrade_mine<T>(
    self: &mut Planet<T>,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
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
// === Private Functions ===
// === Test Functions ===
