// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<LANTHANUM>
module trade_wars::lanthanum;

use sui::coin;
use sui::url;

/// Name of the coin
public struct LANTHANUM has drop {}

fun init(witness: LANTHANUM, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"LAN",
        b"LANTHANUM",
        b"Lanthanum, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/lanthanum.png")),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<LANTHANUM>>(treasury, tx_context::sender(ctx))
}
