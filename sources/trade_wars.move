// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

module trade_wars::trade_wars;

// === Imports ===
// trade_wars::
use trade_wars::universe::{
                            Self, 
                            Universe, 
                            UniverseInfo, 
                            UniverseCreatorCapability,
                            UniverseElementSource
                          };
use trade_wars::overseer::{Self};
use trade_wars::erbium::{Self, ERBIUM, ERB};
// sui::
use sui::package::{Self};
use sui::event::{Self};
use sui::vec_map::{Self, VecMap};
use sui::bag::{Self, Bag};
use sui::clock::Clock;
use std::string::{String};
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin, TreasuryCap};
use sui::sui::{SUI};

// === Errors ===
const EUniverseCreationInsufficientPayment: u64 = 0;
const EOpeningOpenUniverse: u64 = 1;
const EClosingClosedUniverse: u64 = 2;
const ENotUniverseCreator: u64 = 3;
const EUnnecessaryRefill: u64 = 4;

// === Constants ===
const InitialMinesProductionFactor: u64 = 2;
const InitialRefillQty: u64 = 1000000;
const InitialRefillThreshold: u64 = 500000;

// === Structs ===
// ::TRADE_WARS otw
public struct TRADE_WARS has drop {}

// ::AdminCap
public struct GameAdminCapability has key {
    id: UID
}

// === ::TradeWarsInfo ===
/// Auxiliary object for keeping public game info, allowing gets without congest main object
/// We trade having some duplicate info for having two shared objects spreading access to them
/// so they get less penalized on consensus
public struct TradeWarsPublicInfo has key {
    id: UID,
    open_universes: vector<ID>,
    public_universe_creation: bool,
    universe_creation_price: u64,
}

// === ::TradeWarsPublicInfo Private Functions ===
fun create_trade_wars_public_info(ctx: &mut TxContext): TradeWarsPublicInfo {
    TradeWarsPublicInfo {
        id: object::new(ctx),
        open_universes: vector::empty<ID>(),
        public_universe_creation: false,
        universe_creation_price: 0,
    }
}

// === ::TradeWarsPublicInfo Entry Functions ===
/// Returns an array of Universes ID only for open universes so clients can fetch their respective Display
entry fun get_open_universes(self: &TradeWarsPublicInfo): vector<ID> {
    self.open_universes
}

/// Returns the universe creation price
entry fun get_universe_creation_price(self: &TradeWarsPublicInfo): u64 {
    self.universe_creation_price
}

/// Returns if the universe creation is allowed
entry fun get_public_universe_creation(self: &TradeWarsPublicInfo): bool {
    self.public_universe_creation
}

// === ::TradeWars ===
public struct TradeWars has key {
    id: UID,
    elements_sources: Bag,
    universes: VecMap<ID, UniverseInfo>,
    public_universe_creation: bool,
    universe_creation_price: u64,
    universe_creation_fees: Balance<SUI>
}

// === ::TradeWars Private Functions ===
fun new_game(_cap: &GameAdminCapability, ctx: &mut TxContext): TradeWars {
    TradeWars {
        id: object::new(ctx),
        elements_sources: bag::new(ctx),
        universes: vec_map::empty(),
        public_universe_creation: false,
        universe_creation_price: 0,
        universe_creation_fees: balance::zero<SUI>()
    }
}

// === ::TradeWars Entry Functions ===
/// After deployment of contracts we need to call this to store the elements TreasureCaps inside the element sources
entry fun create_element_sources(
    self: &mut TradeWars, 
    _cap: &GameAdminCapability, 
    erb_treasury: TreasuryCap<ERBIUM>, 
    ctx: &mut TxContext
) {
    // Create the element source
    let erb_source = create_source<ERBIUM>(erb_treasury, ctx);
    // Store the element source ID in the core game object
    self.elements_sources.add(erbium::get_erbium_witness(), object::id(&erb_source));
    // Share the element source
    transfer::share_object(erb_source);
    //self.elements_sources.add(lanthanum::get_lanthanum_witness(), lan);
    //self.elements_sources.add(thorium::get_thorium_witness(), tho);
}

