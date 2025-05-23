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
/// Error code when there's not enough Erbium to perform an operation
const ENotEnoughERBIUM: u64 = 0;
/// Error code when there's not enough Lanthanum to perform an operation
const ENotEnoughLANTHANUM: u64 = 1;
/// Error code when there's not enough Thorium to perform an operation
const ENotEnoughTHORIUM: u64 = 2;
/// Error code when there's not enough resources to perform an operation
const ENotEnoughResources: u64 = 3;

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
    now: u64,
    ctx: &mut TxContext,
): PlanetCap {
    let planet = Planet {
        id: object::new(ctx),
        info: info,
        system_size: system_size,
        erbium_mine: element_mine::create_mine<ERBIUM>(erbium_source, now),
        erbium_store: balance::zero<ERBIUM>(),
        lanthanum_mine: element_mine::create_mine<LANTHANUM>(lanthanum_source, now),
        lanthanum_store: balance::zero<LANTHANUM>(),
        thorium_mine: element_mine::create_mine<THORIUM>(thorium_source, now),
        thorium_store: balance::zero<THORIUM>(),
    };
    let cap = create_planet_capability(object::id(&planet));
    transfer::share_object(planet);
    cap
}

/// Returns the amount of erbium that the planet has in its stores and mines
entry fun get_erbium_reserves(self: &Planet, c: &Clock): u64 {
    let now = c.timestamp_ms();
    self.erbium_store.value<ERBIUM>() + self.erbium_mine.amount_produced(now)
}

/// Returns the amount of lanthanum that the planet has in its stores and mines
entry fun get_lanthanum_reserves(self: &Planet, c: &Clock): u64 {
    let now = c.timestamp_ms();
    self.lanthanum_store.value<LANTHANUM>() + self.lanthanum_mine.amount_produced(now)
}

/// Returns the amount of thorium that the planet has in its stores and mines
entry fun get_thorium_reserves(self: &Planet, c: &Clock): u64 {
    let now = c.timestamp_ms();
    self.thorium_store.value<THORIUM>() + self.thorium_mine.amount_produced(now)
}

public fun get_erbium_mine_level(self: &Planet): u64 {
    self.erbium_mine.level()
}

public fun get_lanthanum_mine_level(self: &Planet): u64 {
    self.lanthanum_mine.level()
}

public fun get_thorium_mine_level(self: &Planet): u64 {
    self.thorium_mine.level()
}

public fun get_erbium_mine_erbium_upgrade_cost(self: &Planet): u64 {
    self.erbium_mine.erbium_upgrade_cost()
}

public fun get_erbium_mine_lanthanum_upgrade_cost(self: &Planet): u64 {
    self.erbium_mine.lanthanum_upgrade_cost()
}

public fun get_erbium_mine_thorium_upgrade_cost(self: &Planet): u64 {
    self.erbium_mine.thorium_upgrade_cost()
}

public fun get_lanthanum_mine_erbium_upgrade_cost(self: &Planet): u64 {
    self.lanthanum_mine.erbium_upgrade_cost()
}

public fun get_lanthanum_mine_lanthanum_upgrade_cost(self: &Planet): u64 {
    self.lanthanum_mine.lanthanum_upgrade_cost()
}

public fun get_lanthanum_mine_thorium_upgrade_cost(self: &Planet): u64 {
    self.lanthanum_mine.thorium_upgrade_cost()
}

public fun get_thorium_mine_erbium_upgrade_cost(self: &Planet): u64 {
    self.thorium_mine.erbium_upgrade_cost()
}

public fun get_thorium_mine_lanthanum_upgrade_cost(self: &Planet): u64 {
    self.thorium_mine.lanthanum_upgrade_cost()
}

public fun get_thorium_mine_thorium_upgrade_cost(self: &Planet): u64 {
    self.thorium_mine.thorium_upgrade_cost()
}

/// Upgrades a planet's erbium mine to increase its production
public(package) fun upgrade_erbium_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    now: u64,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let erb_cost = self.erbium_mine.erbium_upgrade_cost();
    let lan_cost = self.erbium_mine.lanthanum_upgrade_cost();
    let tho_cost = self.erbium_mine.thorium_upgrade_cost();
    assert!(self.has_enough_resources(erb_cost, lan_cost, tho_cost, now), ENotEnoughResources);
    if (self.erbium_store.value<ERBIUM>() < erb_cost) {
        self.erbium_store.join(self.erbium_mine.extract_element<ERBIUM>(erb_source, now));
    };
    if (self.lanthanum_store.value<LANTHANUM>() < lan_cost) {
        self.lanthanum_store.join(self.lanthanum_mine.extract_element<LANTHANUM>(lan_source, now));
    };
    if (self.thorium_store.value<THORIUM>() < tho_cost) {
        self.thorium_store.join(self.thorium_mine.extract_element<THORIUM>(tho_source, now));
    };
    erb_source.return_reserves<ERBIUM>(self.erbium_store.split(erb_cost));
    lan_source.return_reserves<LANTHANUM>(self.lanthanum_store.split(lan_cost));
    tho_source.return_reserves<THORIUM>(self.thorium_store.split(tho_cost));
    self.erbium_mine.upgrade_mine();
}

