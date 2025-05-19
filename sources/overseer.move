// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::overseer;

// === Imports ===
use trade_wars::universe::{Self, Universe};
use trade_wars::planet::{Self, PlanetInfo, PlanetCapability};
use sui::random::{Self, Random, RandomGenerator};
use sui::table::{Self, Table};

// === Errors ===
const EOverseerAlreadyJoinedUniverse: u64 = 0;

// === Constants ===

// === Structs ===
// ::Overseer
public struct Overseer has key {
    id: UID,
    empire: Table<ID, vector<PlanetCapability>>
}

fun new_overseer(ctx: &mut TxContext): Overseer {
    Overseer {
        id: object::new(ctx),
        empire: table::new<ID, vector<PlanetCapability>>(ctx)
    }
}

// this method will request to join a certain universe
// Player signed PTB
// Get a &mut to shared Universe. Previously a PTB for retrieving opened universes from TradeWarsInfo and their displays needs to be done for giving players a list of available universes
// Get a &mut to address owned Overseer
// MakeMoveCall tradewars.join_universe(overseer)
entry fun join_universe(self: &mut Overseer, universe: &mut Universe, r: &Random, ctx: &mut TxContext) {
    let universe_id = object::id(universe);
    assert!(!self.has_joined_universe(universe_id), EOverseerAlreadyJoinedUniverse);
    let mut randomizer = random::new_generator(r, ctx);
    self.empire.add(universe_id, vector::empty<PlanetCapability>());
    self.empire[universe_id].push_back(planet::occupy_planet(info, ctx))
}

/// Overseer cannot request to join universe twice
fun has_joined_universe(self: &Overseer, universe: ID): bool {
    return self.empire.contains(universe)
}


// === Events ===
// === Method Aliases ===

// === Public Functions ===
entry fun vest_overseer(ctx: &mut TxContext) {
    transfer::transfer(new_overseer(ctx), ctx.sender())
}

// === View Functions ===
// === Admin Functions ===
// === Package Functions ===
// === Private Functions ===
// === Test Functions ===