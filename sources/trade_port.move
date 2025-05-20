// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::trade_port;

// === Imports ===
use sui::balance::{Balance};

// === Errors ===

// === Constants ===

// === Structs ===
// ::TradePort
public struct TradePort<T,K> has store {
    offer_element: T,
    ask_element: K,
    quote: u64,
    offer_store: Option<Balance<T>>
}

// === Events ===

// === Method Aliases ===

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===

// === Test Functions ===