// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Mines keep track of how much free units of the producing element the planet can use
/// For keeping at the minimum the calls to shared objects, instead of minting every unit of element
/// that the mine has produced, every time a planet expend X units of T, first reduces the amount that the mine should have produced
/// if its not enough, it will use the funds from trading, which are actual minted balances stored in the planet
module trade_wars::element_mine;

// === Imports ===
use sui::balance::Balance;
use trade_wars::universe_element_source::UniverseElementSource;

// === Errors ===

// === Constants ===
const MillisecondsPerSecond: u64 = 1000;

// === Structs ===
/// Represents a mine that produces a specific element type
public struct ElementMine<phantom T> has store {
    /// ID of the universe element source this mine is connected to
    source: ID,
    /// Current level of the mine (affects production rate)
    level: u64,
    /// Timestamp of the last element extraction
    last_extraction_time: u64,
    /// Production factor of the mine
    production_factor: u64,
    /// Base cost in Erbium to upgrade this mine (multiplied by level)
    erbium_upgrade_cost: u64,
    /// Base cost in Lanthanum to upgrade this mine (multiplied by level)
    lanthanum_upgrade_cost: u64,
    /// Base cost in Thorium to upgrade this mine (multiplied by level)
    thorium_upgrade_cost: u64,
}

// === Events ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===
/// Creates a new ElementMine connected to the provided element source
public(package) fun create_mine<T>(source: &UniverseElementSource<T>, now: u64): ElementMine<T> {
    ElementMine {
        source: object::id(source),
        level: 1,
        last_extraction_time: now,
        production_factor: source.mines_parameters<T>().get_production_factor(),
        erbium_upgrade_cost: source.mines_parameters<T>().get_erbium_upgrade_cost(),
        lanthanum_upgrade_cost: source.mines_parameters<T>().get_lanthanum_upgrade_cost(),
        thorium_upgrade_cost: source.mines_parameters<T>().get_thorium_upgrade_cost(),
    }
}

/// Returns the current level of the mine
public(package) fun level<T>(self: &ElementMine<T>): u64 {
    self.level
}

/// Returns the production factor of the mine
public(package) fun production_factor<T>(self: &ElementMine<T>): u64 {
    self.production_factor
}

/// Returns the cost in erbium to upgrade this mine, adjusted for mine level
public(package) fun erbium_upgrade_cost<T>(self: &ElementMine<T>): u64 {
    self.erbium_upgrade_cost * self.level
}

/// Returns the cost in lanthanum to upgrade this mine, adjusted for mine level
public(package) fun lanthanum_upgrade_cost<T>(self: &ElementMine<T>): u64 {
    self.lanthanum_upgrade_cost * self.level
}

/// Returns the cost in thorium to upgrade this mine, adjusted for mine level
public(package) fun thorium_upgrade_cost<T>(self: &ElementMine<T>): u64 {
    self.thorium_upgrade_cost * self.level
}

/// Returns the last extraction time
public(package) fun last_extraction_time<T>(self: &ElementMine<T>): u64 {
    self.last_extraction_time
}

/// Returns the amount of element produced since the last extraction
public(package) fun amount_produced<T>(self: &ElementMine<T>, now: u64): u64 {
    let seconds_since_last_extraction = (now - self.last_extraction_time) / MillisecondsPerSecond;
    seconds_since_last_extraction * self.level / self.production_factor
}

/// Upgrades the mine level by consuming the required elements
public(package) fun upgrade_mine<T>(
    self: &mut ElementMine<T>
) {
    self.level = self.level + 1;
}

/// Extracts produced elements from the mine based on time passed since last extraction
public(package) fun extract_element<T>(
    self: &mut ElementMine<T>,
    source: &mut UniverseElementSource<T>,
    now: u64,
): Balance<T> {
    // Get as much balance from the source as has been produced since the last extraction
    let extraction = source.extract(self.amount_produced(now));
    // Update the last extraction time to the current time
    self.last_extraction_time = now;
    // After extracting, update parameters from source. Only way for players to opt out of parameters
    // updates is to not extract for a while. Seems pretty fair.
    self.update_parameters<T>(source);
    extraction
}

/// Returns the element to the source
public(package) fun use_element<T>(
    self: &mut ElementMine<T>,
    source: &mut UniverseElementSource<T>,
    element: Balance<T>,
) {
    // When "burning" the used element, update parameters from source
    self.update_parameters<T>(source);
    source.return_reserves<T>(element);
}

// === Private Functions ===
/// Updates the mine's upgrade costs based on the current source configuration
fun update_parameters<T>(self: &mut ElementMine<T>, source: &UniverseElementSource<T>) {
    self.production_factor = source.mines_parameters<T>().get_production_factor();
    self.erbium_upgrade_cost = source.mines_parameters<T>().get_erbium_upgrade_cost();
    self.lanthanum_upgrade_cost = source.mines_parameters<T>().get_lanthanum_upgrade_cost();
    self.thorium_upgrade_cost = source.mines_parameters<T>().get_thorium_upgrade_cost();
}