/// Anyone can call this to start their own universe of the game by paying a fee
entry fun public_start_universe(
    self: &mut TradeWars,
    erb_source: &ElementSource<ERBIUM>,
    name: String,
    galaxies: u8, 
    systems: u8, 
    planets: u8,
    payment: Coin<SUI>,
    clock: &Clock, 
    ctx: &mut TxContext
) {
    // Check if the payment is enough
    assert!(payment.value() >= self.universe_creation_price, EUniverseCreationInsufficientPayment);
    // Transfer the payment to the Game vault
    self.universe_creation_fees.join(payment.into_balance());
    // Start Universe
    // Start Universe
    start_universe(
        self, 
        erb_source, 
        name, 
        galaxies, 
        systems, 
        planets, 
        clock, 
        ctx);
}

/// Game owner can always create new universes for free
entry fun admin_start_universe(
    self: &mut TradeWars,
    _cap: &GameAdminCapability,
    erb_source: &ElementSource<ERBIUM>,
    name: String,
    galaxies: u8, 
    systems: u8, 
    planets: u8,
    clock: &Clock, 
    ctx: &mut TxContext
) {
    // Start Universe
    start_universe(
        self, 
        erb_source, 
        name, 
        galaxies, 
        systems, 
        planets, 
        clock, 
        ctx);
}

/// Opens registration on universe and updates the open state on both the central game and game info objects
entry fun open_universe(self: &mut TradeWars, game_info: &mut TradeWarsPublicInfo, universe: &mut Universe, creator_cap: &UniverseCreatorCapability) {
    // Check the permissions for mutating the universe
    assert!(universe::creator_has_access(universe, creator_cap), ENotUniverseCreator);
    // Check the universe wasn't open before
    assert!(!game_info.open_universes.contains(object::borrow_id(universe)), EOpeningOpenUniverse);
    // Set the universe info on game object as open
    self.universes[object::borrow_id(universe)].open_universe_info();
    // Include the universe ID on the list of open universes on game info object
    game_info.open_universes.push_back(object::id(universe));
    // Set the actual universe object as open
    universe.open_universe(creator_cap);
}

/// Close registration on universe and updates the open state on both the central game and game info objects
entry fun close_universe(self: &mut TradeWars, game_info: &mut TradeWarsPublicInfo, universe: &mut Universe, creator_cap: &UniverseCreatorCapability) {
    // Check the permissions for mutating the universe
    assert!(universe::creator_has_access(universe, creator_cap), ENotUniverseCreator);
    // Set the universe info on game object as close
    self.universes[object::borrow_id(universe)].close_universe_info();
    // Delete the universe ID from the list of open universes on game info object
    let (was_open, index) = game_info.open_universes.index_of(&object::id(universe));
    assert!(was_open, EClosingClosedUniverse);
    game_info.open_universes.remove(index);
    // Set the actual universe object as open
    universe.open_universe(creator_cap);
}

entry fun set_universe_creation_fees(self: &mut TradeWars, _cap: &GameAdminCapability, price: u64, info: &mut TradeWarsPublicInfo) {
    self.universe_creation_price = price;
    info.universe_creation_price = price;
}

// === ::ElementSource ===
/// ElementSource is a wrapper for treasury allowing permissionless minting of elements
public struct ElementSource<phantom T> has key, store {
    id: UID,
    treasury: TreasuryCap<T>,
    mines_production_factor: u64,
    sources_refill_qty: u64,
    sources_refill_threshold: u64
}

// === ::ElementSource Private Functions ===
fun create_source<T>(treasury: TreasuryCap<T>, ctx: &mut TxContext): ElementSource<T> {
    ElementSource<T> {
        id: object::new(ctx),
        treasury,
        mines_production_factor: InitialMinesProductionFactor,
        sources_refill_qty: InitialRefillQty,
        sources_refill_threshold: InitialRefillThreshold
    }
}

