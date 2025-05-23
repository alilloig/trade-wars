// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::overseer;

use sui::clock::Clock;
use sui::object_table::{Self, ObjectTable};
use sui::random::Random;
use sui::table::{Self, Table};
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::planet::{Planet, PlanetCap};
use trade_wars::thorium::THORIUM;
use trade_wars::universe::Universe;
use trade_wars::universe_element_source::UniverseElementSource;

// === Errors ===
const EOverseerAlreadyJoinedUniverse: u64 = 0;
const EUniverseNotOpen: u64 = 1;
// === Constants ===

// === Structs ===
/// Represents a player in the game who can control planets and build their empire
public struct Overseer has key {
    id: UID,
    universes: vector<ID>,
    planets: Table<ID, vector<ID>>,
    empire: ObjectTable<ID, Table<ID, PlanetCap>>,
}

/// Creates a new Overseer object
fun new_overseer(ctx: &mut TxContext): Overseer {
    Overseer {
        id: object::new(ctx),
        universes: vector::empty(),
        planets: table::new<ID, vector<ID>>(ctx),
        empire: object_table::new<ID, Table<ID, PlanetCap>>(ctx),
    }
}

// === Entry Functions ===
/// Creates and transfers a new Overseer object to the transaction sender
entry fun vest_overseer(ctx: &mut TxContext) {
    transfer::transfer(new_overseer(ctx), ctx.sender())
}

// Player signed PTB
// Get a &mut to shared Universe. Previously a PTB for retrieving opened universes from TradeWarsInfo and their displays needs to be done for giving players a list of available universes
// Get a &mut to address owned Overseer
// MakeMoveCall tradewars.join_universe(overseer)
// Allows an overseer to join a universe and be assigned a random planet
entry fun join_universe(
    self: &mut Overseer,
    universe: &mut Universe,
    erb_source: &UniverseElementSource<ERBIUM>,
    lan_source: &UniverseElementSource<LANTHANUM>,
    tho_source: &UniverseElementSource<THORIUM>,
    r: &Random,
    c: &Clock,
    ctx: &mut TxContext,
) {
    assert!(!self.has_joined_universe(object::id(universe)), EOverseerAlreadyJoinedUniverse);
    assert!(universe.open(), EUniverseNotOpen);
    // aux variable for the universe id
    let universe_id = object::id(universe);
    // Initialize a new universe table in the empire
    self.empire.add(universe_id, table::new<ID, PlanetCap>(ctx));
    // Initialize a new planet table in the overseer
    self.planets.add(universe_id, vector::empty<ID>());
    // occupy a planet and get a planet capability
    let planet_cap = universe.occupy_planet(
        erb_source,
        lan_source,
        tho_source,
        c.timestamp_ms(),
        &mut r.new_generator(ctx),
        ctx,
    );
    // Add the planet to the overseer's list of planets
    self.planets.borrow_mut<ID, vector<ID>>(universe_id).push_back(planet_cap.planet());
    // add the planet capability to the universe table
    self
        .empire
        .borrow_mut<ID, Table<ID, PlanetCap>>(universe_id)
        .add<ID, PlanetCap>(planet_cap.planet(), planet_cap);
    // Add the universe to the overseer's list of joined universes
    vector::push_back(&mut self.universes, universe_id);
}

// Called by the player whenever they want to upgrade a planet's mine
entry fun upgrade_erbium_planet_mine(
    self: &Overseer,
    universe: ID,
    planet: &mut Planet,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    c: &Clock,
) {
    let planet_id = object::id(planet);
    planet.upgrade_erbium_mine(
        self.get_planet_cap_ref(universe, planet_id),
        erb_source,
        lan_source,
        tho_source,
        c.timestamp_ms(),
    );
}

entry fun upgrade_lanthanum_planet_mine(
    self: &Overseer,
    universe: ID,
    planet: &mut Planet,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    c: &Clock,
) {
    let planet_id = object::id(planet);
    planet.upgrade_lanthanum_mine(
        self.get_planet_cap_ref(universe, planet_id),
        erb_source,
        lan_source,
        tho_source,
        c.timestamp_ms(),
    );
}

entry fun upgrade_thorium_planet_mine(
    self: &Overseer,
    universe: ID,
    planet: &mut Planet,
    erb_source: &mut UniverseElementSource<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    c: &Clock,
) {
    let planet_id = object::id(planet);
    planet.upgrade_thorium_mine(
        self.get_planet_cap_ref(universe, planet_id),
        erb_source,
        lan_source,
        tho_source,
        c.timestamp_ms(),
    );
}

// === Events ===
// === Method Aliases ===
// === Public Functions ===
public fun joined_universes(self: &Overseer): vector<ID> {
    self.universes
}

// === View Functions ===
public fun get_universe_planets(self: &Overseer, universe: ID): vector<ID> {
    *self.planets.borrow<ID, vector<ID>>(universe)
}



// === Admin Functions ===
// === Package Functions ===
// === Private Functions ===
/// Checks if the overseer has already joined a specific universe
fun has_joined_universe(self: &Overseer, universe: ID): bool {
    return vector::contains(&self.universes, &universe)
}

// Returns a &PlanetCap for the specified planet in the specified universe
fun get_planet_cap_ref(self: &Overseer, universe: ID, planet: ID): &PlanetCap {
    self.empire.borrow<ID, Table<ID, PlanetCap>>(universe).borrow(planet)
}

// === Test Functions ===
