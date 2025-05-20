// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::lanthanum;

use sui::coin;
use sui::url;

// === Errors ===
// === Constants ===

// === Structs ===
/// One-time witness for the LANTHANUM module
public struct LANTHANUM has drop {}

/// Witness type for lanthanum operations
public struct LAN has copy, drop, store {}

/// Returns the lanthanum witness
public(package) fun get_lanthanum_witness(): LAN {
    LAN {}
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
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

// === Package Functions ===
// === Private Functions ===
// === Test Functions ===
