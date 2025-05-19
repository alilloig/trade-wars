// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::erbium;

// === Imports ===
use sui::coin::{Self};
use sui::url;

// === Errors ===
// === Constants ===

// === Structs ===
// ::ERBIUM otw
public struct ERBIUM has drop {}

// ::ERB witness
public struct ERB has copy, drop, store {}

public(package) fun get_erbium_witness(): ERB {
    ERB{}
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
fun init(witness: ERBIUM, ctx: &mut TxContext) {
    // Create the Erbium currency, store the treasury capability and share the element mine
    let (mut treasury, metadata) = coin::create_currency<ERBIUM>(
        witness,
        9,
        b"ERB",
        b"Erbium",
        b"Erbium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/erbium.png")),
        ctx
    );
    // Freeze Erbium metadata
    transfer::public_freeze_object(metadata);
    // Transfer erbium treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Package Functions ===
// === Private Functions ===
// === Test Functions ===