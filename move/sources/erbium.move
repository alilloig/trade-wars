// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Module for the Erbium resource, one of the three primary elements in Trade Wars.
/// Erbium is implemented as a fungible token that can be mined, traded, and used
/// for upgrading facilities and other game mechanics.
module trade_wars::erbium;

use sui::coin;
use sui::url;

// === Errors ===
// === Constants ===

// === Structs ===
/// One-time witness for the ERBIUM module
public struct ERBIUM has drop {}

/// Witness type for erbium operations
public struct ERB has copy, drop, store {}

/// Returns the erbium witness
public(package) fun get_erbium_witness(): ERB {
    ERB {}
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
/// Initializes the Erbium currency
fun init(witness: ERBIUM, ctx: &mut TxContext) {
    // Create the Erbium currency, store the treasury capability and share the element mine
    let (treasury, metadata) = coin::create_currency<ERBIUM>(
        witness,
        9,
        b"ERB",
        b"Erbium",
        b"Erbium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(
            url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/erbium.png"),
        ),
        ctx,
    );
    // Freeze Erbium metadata
    transfer::public_freeze_object(metadata);
    // Transfer erbium treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Package Functions ===
// === Private Functions ===
// === Test Functions ===
