// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<THORIUM>
module trade_wars::thorium;

use sui::coin;
use sui::url;

/// Name of the coin
public struct THORIUM has drop {}

fun init(witness: THORIUM, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"THO",
        b"Thorium",
        b"Thorium, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/thorium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<THORIUM>>(treasury, tx_context::sender(ctx))
}
