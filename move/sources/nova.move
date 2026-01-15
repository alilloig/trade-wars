// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for the Nova resource, one of the three primary elements in Trade Wars.
/// Nova is implemented as a fungible token that can be mined, traded, and used
/// for upgrading facilities and other game mechanics.
module trade_wars::nova;

// === Imports ===
use sui::coin;
use sui::url;

// === Errors ===

// === Constants ===

// === Structs ===
/// One-time witness for the NOVA module
public struct NOVA has drop {}

// === Events ===

// === Init Function ===
/// Initializes the Nova currency
fun init(witness: NOVA, ctx: &mut TxContext) {
    // Create the Nova currency, store the treasury capability and share the element mine
    let (treasury, metadata) = coin::create_currency<NOVA>(
        witness,
        9,
        b"NOVA",
        b"Nova",
        b"Nova, the ultimate fuel enabling fast interplanetary travel in Trade Wars",
        option::some<url::Url>(
            url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/nova.png"),
        ),
        ctx,
    );
    // Freeze Nova metadata
    transfer::public_freeze_object(metadata);
    // Transfer nova treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Public Functions ===

// === View Functions ===

// === Admin Functions ===

// === Package Functions ===

// === Private Functions ===