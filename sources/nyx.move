// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Coin<NYX> is the token used to pay for trades in Nova.
module nova::nyx;

use sui::coin;

/// Name of the coin
public struct NYX has drop {}

fun init(witness: NYX, ctx: &mut TxContext){
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
    transfer::public_transfer<coin::TreasuryCap<NYX>>(treasury, tx_context::sender(ctx))
}
