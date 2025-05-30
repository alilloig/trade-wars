// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for the Thorium resource, one of the three primary elements in Trade Wars.
/// Thorium is implemented as a fungible token that can be mined, traded, and used
/// for upgrading facilities and other game mechanics.
module trade_wars::thorium;

// === Imports ===
use sui::coin;
use sui::url;

// === Errors ===

// === Constants ===

// === Structs ===
/// One-time witness for the THORIUM module
public struct THORIUM has drop {}

// === Events ===

// === Init Function ===
/// Initializes the Thorium currency
fun init(witness: THORIUM, ctx: &mut TxContext) {
    // Create the Erbium currency, store the treasury capability and share the element mine
    let (treasury, metadata) = coin::create_currency<THORIUM>(
        witness,
        9,
        b"THO",
        b"Thorium",
        b"Thorium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(
            url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/thorium.png"),
        ),
        ctx,
    );
    // Freeze Thorium metadata
    transfer::public_freeze_object(metadata);
    // Transfer thorium treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===