// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

///
module trade_wars::element_source;

// === Imports ===
use sui::balance::Balance;
use sui::coin::TreasuryCap;
use trade_wars::mine_configuration_parameters::MineConfigurationParameters;

// === Errors ===

// === Constants ===

// === Structs ===
/// ElementSource is a wrapper for treasury allowing direct minting of elements for mines.
/// With mint-on-demand, tokens are minted directly when mines extract resources.
public struct ElementSource<phantom T> has key, store {
    id: UID,
    treasury: TreasuryCap<T>,
    mine_parameters: MineConfigurationParameters<T>,
}

// === Events ===

// === Init Function ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===
/// Creates a new ElementSource with the provided treasury and mine parameters
public(package) fun create_source<T>(
    treasury: TreasuryCap<T>,
    mine_parameters: MineConfigurationParameters<T>,
    ctx: &mut TxContext,
): ElementSource<T> {
    ElementSource<T> {
        id: object::new(ctx),
        treasury,
        mine_parameters,
    }
}

/// Mints tokens for mine extraction (mint-on-demand)
public(package) fun mint_for_extraction<T>(
    self: &mut ElementSource<T>,
    amount: u64,
): Balance<T> {
    self.treasury.mint_balance<T>(amount)
}

/// Burns tokens that were spent on upgrades
public(package) fun burn_resources<T>(self: &mut ElementSource<T>, balance: Balance<T>) {
    self.treasury.supply_mut().decrease_supply(balance);
}

/// Returns the mine parameters for this element type
public(package) fun get_mine_parameters<T>(
    self: &ElementSource<T>,
): MineConfigurationParameters<T> {
    self.mine_parameters
}

/// Updates the mine parameters for this element type
public(package) fun set_mine_parameters<T>(
    self: &mut ElementSource<T>,
    parameters: MineConfigurationParameters<T>,
) {
    self.mine_parameters = parameters;
}

// === Private Functions ===