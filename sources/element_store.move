// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::element_store;

use sui::balance::{Self, Balance};
//use trade_wars::erbium::{Self, ERBIUM};
//use trade_wars::lanthanum::{Self, LANTHANUM};
//use trade_wars::thorium::{Self, THORIUM};

public struct ElementStore<phantom T> has store {
    balance: Balance<T>
}

public(package) fun create_store<T>(): ElementStore<T> {
    ElementStore<T> {
        balance: balance::zero<T>(),
    }
}

public(package) fun split<T>(self: &mut ElementStore<T>, amount: u64): Balance<T> {
    self.balance.split(amount)
}

public fun join<T>(
    self: &mut ElementStore<T>,
    balance: Balance<T>
) {
    self.balance.join<T>(balance);
}