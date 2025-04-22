// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<NOVA> is the core token used as fuel to be able to do trades.
module trade_wars::nova;

use sui::coin;
use sui::url;

/// Name of the coin
public struct NOVA has drop {}

fun init(witness: NOVA, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"NVA",
        b"NOVA",
        b"Nova, the ultimate fuel powering humanity interplanetary travels",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/nova.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<NOVA>>(treasury, tx_context::sender(ctx))
}
