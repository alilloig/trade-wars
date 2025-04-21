// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<NOVA> is the core token used as fuel to be able to do trades.
module trade_wars::nova;

use sui::coin;

/// Name of the coin
public struct NOVA has drop {}

fun init(witness: NOVA, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        9,
        b"NYX",
        b"Nyx Token",
        b"The Nova in-game currency",
        // TODO: add appropriate logo url
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<NOVA>>(treasury, tx_context::sender(ctx))
}
