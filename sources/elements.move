// Copyright (c) Contract Hero
// SPDX-License-Identifier: Apache-2.0

/// Module defining all the elements in Trade Wars as Coin<T>s
module trade_wars::elements;

use sui::coin::{Self, Coin, TreasuryCap};
use sui::balance::{Self, Balance};
use sui::url;

const ECoinInsufficient: u64 = 0;

// One-time witness for initializing the module
public struct ELEMENTS has drop {}
// Regular witnesses for initializing the currencies
public struct NOVA has drop {}
public struct ERBIUM has drop, store {}
public struct THORIUM has drop {}
public struct LANTHANUM has drop {}

public struct MiningCap<phantom T> has key, store { id: UID }

fun init(_witness: ELEMENTS, ctx: &mut TxContext) {

    // Create the Nova currency and store the treasury capability on the admin address
    let nva_witness = NOVA {};
    let (treasury, metadata) = coin::create_currency<NOVA>(
        nva_witness,
        9,
        b"NVA",
        b"NOVA",
        b"Nova, the ultimate fuel powering humanity interplanetary travels",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/nova.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer<coin::TreasuryCap<NOVA>>(treasury, tx_context::sender(ctx));

    // Create the Erbium currency, store the treasury capability and share the element mine
    let erb_witness = ERBIUM {};
    let (treasury, metadata) = coin::create_currency<ERBIUM>(
        erb_witness,
        9,
        b"ERB",
        b"Erbium",
        b"Erbium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/erbium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let erb_mine = ElementMine<ERBIUM> {
        id: object::new(ctx),
        stock: balance::zero<ERBIUM>()
    };
    transfer::public_transfer<coin::TreasuryCap<ERBIUM>>(treasury, tx_context::sender(ctx));
    transfer::share_object(erb_mine);

    // Create the Thorium currency, store the treasury capability and share the element mine
    let tho_witness = THORIUM {};
    let (treasury, metadata) = coin::create_currency<THORIUM>(
        tho_witness,
        9,
        b"THO",
        b"Thorium",
        b"Thorium, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/thorium.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let tho_mine = ElementMine<THORIUM> {
        id: object::new(ctx),
        stock: balance::zero<THORIUM>()
    };
    transfer::public_transfer<coin::TreasuryCap<THORIUM>>(treasury, tx_context::sender(ctx));
    transfer::share_object(tho_mine);

    // Create the Lanthanum currency, store the treasury capability and share the element mine
    let lan_witness = LANTHANUM {};
    let (treasury, metadata) = coin::create_currency<LANTHANUM>(
        lan_witness,
        9,
        b"LAN",
        b"LANTHANUM",
        b"Lanthanum, one of the rare-earth elements of Trade Wars",
        option::some<url::Url>(url::new_unsafe_from_bytes(b"https://trade-wars.wal.app/media/lanthanum.png")),
        ctx
    );
    transfer::public_freeze_object(metadata);
    let lan_mine = ElementMine<LANTHANUM> {
        id: object::new(ctx),
        stock: balance::zero<LANTHANUM>()
    };
    transfer::public_transfer<coin::TreasuryCap<LANTHANUM>>(treasury, tx_context::sender(ctx));
    transfer::share_object(lan_mine)
}

/// ElementReserve is a wrapper type for balance, almost the same as Coin but with fewer methods for allowing it to be
/// shared, allowing a few actors holding a MiningCapability
public struct ElementMine<phantom T> has key, store {
    id: UID,
    stock: Balance<T>
}

public(package) fun create_mine<T>(ctx: &mut TxContext): ElementMine<T> {
    ElementMine {
        id: object::new(ctx),
        stock: balance::zero<T>(),
    }
}

public fun balance<T>(self: &ElementMine<T>): u64 {
    self.stock.value()
}

public fun join<T>(self: &mut ElementMine<T>, balance: Balance<T>) {
    self.stock.join(balance);
}

public fun split<T>(
    self: &mut ElementMine<T>,
    amount: u64
): Balance<T> {
    self.stock.split(amount)
}

/// Admin can mint new element tokens just for the reserve, not for nova atm, a regular mint function for it?
public entry fun mint_element<T>(
    self: &mut ElementMine<T>,
    treasury_cap: &mut TreasuryCap<T>,
    amount: u64
) {
    let freshly_minted = coin::mint_balance<T>(treasury_cap, amount);
    self.join(freshly_minted)
}

public(package) fun mine<T>(
    self: &mut ElementMine<T>,
    _mining_cap: &MiningCap<T>,
    amount: u64
): Balance<T> {
    assert!(amount <= self.balance(), ECoinInsufficient);
    self.split<T>(amount)
}

public(package) fun grant_mining_rights<T>(ctx: &mut TxContext): MiningCap<T> {
    MiningCap<T>{ id: object::new(ctx) }
}

public entry fun burn<T>(treasury_cap: &mut TreasuryCap<T>, coin: Coin<T>) {
    coin::burn<T>(treasury_cap, coin);
}