// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::element_store;

use sui::balance::{Self, Balance};
use sui::bag::{Self, Bag};
use trade_wars::erbium::{Self, ERBIUM};
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

public(package) fun create_planet_stores(ctx: &mut TxContext): Bag {
    let stores = bag::new(ctx);
    stores.add(erbium::get_erbium_witness(), create_store<ERBIUM>());
    //stores.add(lanthanum::get_lanthanum_witness(), create_store<LANTHANUM>());
    //stores.add(thorium::get_thorium_witness(), create_store<THORIUM>());
    stores
}

public fun join<T>(
    self: &mut ElementStore<T>,
    balance: Balance<T>
) {
    self.balance.join<T>(balance);
}