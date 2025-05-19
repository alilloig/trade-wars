// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

// Mines keep track of how much free units of the producing element the planet can use
// For keeping at the minimum the calls to shared objects, instead of minting every unit of element
// that the mine has produced, every time a planet expend X units of T, first reduces the amount that the mine should have produced
// if its not enough, it will use the funds from trading, which are actual minted balances stored in the planet
module trade_wars::element_mine;

// === Imports ===
use trade_wars::universe::{Self, UniverseElementSource};
use sui::table::{Self, Table};
use sui::bag::{Self, Bag};
use sui::balance::{Self, Balance};

// === Errors ===

// === Constants ===
const MillisecondsPerMinute: u64 = 60000;

// === Structs ===
// ::Mine
public struct ElementMine<phantom T> has store {
    source: ID,
    level: u64,
    last_extraction: u64,
    //upgrade_cost: Table<Element, u64>,
}

public(package) fun create_mine<T>(source: ID): ElementMine<T> {
    ElementMine {
        source,
        level: 1,
        last_extraction: 0,
        //upgrade_cost: get_upgrade_costs(&info.element(), ctx),
    }
}

public(package) fun level_up_mine<T>(self: &mut ElementMine<T>, required_elements: &mut Bag) {
    self.level = self.level + 1
}

public(package) fun extract<T>(self: &mut ElementMine<T>, source: &mut UniverseElementSource<T>, time: u64): Balance<T> {
    let minutes_since_last_extraction = (time - self.last_extraction) / (MillisecondsPerMinute * source.production());
    let mev = minutes_since_last_extraction * self.level;
    source.extract(mev)
}

// ::MiningCapability
public struct MiningCapability<phantom T> has store {}

public(package) fun create_mining_capability<T>(): MiningCapability<T> {
    MiningCapability { }
}

// === Events ===

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===

// === Test Functions ===