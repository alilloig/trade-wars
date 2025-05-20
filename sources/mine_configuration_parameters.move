// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::mine_configuration_parameters;

// === Imports ===

// === Errors ===

// === Constants ===

// === Structs ===
// ::MinesConfigurationParameters
public struct MineConfigurationParameters<phantom T> has store, copy, drop {
    production_factor: u64,
    erbium_upgrade_cost: u64,
    lanthanum_upgrade_cost: u64,
    thorium_upgrade_cost: u64,
}

// ::constructors
public(package) fun create_mine_configuration_parameters<T>(
    production_factor: u64,
    erbium_upgrade_cost: u64,
    lanthanum_upgrade_cost: u64,
    thorium_upgrade_cost: u64,
): MineConfigurationParameters<T> {
    MineConfigurationParameters<T> {
        production_factor,
        erbium_upgrade_cost,
        lanthanum_upgrade_cost,
        thorium_upgrade_cost,
    }
}

// ::getters
public(package) fun get_production_factor<T>(self: &MineConfigurationParameters<T>): u64 {
    self.production_factor
}

public(package) fun get_erbium_upgrade_cost<T>(self: &MineConfigurationParameters<T>): u64 {
    self.erbium_upgrade_cost
}

public(package) fun get_lanthanum_upgrade_cost<T>(self: &MineConfigurationParameters<T>): u64 {
    self.lanthanum_upgrade_cost
}

public(package) fun get_thorium_upgrade_cost<T>(self: &MineConfigurationParameters<T>): u64 {
    self.thorium_upgrade_cost
}

// ::setters
// ::public functions
// ::view functions
// ::admin functions
// ::package functions
// ::private functions


// === Events ===

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===

// === Test Functions ===