// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::overseer;

use sui::random::Random;
use sui::table::{Self, Table};
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::planet::PlanetCap;
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
    empire: Table<ID, vector<PlanetCap>>,
}

/// Creates a new Overseer object
fun new_overseer(ctx: &mut TxContext): Overseer {
    Overseer {
        id: object::new(ctx),
        empire: table::new<ID, vector<PlanetCap>>(ctx),
    }
}

/// Allows an overseer to join a universe and be assigned a random planet
/// Player signed PTB
/// Get a &mut to shared Universe. Previously a PTB for retrieving opened universes from TradeWarsInfo and their displays needs to be done for giving players a list of available universes
/// Get a &mut to address owned Overseer
/// MakeMoveCall tradewars.join_universe(overseer)
entry fun join_universe(
    self: &mut Overseer,
    universe: &mut Universe,
    erb_source: &UniverseElementSource<ERBIUM>,
    lan_source: &UniverseElementSource<LANTHANUM>,
    tho_source: &UniverseElementSource<THORIUM>,
    r: &Random,
    ctx: &mut TxContext,
) {
    assert!(!self.has_joined_universe(object::id(universe)), EOverseerAlreadyJoinedUniverse);
    assert!(universe.get_info().open(), EUniverseNotOpen);
    // add a new universe to the empire and save the planet capability in it
    self.empire.add(object::id(universe), vector::empty<PlanetCap>());
    self
        .empire[object::id(universe)]
        .push_back(universe.occupy_planet(
            erb_source,
            lan_source,
            tho_source,
            &mut r.new_generator(ctx),
            ctx,
        ));
}

/// Checks if the overseer has already joined a specific universe
fun has_joined_universe(self: &Overseer, universe: ID): bool {
    return self.empire.contains(universe)
}

// === Events ===
// === Method Aliases ===

// === Public Functions ===
/// Creates and transfers a new Overseer object to the transaction sender
entry fun vest_overseer(ctx: &mut TxContext) {
    transfer::transfer(new_overseer(ctx), ctx.sender())
}

// === View Functions ===
// === Admin Functions ===
// === Package Functions ===
// === Private Functions ===
// === Test Functions ===
