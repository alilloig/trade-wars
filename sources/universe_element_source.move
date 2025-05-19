// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::universe_element_source;

// === Imports ===
// trade_wars::
use trade_wars::mine_configuration_parameters::{MineConfigurationParameters};
// sui::   
use sui::balance::{Self, Balance};
use sui::event::{Self};

// === Errors ===
const ENotEnoughReserves: u64 = 0;

// === Constants ===

// === Structs ===

// ::UniverseElementSource
public struct UniverseElementSource<phantom T> has key, store {
    id: UID,
    universe: ID,
    main_source: ID,
    refill_threshold: u64,
    reserves: Balance<T>,
    mine_parameters: MineConfigurationParameters<T>,
}

// === ::UniverseElementSource Package Functions ===
public(package) fun create_universe_element_source<T>(
    universe: ID,
    main_source: ID,
    refill_threshold: u64,
    mine_parameters: MineConfigurationParameters<T>,
    ctx: &mut TxContext
): UniverseElementSource<T> {
    UniverseElementSource<T> {
        id: object::new(ctx),
        universe,
        main_source,
        refill_threshold,
        mine_parameters,
        reserves: balance::zero<T>()
    }
}

// === ::UniverseElementSource Package Getters ===
public(package) fun universe<T>(self: &UniverseElementSource<T>): ID {
    self.universe
}

public(package) fun main_source<T>(self: &UniverseElementSource<T>): ID {
    self.main_source
}

public(package) fun refill_threshold<T>(self: &UniverseElementSource<T>): u64 {
    self.refill_threshold
}

public(package) fun mines_parameters<T>(self: &UniverseElementSource<T>): MineConfigurationParameters<T> {
    self.mine_parameters
}

public(package) fun reserves_value<T>(self: &UniverseElementSource<T>): u64 {
    self.reserves.value()
}

// === ::UniverseElementSource Package Setters ===
public(package) fun set_refill_threshold<T>(self: &mut UniverseElementSource<T>, threshold: u64) {
    self.refill_threshold = threshold;
}

public(package) fun update_mines_parameters<T>(
    self: &mut UniverseElementSource<T>, 
    parameters: MineConfigurationParameters<T>
) {
    self.mine_parameters = parameters;
}

public(package) fun extract<T>(self: &mut UniverseElementSource<T>, amount: u64): Balance<T> {
    assert!(self.reserves.value() <= amount, ENotEnoughReserves);
    let extraction = self.reserves.split(amount);
    if (self.reserves.value() < self.refill_threshold) {
        event::emit(UniverseElementSourceLowReserves {
            id: object::id(self)
        });
    };
    extraction
}

public(package) fun join<T>(self: &mut UniverseElementSource<T>, balance: Balance<T>): u64 {
    self.reserves.join(balance)
}

public(package) fun return_reserves<T>(self: &mut UniverseElementSource<T>, erb: Balance<T>) {
    self.reserves.join(erb);
}

// === Events ===
public struct UniverseElementSourceLowReserves has copy, drop {
    id: ID
}

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===

// === Test Functions ===