/// Some module will need to initialize the game and take care of the managing of the basic objects.
/// It should hodl the universes, just one for the MVP
module trade_wars::core_game;

// === Imports ===
use sui::balance::{Self, Balance};
use sui::sui::SUI;
use sui::coin::{Self, Coin};
use sui::package::{Self};

// === Errors ===
const EInsufficientBalance: u64 = 1;

// === Constants ===

// === Structs ===

// Main resource for the core stuff of the game, probably this should create universes when they are full
public struct CoreGame has key {
    id: UID,
    balance: Balance<SUI>,
    game: address,
    public_key: vector<u8>,
    fees: Balance<SUI>
}

// One-time use capability to initialize the game
public struct CoreCap has key {
    id: UID,
}

public struct GameAdminCap has key {
    id: UID,
}

// One time witness to generate the publisher?
public struct CORE_GAME has drop {}

// === Events ===
// === Method Aliases ===
// === Public Functions ===

// === View Functions ===
/// Returns the address of the game.
public fun game(core_game: &CoreGame): address {
    core_game.game
}
/// Returns the balance of the game.
public fun balance(core_game: &CoreGame): u64 {
    core_game.balance.value()
}
/// Returns the fees of the game.
public fun fees(core_game: &CoreGame): u64 {
    core_game.fees.value()
}
/// Returns the public key of the game.
public fun public_key(core_game: &CoreGame): vector<u8> {
  core_game.public_key
}

// === Admin Functions ===
fun init(otw: CORE_GAME, ctx: &mut TxContext) {
    // Creating and sending the Publisher object to the sender
    package::claim_and_keep(otw, ctx);
    // Creating and sending the CoreCap object to the sender
    let core_cap = CoreCap {
        id: object::new(ctx)
    };
    transfer::transfer(core_cap, ctx.sender());
    let admin_cap = GameAdminCap {
        id: object::new(ctx)
    };
    transfer::transfer(admin_cap, ctx.sender())
}

// This should be only called one, the fact that the CoreCap is only created on the init function, consuming the OTW
// assures that this can only be called successfully once, initializing and sharing the core_game object just once
// if we wanna use an object to create universes probably is not gonna be a shared one? or yes bc that key functions
// can only be called using the CoreCap. We'll say the farmer said
public fun initialize_core_game (core_cap: CoreCap, coin: Coin<SUI>, public_key: vector<u8>, ctx: &mut TxContext) {
    assert!(coin.value() > 0, EInsufficientBalance);

    let core_game = CoreGame {
        id: object::new(ctx),
        balance: coin.into_balance(),
        game: ctx.sender(),
        public_key,
        fees: balance::zero()
    };

    let CoreCap { id } = core_cap;
    object::delete(id);

    transfer::share_object(core_game)
}

/// Function used to top up the game balance. Can be called by anyone.
/// Game can have multiple accounts? so giving the treasury balance is not limited.
public fun top_up(core_game: &mut CoreGame, coin: Coin<SUI>, _: &mut TxContext) {
    coin::put(&mut core_game.balance, coin)
}

/// Game admin can withdraw the entire balance of the core game object.
/// Caution should be taken when calling this function.
public fun withdraw(_: &GameAdminCap, core_game: &mut CoreGame, ctx: &mut TxContext) {
    // Only the house address can withdraw funds.
    // we aint doing address checks, we usin capabilities mf
    //assert!(ctx.sender() == core_game.game(), ECallerNotHouse);

    let total_balance = balance(core_game);
    let coin = coin::take(&mut core_game.balance, total_balance, ctx);
    transfer::public_transfer(coin, core_game.game());
}

public fun claim_fees(_: &GameAdminCap, core_game: &mut CoreGame, ctx: &mut TxContext) {
  // Only the house address can withdraw fee funds.
  // same thing, caps
  //assert!(ctx.sender() == house_data.house(), ECallerNotHouse);
  
  let total_fees = fees(core_game);
  let coin = coin::take(&mut core_game.fees, total_fees, ctx);
  transfer::public_transfer(coin, core_game.game());
}

// === Package Functions ===
public(package) fun borrow_balance_mut(core_game: &mut CoreGame): &mut Balance<SUI> {
  &mut core_game.balance
}
public(package) fun borrow_fees_mut(core_game: &mut CoreGame): &mut Balance<SUI> {
  &mut core_game.fees
}
public(package) fun borrow_mut(core_game: &mut CoreGame): &mut UID {
  &mut core_game.id
}

// === Private Functions ===

// === Test Functions ===
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(CORE_GAME {}, ctx);
}