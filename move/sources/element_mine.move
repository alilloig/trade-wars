// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Mines keep track of how much free units of the producing element the planet can use
/// For keeping at the minimum the calls to shared objects, instead of minting every unit of element
/// that the mine has produced, every time a planet expend X units of T, first reduces the amount that the mine should have produced
/// if its not enough, it will use the funds from trading, which are actual minted balances stored in the planet
module trade_wars::element_mine;

// === Imports ===
// trade_wars::
use trade_wars::universe_element_source::{UniverseElementSource};
use trade_wars::erbium::{ERBIUM};
use trade_wars::lanthanum::{LANTHANUM};
use trade_wars::thorium::{THORIUM};
// sui::
use sui::balance::{Balance};

// === Errors ===
/// Error code when there's not enough Erbium to perform an operation
const ENotEnoughERBIUM: u64 = 0;
/// Error code when there's not enough Lanthanum to perform an operation
const ENotEnoughLANTHANUM: u64 = 1;
/// Error code when there's not enough Thorium to perform an operation
const ENotEnoughTHORIUM: u64 = 2;

// === Constants ===
/// Conversion factor for milliseconds to minutes
const MillisecondsPerMinute: u64 = 60000;

// === Structs ===
// === ::ElementMine ===
/// Represents a mine that produces a specific element type
public struct ElementMine<phantom T> has store {
    /// ID of the universe element source this mine is connected to
    source: ID,
    /// Current level of the mine (affects production rate)
    level: u64,
    /// Timestamp of the last element extraction
    last_extraction: u64,
    /// Base cost in Erbium to upgrade this mine (multiplied by level)
    erbium_upgrade_cost: u64,
    /// Base cost in Lanthanum to upgrade this mine (multiplied by level)
    lanthanum_upgrade_cost: u64,
    /// Base cost in Thorium to upgrade this mine (multiplied by level)
    thorium_upgrade_cost: u64,
}

// === ::ElementMine Package Functions ===
/// Creates a new ElementMine connected to the provided element source
public(package) fun create_mine<T>(
    source: &UniverseElementSource<T>
): ElementMine<T> {
    ElementMine {
        source: object::id(source),
        level: 1,
        last_extraction: 0,
        erbium_upgrade_cost: source.mines_parameters<T>().get_erbium_upgrade_cost(),
        lanthanum_upgrade_cost: source.mines_parameters<T>().get_lanthanum_upgrade_cost(),
        thorium_upgrade_cost: source.mines_parameters<T>().get_thorium_upgrade_cost(),
    }
}

/// Returns the cost in erbium to upgrade this mine, adjusted for mine level
public(package) fun get_upgrade_erbium_cost<T>(self: &ElementMine<T>): u64 {
    self.erbium_upgrade_cost * self.level
}

/// Returns the cost in lanthanum to upgrade this mine, adjusted for mine level
public(package) fun get_upgrade_lanthanum_cost<T>(self: &ElementMine<T>): u64 {
    self.lanthanum_upgrade_cost * self.level
}

/// Returns the cost in thorium to upgrade this mine, adjusted for mine level
public(package) fun get_upgrade_thorium_cost<T>(self: &ElementMine<T>): u64 {
    self.thorium_upgrade_cost * self.level
}

/// Upgrades the mine level by consuming the required elements
public(package) fun upgrade_mine<T>(
    self: &mut ElementMine<T>, 
    erb_source: &mut UniverseElementSource<ERBIUM>,
    erb: Balance<ERBIUM>,
    lan_source: &mut UniverseElementSource<LANTHANUM>,
    lan: Balance<LANTHANUM>,
    tho_source: &mut UniverseElementSource<THORIUM>,
    tho: Balance<THORIUM>
) {
    assert!(erb.value() >= self.get_upgrade_erbium_cost(), ENotEnoughERBIUM);
    assert!(lan.value() >= self.get_upgrade_lanthanum_cost(), ENotEnoughLANTHANUM);
    assert!(tho.value() >= self.get_upgrade_thorium_cost(), ENotEnoughTHORIUM);
    erb_source.return_reserves<ERBIUM>(erb);
    lan_source.return_reserves<LANTHANUM>(lan);
    tho_source.return_reserves<THORIUM>(tho);
    self.level = self.level + 1;
}

/// Extracts produced elements from the mine based on time passed since last extraction
public(package) fun extract<T>(self: &mut ElementMine<T>, source: &mut UniverseElementSource<T>, time: u64): Balance<T> {
    self.update_upgrade_costs<T>(source);
    let minutes_since_last_extraction = (time - self.last_extraction) / (MillisecondsPerMinute);
    let mev = minutes_since_last_extraction * self.level / source.mines_parameters<T>().get_production_factor();
    self.last_extraction = time;
    source.extract(mev)
}

/// Updates the mine's upgrade costs based on the current source configuration
fun update_upgrade_costs<T>(self: &mut ElementMine<T>, source: &UniverseElementSource<T>) {
    self.erbium_upgrade_cost = source.mines_parameters<T>().get_erbium_upgrade_cost();
}

// === Events ===

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===

// === Test Functions ===