// === ::ElementSource Package Functions ===
/// universe sources will call that to refuel
public(package) fun mint_balance<T>(
    self: &mut ElementSource<T>,
    amount: u64
): Balance<T> {
    self.treasury.mint_balance<T>(amount)
}

public(package) fun get_sources_refill_qty<T>(self: &ElementSource<T>): u64 {
    self.sources_refill_qty
}

/// universe sources will deposit here to burn
public(package) fun burn<T>(
    self: &mut ElementSource<T>, 
    coin: Coin<T>
) {
    self.treasury.burn(coin);
}

// === ::ElementSource Entry Functions ===
// Any universe admin can call this to refill its source if it's below the threshold
entry fun refill_universe_source<T>(self: &mut ElementSource<T>, universe_source: &mut UniverseElementSource<T>, _cap: &UniverseCreatorCapability): u64 {
    assert!(self.sources_refill_threshold < universe_source.get_reserves<T>(), EUnnecessaryRefill);
    let refill_qty = self.get_sources_refill_qty<T>();
    universe_source.join(self.mint_balance<T>(refill_qty))
}

entry fun set_erbium_mines_production<ERBIUM>(self: &mut ElementSource<ERBIUM>, _cap: &GameAdminCapability, production: u64) {
    self.mines_production_factor = production;
}

entry fun set_erbium_mines_refill_qty<ERBIUM>(self: &mut ElementSource<ERBIUM>, _cap: &GameAdminCapability, refill_qty: u64) {
    self.sources_refill_qty = refill_qty;
}

entry fun set_erbium_mines_refill_threshold<ERBIUM>(self: &mut ElementSource<ERBIUM>, _cap: &GameAdminCapability, refill_threshold: u64) {
    self.sources_refill_threshold = refill_threshold;
}

// === Events ===
public struct TradeWarsBegin has copy, drop {
    id: ID
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
fun init(otw: TRADE_WARS, ctx: &mut TxContext) {
    // Create and send publisher object to owner
    let publisher = package::claim(otw, ctx);
    // Create  and transfer Universe display
    let display =universe::get_universe_display(&publisher, ctx);
    transfer::public_transfer(display, ctx.sender());
    // Transfer publisher object to owner
    transfer::public_transfer(publisher, ctx.sender());
    // Create CreatorCapability
    let admin_cap = GameAdminCapability {
        id: object::new(ctx)
    };
    // Create new game
    let trade_wars = new_game(&admin_cap, ctx);
    event::emit(TradeWarsBegin {
        id: object::id(&trade_wars)
    });
    // Transfer GameAdmin capability to owner
    transfer::transfer(admin_cap, ctx.sender());
    // Share the game object
    transfer::share_object(trade_wars);
    // Initialize the public info object and share it
    let trade_wars_public_info = create_trade_wars_public_info(ctx);
    transfer::share_object(trade_wars_public_info);
}

// === Package Functions ===
// === Private Functions ===
#[allow(lint(self_transfer))]
fun start_universe(
    self: &mut TradeWars,
    erb_source: &ElementSource<ERBIUM>,
    name: String,
    galaxies: u8, 
    systems: u8, 
    planets: u8,
    clock: &Clock, 
    ctx: &mut TxContext
) {
    // Construct the universe info
    let info = universe::create_universe_info(
        name, 
        galaxies, 
        systems, 
        planets
    );
    // Create a new universe object
    let (universe, creator_capability) = universe::create_universe(
        info,  
        clock.timestamp_ms(), 
        ctx
    );
    // Register the universe in the game object
    self.universes.insert<ID, UniverseInfo>(object::id(&universe), info);
    // Create the universe element source
    let universe_erbium_source = universe::create_universe_element_source<ERBIUM>(
        object::id(&universe),
        object::id(erb_source),
        erb_source.mines_production_factor,
        erb_source.sources_refill_qty,
        ctx
    );
    // Share the universe element source
    transfer::public_share_object(universe_erbium_source);
    // Share the universe object
    transfer::public_share_object(universe);
    // Transfer creator capability
    transfer::public_transfer(creator_capability, ctx.sender());
}

// === Test Functions ===
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(TRADE_WARS {}, ctx);
}