// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::thorium;

// === Imports ===
use sui::coin::{Self};
use sui::url;

// === Errors ===
// === Constants ===

// === Structs ===
// ::THORIUM otw
public struct THORIUM has drop {}

// ::THR witness
public struct THO has copy, drop, store {}

public(package) fun get_thorium_witness(): THO {
    THO{}
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
fun init(witness: THORIUM, ctx: &mut TxContext) {
    // Create the Erbium currency, store the treasury capability and share the element mine
    let (treasury, metadata) = coin::create_currency<THORIUM>(
        witness,
        9,
        b"THO",
        b"Thorium",
        b"Thorium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/thorium.png")),
        ctx
    );
    // Freeze Thorium metadata
    transfer::public_freeze_object(metadata);
    // Transfer thorium treasury to module owner
    transfer::public_transfer(treasury, ctx.sender());
}

// === Package Functions ===
// === Private Functions ===
// === Test Functions ===