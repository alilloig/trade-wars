// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::element_source;

// === Imports ===
// sui::
use sui::event::{Self};
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin, TreasuryCap};
// trade_wars::
use trade_wars::universe_element_source::{UniverseElementSource};
use trade_wars::universe::{UniverseCreatorCapability};
use trade_wars::mine_configuration_parameters::{Self, MineConfigurationParameters};
use trade_wars::erbium::{ERBIUM};
//use trade_wars::lanthanum::{LANTHANUM};
//use trade_wars::thorium::{THORIUM};

// === Errors ===
const EUnnecessaryRefill: u64 = 4;

// === Constants ===
const InitialRefillQty: u64 = 1000000;
const InitialRefillThreshold: u64 = 500000;

// === Structs ===
// === ::ElementSource ===
/// ElementSource is a wrapper for treasury allowing permissionless minting of elements
public struct ElementSource<phantom T> has key, store {
    id: UID,
    treasury: TreasuryCap<T>,
    sources_refill_qty: u64,
    sources_refill_threshold: u64,
    mine_parameters: MineConfigurationParameters<T>,
}

// === ::ElementSource Package Functions ===
public(package) fun create_source<T>(
    treasury: TreasuryCap<T>,
    mine_parameters: MineConfigurationParameters<T>,
    ctx: &mut TxContext
): ElementSource<T> {
    ElementSource<T> {
        id: object::new(ctx),
        treasury,
        sources_refill_qty: InitialRefillQty,
        sources_refill_threshold: InitialRefillThreshold,
        mine_parameters
    }
}

// === ::ElementSource Package Getter Functions ===
public(package) fun get_sources_refill_qty<T>(self: &ElementSource<T>): u64 {
    self.sources_refill_qty
}

public(package) fun get_sources_refill_threshold<T>(self: &ElementSource<T>): u64 {
    self.sources_refill_threshold
}

public(package) fun get_mine_parameters<T>(self: &ElementSource<T>): MineConfigurationParameters<T> {
    self.mine_parameters
}

// === ::ElementSource Package Setter Functions ===
public(package) fun set_sources_refill_qty<T>(self: &mut ElementSource<T>, qty: u64) {
    self.sources_refill_qty = qty;
}   

public(package) fun set_sources_refill_threshold<T>(self: &mut ElementSource<T>, threshold: u64) {
    self.sources_refill_threshold = threshold;
}

public(package) fun set_mine_parameters<T>(
    self: &mut ElementSource<T>, 
    parameters: MineConfigurationParameters<T>
) {
    self.mine_parameters = parameters;
}

// === ::ElementSource Entry Functions ===
// Any universe admin can call this to refill its source if it's below the threshold
entry fun refill_universe_source<T>(
    self: &mut ElementSource<T>, 
    universe_source: &mut UniverseElementSource<T>, 
    _cap: &UniverseCreatorCapability
): u64 {
    assert!(self.sources_refill_threshold < universe_source.reserves_value<T>(), EUnnecessaryRefill);
    universe_source.update_mines_parameters<T>(self.mine_parameters);
    let refill_qty = self.get_sources_refill_qty<T>();
    universe_source.join(self.mint_balance<T>(refill_qty))
}

// === Events ===

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===
fun mint_balance<T>(
    self: &mut ElementSource<T>,
    amount: u64
): Balance<T> {
    self.treasury.mint_balance<T>(amount)
}

// === Test Functions ===