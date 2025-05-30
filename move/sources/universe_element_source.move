// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for managing universe-specific element sources.
/// These sources act as reservoirs for elements within a specific universe,
/// allowing each universe to maintain its own independent economy.
module trade_wars::universe_element_source;

// === Imports ===
use sui::balance::{Self, Balance};
use sui::event;
use trade_wars::mine_configuration_parameters::MineConfigurationParameters;

// === Errors ===
/// Error code when there aren't enough reserves to extract elements
const ENotEnoughReserves: u64 = 0;

// === Constants ===

// === Structs ===
/// Element source specific to a universe, holds production configuration
/// and element reserves for a particular universe
public struct UniverseElementSource<phantom T> has key, store {
    id: UID,
    /// ID of the universe this source belongs to
    universe: ID,
    /// ID of the main global element source
    main_source: ID,
    /// Threshold below which a low reserves warning is triggered
    refill_threshold: u64,
    /// Balance of element T available in this universe
    reserves: Balance<T>,
    /// Configuration parameters for mines of element T in this universe
    mine_parameters: MineConfigurationParameters<T>,
}

// === Events ===
/// Event emitted when a source's reserves are running low
public struct UniverseElementSourceLowReserves has copy, drop {
    /// ID of the source with low reserves
    id: ID,
}

// === Init Function ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===
/// Creates a new UniverseElementSource for the specified universe
public(package) fun create_universe_element_source<T>(
    universe: ID,
    main_source: ID,
    refill_threshold: u64,
    mine_parameters: MineConfigurationParameters<T>,
    ctx: &mut TxContext,
): UniverseElementSource<T> {
    UniverseElementSource<T> {
        id: object::new(ctx),
        universe,
        main_source,
        refill_threshold,
        mine_parameters,
        reserves: balance::zero<T>(),
    }
}

/// Returns the ID of the universe this source is connected to
public(package) fun universe<T>(self: &UniverseElementSource<T>): ID {
    self.universe
}

/// Returns the ID of the main source this source draws from
public(package) fun main_source<T>(self: &UniverseElementSource<T>): ID {
    self.main_source
}

/// Returns the refill threshold for this source
public(package) fun refill_threshold<T>(self: &UniverseElementSource<T>): u64 {
    self.refill_threshold
}

/// Returns the mine parameters for this source
public(package) fun mines_parameters<T>(
    self: &UniverseElementSource<T>,
): MineConfigurationParameters<T> {
    self.mine_parameters
}

/// Returns the current reserves value for this source
public(package) fun reserves_value<T>(self: &UniverseElementSource<T>): u64 {
    self.reserves.value()
}

/// Sets the refill threshold for this source
public(package) fun set_refill_threshold<T>(self: &mut UniverseElementSource<T>, threshold: u64) {
    self.refill_threshold = threshold;
}

/// Updates the mine parameters for this source
public(package) fun update_mines_parameters<T>(
    self: &mut UniverseElementSource<T>,
    parameters: MineConfigurationParameters<T>,
) {
    self.mine_parameters = parameters;
}

/// Extracts a specific amount of element from this source
public(package) fun extract<T>(self: &mut UniverseElementSource<T>, amount: u64): Balance<T> {
    assert!(self.reserves.value() >= amount, ENotEnoughReserves);
    let extraction = self.reserves.split(amount);
    if (self.reserves.value() < self.refill_threshold) {
        event::emit(UniverseElementSourceLowReserves {
            id: object::id(self),
        });
    };
    extraction
}

/// Adds the provided balance to this source's reserves
public(package) fun join<T>(self: &mut UniverseElementSource<T>, balance: Balance<T>): u64 {
    self.reserves.join(balance)
}

/// Returns element reserves to this source
public(package) fun return_reserves<T>(self: &mut UniverseElementSource<T>, erb: Balance<T>) {
    self.reserves.join(erb);
}

// === Private Functions ===