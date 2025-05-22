// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for handling planets within the Trade Wars game.
/// Planets are the primary resource-generating assets that players control.
module trade_wars::planet;

use sui::balance::{Self, Balance};
use sui::display::{Self, Display};
use sui::package::Publisher;
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
public struct Planet has key {
    id: UID,
    /// Coordinates and location information
    info: PlanetInfo,
    /// The size of the system this planet is in
    system_size: u8,
    /// The erbium mine that produces elements of type ERBIUM
    erbium_mine: ElementMine<ERBIUM>,
    /// Balance of erbium stored on the planet
    erbium_store: Balance<ERBIUM>,
    /// The lanthanum mine that produces elements of type LANTHANUM
    lanthanum_mine: ElementMine<LANTHANUM>,
    /// Balance of lanthanum stored on the planet
    lanthanum_store: Balance<LANTHANUM>,
    /// The thorium mine that produces elements of type THORIUM
    thorium_mine: ElementMine<THORIUM>,
    /// Balance of thorium stored on the planet
    thorium_store: Balance<THORIUM>,
}

// === ::Planet Private Functions ===
/// Creates a new Planet and shares it, returning a capability to control it
public(package) fun create_and_share_planet(
    info: PlanetInfo,
    system_size: u8,
    erbium_source: &UniverseElementSource<ERBIUM>,
    lanthanum_source: &UniverseElementSource<LANTHANUM>,
    thorium_source: &UniverseElementSource<THORIUM>,
    ctx: &mut TxContext,
): PlanetCap {
    let planet = Planet {
        id: object::new(ctx),
        info: info,
        system_size: system_size,
        erbium_mine: element_mine::create_mine<ERBIUM>(erbium_source),
        erbium_store: balance::zero<ERBIUM>(),
        lanthanum_mine: element_mine::create_mine<LANTHANUM>(lanthanum_source),
        lanthanum_store: balance::zero<LANTHANUM>(),
        thorium_mine: element_mine::create_mine<THORIUM>(thorium_source),
        thorium_store: balance::zero<THORIUM>(),
    };
    let cap = create_planet_capability(object::id(&planet));
    transfer::share_object(planet);
    cap
}

/// Upgrades a planet's erbium mine to increase its production
public(package) fun upgrade_erbium_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb = self.erbium_store.split<ERBIUM>(self.erbium_mine.erbium_upgrade_cost());
    let lan = self.lanthanum_store.split<LANTHANUM>(self.lanthanum_mine.lanthanum_upgrade_cost());
    let tho = self.thorium_store.split<THORIUM>(self.thorium_mine.thorium_upgrade_cost());
    self.erbium_mine.upgrade_mine(erb_source, erb, lan_source, lan, tho_source, tho);
}

/// Upgrades a planet's lanthanum mine to increase its production
public(package) fun upgrade_lanthanum_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb = self.erbium_store.split<ERBIUM>(self.erbium_mine.erbium_upgrade_cost());
    let lan = self.lanthanum_store.split<LANTHANUM>(self.lanthanum_mine.lanthanum_upgrade_cost());
    let tho = self.thorium_store.split<THORIUM>(self.thorium_mine.thorium_upgrade_cost());
    self.lanthanum_mine.upgrade_mine(erb_source, erb, lan_source, lan, tho_source, tho);
}

/// Upgrades a planet's thorium mine to increase its production
public(package) fun upgrade_thorium_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb = self.erbium_store.split<ERBIUM>(self.erbium_mine.erbium_upgrade_cost());
    let lan = self.lanthanum_store.split<LANTHANUM>(self.lanthanum_mine.lanthanum_upgrade_cost());
    let tho = self.thorium_store.split<THORIUM>(self.thorium_mine.thorium_upgrade_cost());
    self.thorium_mine.upgrade_mine(erb_source, erb, lan_source, lan, tho_source, tho);
}

/// Returns a display for the planet
public(package) fun get_planet_display(
    publisher: &Publisher,
    ctx: &mut TxContext,
): Display<Planet> {
    let keys = vector[
        b"galaxy".to_string(),
        b"system".to_string(),
        b"position".to_string(),
        b"erbium store".to_string(),
        b"erbium mine level".to_string(),
        b"erbium mine erbium upgrade cost".to_string(),
        b"erbium mine lanthanum upgrade cost".to_string(),
        b"erbium mine thorium upgrade cost".to_string(),
        b"lanthanum store".to_string(),
        b"lanthanum mine level".to_string(),
        b"lanthanum mine erbium upgrade cost".to_string(),
        b"lanthanum mine lanthanum upgrade cost".to_string(),
        b"lanthanum mine thorium upgrade cost".to_string(),
        b"thorium store".to_string(),
        b"thorium mine level".to_string(),
        b"thorium mine erbium upgrade cost".to_string(),
        b"thorium mine lanthanum upgrade cost".to_string(),
        b"thorium mine thorium upgrade cost".to_string(),
    ];
    let values = vector[
        b"{info.galaxy}".to_string(),
        b"{info.system}".to_string(),
        b"{info.position}".to_string(),
        b"{erbium_store.value<ERBIUM>()}".to_string(),
        b"{erbium_mine.level()}".to_string(),
        b"{erbium_mine.erbium_upgrade_cost()}".to_string(),
        b"{erbium_mine.lanthanum_upgrade_cost()}".to_string(),
        b"{erbium_mine.thorium_upgrade_cost()}".to_string(),
        b"{lanthanum_store.value<LANTHANUM>()}".to_string(),
        b"{lanthanum_mine.level()}".to_string(),
        b"{lanthanum_mine.erbium_upgrade_cost()}".to_string(),
        b"{lanthanum_mine.lanthanum_upgrade_cost()}".to_string(),
        b"{lanthanum_mine.thorium_upgrade_cost()}".to_string(),
        b"{thorium_store.value<THORIUM>()}".to_string(),
        b"{thorium_mine.level()}".to_string(),
        b"{thorium_mine.erbium_upgrade_cost()}".to_string(),
        b"{thorium_mine.lanthanum_upgrade_cost()}".to_string(),
        b"{thorium_mine.thorium_upgrade_cost()}".to_string(),
    ];
    display::new_with_fields<Planet>(
        publisher,
        keys,
        values,
        ctx,
    )
}

// === Events ===
// === Method Aliases ===
// === Public Functions ===
// === View Functions ===
// === Admin Functions ===
// === Package Functions ===
// === Private Functions ===
/// Verifies that the capability has authority over this planet
fun check_overseer_authority(self: &Planet, cap: &PlanetCap): bool {
    object::id(self) == cap.planet
}
// === Test Functions ===