/// Upgrades a planet's lanthanum mine to increase its production
public(package) fun upgrade_lanthanum_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    now: u64,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let lan_cost = self.lanthanum_mine.lanthanum_upgrade_cost();
    let erb_cost = self.lanthanum_mine.erbium_upgrade_cost();
    let tho_cost = self.lanthanum_mine.thorium_upgrade_cost();
    assert!(self.has_enough_resources(erb_cost, lan_cost, tho_cost, now), ENotEnoughResources);
    if (self.lanthanum_store.value<LANTHANUM>() < lan_cost) {
        self.lanthanum_store.join(self.lanthanum_mine.extract_element<LANTHANUM>(lan_source, now));
    };
    if (self.erbium_store.value<ERBIUM>() < erb_cost) {
        self.erbium_store.join(self.erbium_mine.extract_element<ERBIUM>(erb_source, now));
    };
    if (self.thorium_store.value<THORIUM>() < tho_cost) {
        self.thorium_store.join(self.thorium_mine.extract_element<THORIUM>(tho_source, now));
    };
    erb_source.return_reserves<ERBIUM>(self.erbium_store.split(erb_cost));
    lan_source.return_reserves<LANTHANUM>(self.lanthanum_store.split(lan_cost));
    tho_source.return_reserves<THORIUM>(self.thorium_store.split(tho_cost));
    self.lanthanum_mine.upgrade_mine();
}

/// Upgrades a planet's thorium mine to increase its production
public(package) fun upgrade_thorium_mine(
    self: &mut Planet,
    cap: &PlanetCap,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    now: u64,
) {
    assert!(check_overseer_authority(self, cap), ENotPlanetOverseer);
    let lan_cost = self.thorium_mine.lanthanum_upgrade_cost();
    let erb_cost = self.thorium_mine.erbium_upgrade_cost();
    let tho_cost = self.thorium_mine.thorium_upgrade_cost();
    assert!(self.has_enough_resources(erb_cost, lan_cost, tho_cost, now), ENotEnoughResources);
    if (self.thorium_store.value<THORIUM>() < tho_cost) {
        self.thorium_store.join(self.thorium_mine.extract_element<THORIUM>(tho_source, now));
    };
    if (self.lanthanum_store.value<LANTHANUM>() < lan_cost) {
        self.lanthanum_store.join(self.lanthanum_mine.extract_element<LANTHANUM>(lan_source, now));
    };
    if (self.erbium_store.value<ERBIUM>() < erb_cost) {
        self.erbium_store.join(self.erbium_mine.extract_element<ERBIUM>(erb_source, now));
    };
    self.thorium_mine.upgrade_mine();
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

fun has_enough_resources(
    self: &Planet,
    erb_cost: u64,
    lan_cost: u64,
    tho_cost: u64,
    now: u64,
): bool {
    self.erbium_store.value<ERBIUM>() + self.erbium_mine.amount_produced(now) >= erb_cost &&
    self.lanthanum_store.value<LANTHANUM>() + self.lanthanum_mine.amount_produced(now) >= lan_cost &&
    self.thorium_store.value<THORIUM>() + self.thorium_mine.amount_produced(now) >= tho_cost
}

// These functions are yet to be used, but will be great when trading is implemented
/// Checks if the planet has enough erbium to perform an operation
fun has_enough_erbium(self: &Planet, erb_cost: u64, now: u64): bool {
    self.erbium_store.value<ERBIUM>() + self.erbium_mine.amount_produced(now) >= erb_cost
}

/// Checks if the planet has enough lanthanum to perform an operation
fun has_enough_lanthanum(self: &Planet, lan_cost: u64, now: u64): bool {
    self.lanthanum_store.value<LANTHANUM>() + self.lanthanum_mine.amount_produced(now) >= lan_cost
}

/// Checks if the planet has enough thorium to perform an operation
fun has_enough_thorium(self: &Planet, tho_cost: u64, now: u64): bool {
    self.thorium_store.value<THORIUM>() + self.thorium_mine.amount_produced(now) >= tho_cost
}

// === Test Functions ===
