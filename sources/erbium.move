// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<ERBIUM>
module trade_wars::erbium;

use sui::coin;
use sui::url;

/// Name of the coin
public struct ERBIUM has drop {}

fun init(witness: ERBIUM, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"ERB",
        b"Erbium",
        b"Erbium, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/erbium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<ERBIUM>>(treasury, tx_context::sender(ctx))
}
