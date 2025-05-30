// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for the Lanthanum resource, one of the three primary elements in Trade Wars.
/// Lanthanum is implemented as a fungible token that can be mined, traded, and used
/// for upgrading facilities and other game mechanics.
module trade_wars::lanthanum;

// === Imports ===
use sui::coin;
use sui::url;

// === Errors ===

// === Constants ===

// === Structs ===
/// One-time witness for the LANTHANUM module
public struct LANTHANUM has drop {}

// === Events ===

// === Init Function ===
/// Initializes the Lanthanum currency
fun init(witness: LANTHANUM, ctx: &mut TxContext) {
    // Create the Erbium currency, store the treasury capability and share the element mine
    let (treasury, metadata) = coin::create_currency<LANTHANUM>(
        witness,
        9,
        b"LAN",
        b"Lanthanum",
        b"Lanthanum, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(
            url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/lanthanum.png"),
        ),
        ctx,
    );
    // Freeze Lanthanum metadata
    transfer::public_freeze_object(metadata);
    // Transfer lanthanum treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===