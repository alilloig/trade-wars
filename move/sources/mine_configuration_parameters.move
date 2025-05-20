// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::mine_configuration_parameters;

// === Imports ===

// === Errors ===

// === Constants ===

// === Structs ===
/// Configuration parameters for element mines
/// These parameters control the production rate and upgrade costs
public struct MineConfigurationParameters<phantom T> has copy, drop, store {
    production_factor: u64,
    erbium_upgrade_cost: u64,
    lanthanum_upgrade_cost: u64,
    thorium_upgrade_cost: u64,
}

// ::constructors
/// Creates a new MineConfigurationParameters instance with the specified values
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
/// Returns the production factor for mines of this element type
public(package) fun get_production_factor<T>(self: &MineConfigurationParameters<T>): u64 {
    self.production_factor
}

/// Returns the cost in erbium to upgrade mines of this element type
public(package) fun get_erbium_upgrade_cost<T>(self: &MineConfigurationParameters<T>): u64 {
    self.erbium_upgrade_cost
}

/// Returns the cost in lanthanum to upgrade mines of this element type
public(package) fun get_lanthanum_upgrade_cost<T>(self: &MineConfigurationParameters<T>): u64 {
    self.lanthanum_upgrade_cost
}

/// Returns the cost in thorium to upgrade mines of this element type
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
