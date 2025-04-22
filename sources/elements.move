// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Module defining all the elements in Trade Wars as Coin<T>s
module trade_wars::elements;

use sui::coin::{Self, Coin, TreasuryCap};
use sui::url;

const ECoinInsufficient: u64 = 0;

public struct ELEMENTS has drop {}

public struct ERBIUM has drop {}
public struct THORIUM has drop {}
public struct LANTHANUM has drop {}

public struct MinningCap<phantom T> has key, store {id: UID}


fun init(_witness: ELEMENTS, ctx: &mut TxContext) {
    let erb_witness = ERBIUM{};
    let (mut treasury, metadata) = coin::create_currency<ERBIUM>(
        erb_witness,
        9,
        b"ERB",
        b"Erbium",
        b"Erbium, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/erbium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let reserve = coin::mint<ERBIUM>(
        &mut treasury,
        0,
        ctx
    );
    transfer::public_transfer<coin::TreasuryCap<ERBIUM>>(treasury, tx_context::sender(ctx));
    transfer::public_transfer(reserve, tx_context::sender(ctx));

    let tho_witness = THORIUM{};
    let (mut treasury, metadata) = coin::create_currency<THORIUM>(
        tho_witness,
        9,
        b"THO",
        b"Thorium",
        b"Thorium, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/thorium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let reserve = coin::mint<THORIUM>(
        &mut treasury,
        0,
        ctx
    );
    transfer::public_transfer<coin::TreasuryCap<THORIUM>>(treasury, tx_context::sender(ctx));
    transfer::public_transfer(reserve, tx_context::sender(ctx));

    let lan_witness = LANTHANUM{};
    let (mut treasury, metadata) = coin::create_currency<LANTHANUM>(
        lan_witness,
        9,
        b"LAN",
        b"LANTHANUM",
        b"Lanthanum, one of the rare-earth resources of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/lanthanum.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let reserve = coin::mint<LANTHANUM>(
        &mut treasury,
        0,
        ctx
    );
    transfer::public_transfer<coin::TreasuryCap<LANTHANUM>>(treasury, tx_context::sender(ctx));
    transfer::public_transfer(reserve, tx_context::sender(ctx))
}

/// Admin can mint new tokens just for the reserve
public entry fun mint<T>(
    treasury_cap: &mut TreasuryCap<T>,
    reserve: &mut Coin<T>,
    amount: u64,
    ctx: &mut TxContext
) {
    let freshly_minted = coin::mint<T>(treasury_cap, amount, ctx);
    reserve.join(freshly_minted)
}

public(package) fun extract_from_mine<T>(
    mine: &mut Coin<T>,
    _mining_cap: &MinningCap<T>,
    amount: u64,
    ctx: &mut TxContext
): Coin<T> {
    assert!(amount <= mine.balance().value(), ECoinInsufficient);
    mine.split<T>(amount, ctx)
}

public entry fun burn<T>(treasury_cap: &mut TreasuryCap<T>, coin: Coin<T>) {
    coin::burn<T>(treasury_cap, coin);
}

public(package) fun grant_mining_rights<T>(ctx: &mut TxContext): MinningCap<T> {
    MinningCap<T>{ id: object::new(ctx) }
}