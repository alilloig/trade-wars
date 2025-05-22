// Copyright (c) Contract Hero
// SPDX-License-Identifier: GPL-3.0-only

/// Main module for the Trade Wars game. This module initializes the game,
/// manages universe creation, and handles global game settings.
module trade_wars::trade_wars;

use std::string::String;
use sui::balance::{Self, Balance};
use sui::clock::Clock;
use sui::coin::{Coin, TreasuryCap};
use sui::event;
use sui::package;
use sui::sui::SUI;
use sui::vec_map::{Self, VecMap};
use trade_wars::element_source::{Self, ElementSource};
use trade_wars::erbium::ERBIUM;
use trade_wars::lanthanum::LANTHANUM;
use trade_wars::mine_configuration_parameters;
use trade_wars::thorium::THORIUM;
use trade_wars::universe::{Self, Universe, UniverseInfo, UniverseCreatorCap};
use trade_wars::universe_element_source;
use trade_wars::planet::Self;

// === Errors ===
/// Error code when payment for universe creation is insufficient
const EUniverseCreationInsufficientPayment: u64 = 0;
/// Error code when trying to open a universe that is already open
const EOpeningOpenUniverse: u64 = 1;
/// Error code when trying to close a universe that is already closed
const EClosingClosedUniverse: u64 = 2;
/// Error code when an operation is attempted by someone who is not the universe creator
const ENotUniverseCreator: u64 = 3;
/// Error code when the game is not initialized
const EGameNotInitialized: u64 = 4;
// === Constants ===
/// Production factor for initial Erbium mines
const InitialErbiumMinesProductionFactor: u64 = 2;
/// Erbium cost to upgrade an Erbium mine
const InitialErbiumMinesErbiumUpgradeCost: u64 = 10;
/// Lanthanum cost to upgrade an Erbium mine
const InitialErbiumMinesLanthanumUpgradeCost: u64 = 5;
/// Thorium cost to upgrade an Erbium mine
const InitialErbiumMinesThoriumUpgradeCost: u64 = 5;
/// Production factor for initial Lanthanum mines
const InitialLanthanumMinesProductionFactor: u64 = 2;
/// Erbium cost to upgrade a Lanthanum mine
const InitialLanthanumMinesErbiumUpgradeCost: u64 = 5;
/// Lanthanum cost to upgrade a Lanthanum mine
const InitialLanthanumMinesLanthanumUpgradeCost: u64 = 10;
/// Thorium cost to upgrade a Lanthanum mine
const InitialLanthanumMinesThoriumUpgradeCost: u64 = 5;
/// Production factor for initial Thorium mines
const InitialThoriumMinesProductionFactor: u64 = 2;
/// Erbium cost to upgrade a Thorium mine
const InitialThoriumMinesErbiumUpgradeCost: u64 = 5;
/// Lanthanum cost to upgrade a Thorium mine
const InitialThoriumMinesLanthanumUpgradeCost: u64 = 5;
/// Thorium cost to upgrade a Thorium mine
const InitialThoriumMinesThoriumUpgradeCost: u64 = 10;

// === Structs ===
/// One-time witness for this module
public struct TRADE_WARS has drop {}

/// Capability that grants admin access to the game
public struct GameAdminCap has key {
    id: UID,
}

// === ::TradeWarsInfo ===
/// Auxiliary object for keeping public game info, allowing gets without congesting main object.
/// We trade having some duplicate info for having two shared objects spreading access to them
/// so they get less penalized on consensus
public struct TradeWarsInfo has key {
    id: UID,
    /// List of universe IDs that are open for registration
    open_universes: vector<ID>,
    /// Flag indicating if universe creation is allowed for the public
    public_universe_creation: bool,
    /// Price in SUI to create a new universe
    universe_creation_price: u64,
}

// === ::TradeWarsInfo Private Functions ===

/// Creates a new TradeWarsInfo object
fun create_trade_wars_public_info(ctx: &mut TxContext): TradeWarsInfo {
    TradeWarsInfo {
        id: object::new(ctx),
        open_universes: vector::empty<ID>(),
        public_universe_creation: false,
        universe_creation_price: 0,
    }
}

// === ::TradeWarsInfo Public Functions ===

/// Returns an array of Universe IDs only for open universes so clients can fetch their respective Display
public fun open_universes(self: &TradeWarsInfo): vector<ID> {
    self.open_universes
}

/// Returns if universe creation is allowed
public fun public_universe_creation(self: &TradeWarsInfo): bool {
    self.public_universe_creation
}

/// Returns the universe creation price
public fun universe_creation_price(self: &TradeWarsInfo): u64 {
    self.universe_creation_price
}



// === ::TradeWars ===
/// Main game object that manages universe creation and global game state
public struct TradeWars has key {
    id: UID,
    /// ID of the global Erbium element source
    erbium_source: Option<ID>,
    /// ID of the global Lanthanum element source
    lanthanum_source: Option<ID>,
    /// ID of the global Thorium element source
    thorium_source: Option<ID>,
    /// Map of universe IDs to their information
    universes: VecMap<ID, UniverseInfo>,
    /// Flag indicating if universe creation is allowed for the public
    public_universe_creation: bool,
    /// Price in SUI to create a new universe
    universe_creation_price: u64,
    /// Balance of SUI collected from universe creation fees
    universe_creation_fees: Balance<SUI>,
}

// === ::TradeWars Private Functions ===

/// Creates a new TradeWars game instance
fun new_game(_cap: &GameAdminCap, ctx: &mut TxContext): TradeWars {
    TradeWars {
        id: object::new(ctx),
        erbium_source: option::none(),
        lanthanum_source: option::none(),
        thorium_source: option::none(),
        universes: vec_map::empty(),
        public_universe_creation: false,
        universe_creation_price: 0,
        universe_creation_fees: balance::zero<SUI>(),
    }
}

// === ::TradeWars Public Functions ===
// This methods allow easy creation of new universes by just passing the element source ID
/// Returns the ID of the global Erbium element source
public fun erbium_source(self: &TradeWars): ID {
    assert!(option::is_some(&self.erbium_source), EGameNotInitialized);
    *self.erbium_source.borrow()
}

/// Returns the ID of the global Lanthanum element source
public fun lanthanum_source(self: &TradeWars): ID {
    assert!(option::is_some(&self.lanthanum_source), EGameNotInitialized);
    *self.lanthanum_source.borrow()
}

/// Returns the ID of the global Thorium element source
public fun thorium_source(self: &TradeWars): ID {
    assert!(option::is_some(&self.thorium_source), EGameNotInitialized);
    *self.thorium_source.borrow()
}



// === ::TradeWars Entry Functions ===
/// After deployment of contracts we need to call this to store the elements TreasureCaps inside the element sources
#[allow(lint(share_owned))]
entry fun create_element_sources(
    self: &mut TradeWars,
    _cap: &GameAdminCap,
    erb_treasury: TreasuryCap<ERBIUM>,
    lan_treasury: TreasuryCap<LANTHANUM>,
    tho_treasury: TreasuryCap<THORIUM>,
    ctx: &mut TxContext,
): (ID, ID, ID) {
    // Create the erbium source
    let erb_source = element_source::create_source<ERBIUM>(
        erb_treasury,
        mine_configuration_parameters::create_mine_configuration_parameters<ERBIUM>(
            InitialErbiumMinesProductionFactor,
            InitialErbiumMinesErbiumUpgradeCost,
            InitialErbiumMinesLanthanumUpgradeCost,
            InitialErbiumMinesThoriumUpgradeCost,
        ),
        ctx,
    );
    let erb_source_id = object::id(&erb_source);
    // Store the element source ID in the core game object
    self.erbium_source.fill(erb_source_id);
    // Share the element source
    transfer::public_share_object(erb_source);

    // Create the lanthanum source
    let lan_source = element_source::create_source<LANTHANUM>(
        lan_treasury,
        mine_configuration_parameters::create_mine_configuration_parameters<LANTHANUM>(
            InitialLanthanumMinesProductionFactor,
            InitialLanthanumMinesErbiumUpgradeCost,
            InitialLanthanumMinesLanthanumUpgradeCost,
            InitialLanthanumMinesThoriumUpgradeCost,
        ),
        ctx,
    );
    let lan_source_id = object::id(&lan_source);
    // Store the element source ID in the core game object
    self.lanthanum_source.fill(lan_source_id);
    // Share the element source
    transfer::public_share_object(lan_source);

    // Create the thorium source
    let tho_source = element_source::create_source<THORIUM>(
        tho_treasury,
        mine_configuration_parameters::create_mine_configuration_parameters<THORIUM>(
            InitialThoriumMinesProductionFactor,
            InitialThoriumMinesErbiumUpgradeCost,
            InitialThoriumMinesLanthanumUpgradeCost,
            InitialThoriumMinesThoriumUpgradeCost,
        ),
        ctx,
    );
    let tho_source_id = object::id(&tho_source);
    // Store the element source ID in the core game object
    self.thorium_source.fill(tho_source_id);
    // Share the element source
    transfer::public_share_object(tho_source);
    (erb_source_id, lan_source_id, tho_source_id)
}

/// Anyone can call this to start their own universe of the game by paying a fee
entry fun public_start_universe(
    self: &mut TradeWars,
    erb_source: &ElementSource<ERBIUM>,
    lan_source: &ElementSource<LANTHANUM>,
    tho_source: &ElementSource<THORIUM>,
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    payment: Coin<SUI>,
    clock: &Clock,
    ctx: &mut TxContext,
): (ID, ID, ID, ID) {
    // Check if the payment is enough
    assert!(payment.value() >= self.universe_creation_price, EUniverseCreationInsufficientPayment);
    // Transfer the payment to the Game vault
    self.universe_creation_fees.join(payment.into_balance());
    // Start Universe
    start_universe(
        self,
        erb_source,
        lan_source,
        tho_source,
        name,
        galaxies,
        systems,
        planets,
        clock,
        ctx,
    )
}

/// Game owner can always create new universes for free
entry fun admin_start_universe(
    self: &mut TradeWars,
    _cap: &GameAdminCap,
    erb_source: &ElementSource<ERBIUM>,
    lan_source: &ElementSource<LANTHANUM>,
    tho_source: &ElementSource<THORIUM>,
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    clock: &Clock,
    ctx: &mut TxContext,
): (ID, ID, ID, ID) {
    // Start Universe
    start_universe(
        self,
        erb_source,
        lan_source,
        tho_source,
        name,
        galaxies,
        systems,
        planets,
        clock,
        ctx,
    )
}

/// Opens registration on universe and updates the open state on both the central game and game info objects
entry fun open_universe(
    self: &mut TradeWars,
    creator_cap: &UniverseCreatorCap,
    game_info: &mut TradeWarsInfo,
    universe: &mut Universe,
) {
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
entry fun close_universe(
    self: &mut TradeWars,
    creator_cap: &UniverseCreatorCap,
    game_info: &mut TradeWarsInfo,
    universe: &mut Universe,
) {
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

// Entry methods for modifying global game settings

/// Sets the price for creating a universe
entry fun set_universe_creation_fees(
    self: &mut TradeWars,
    _cap: &GameAdminCap,
    price: u64,
    info: &mut TradeWarsInfo,
) {
    self.universe_creation_price = price;
    info.universe_creation_price = price;
}

/// Sets the production parameters for erbium mines
entry fun set_erbium_mines_production<ERBIUM>(
    self: &mut ElementSource<ERBIUM>,
    _cap: &GameAdminCap,
    production: u64,
    erb_upgrade_cost: u64,
    lan_upgrade_cost: u64,
    tho_upgrade_cost: u64,
) {
    element_source::set_mine_parameters(
        self,
        mine_configuration_parameters::create_mine_configuration_parameters<ERBIUM>(
            production,
            erb_upgrade_cost,
            lan_upgrade_cost,
            tho_upgrade_cost,
        ),
    );
}

/// Sets the refill quantity for erbium mines
entry fun set_erbium_mines_refill_qty<ERBIUM>(
    self: &mut ElementSource<ERBIUM>,
    _cap: &GameAdminCap,
    refill_qty: u64,
) {
    element_source::set_sources_refill_qty(self, refill_qty);
}

/// Sets the refill threshold for erbium mines
entry fun set_erbium_mines_refill_threshold<ERBIUM>(
    self: &mut ElementSource<ERBIUM>,
    _cap: &GameAdminCap,
    refill_threshold: u64,
) {
    element_source::set_sources_refill_threshold(self, refill_threshold);
}

/// Sets the production parameters for lanthanum mines
entry fun set_lanthanum_mines_production<LANTHANUM>(
    self: &mut ElementSource<LANTHANUM>,
    _cap: &GameAdminCap,
    production: u64,
    lan_upgrade_cost: u64,
    tho_upgrade_cost: u64,
) {
    element_source::set_mine_parameters(
        self,
        mine_configuration_parameters::create_mine_configuration_parameters<LANTHANUM>(
            production,
            lan_upgrade_cost,
            lan_upgrade_cost,
            tho_upgrade_cost,
        ),
    );
}

/// Sets the refill quantity for lanthanum mines
entry fun set_lanthanum_mines_refill_qty<LANTHANUM>(
    self: &mut ElementSource<LANTHANUM>,
    _cap: &GameAdminCap,
    refill_qty: u64,
) {
    element_source::set_sources_refill_qty(self, refill_qty);
}

/// Sets the refill threshold for lanthanum mines
entry fun set_lanthanum_mines_refill_threshold<LANTHANUM>(
    self: &mut ElementSource<LANTHANUM>,
    _cap: &GameAdminCap,
    refill_threshold: u64,
) {
    element_source::set_sources_refill_threshold(self, refill_threshold);
}

/// Sets the production parameters for thorium mines
entry fun set_thorium_mines_production<THORIUM>(
    self: &mut ElementSource<THORIUM>,
    _cap: &GameAdminCap,
    production: u64,
    erb_upgrade_cost: u64,
    lan_upgrade_cost: u64,
) {
    element_source::set_mine_parameters(
        self,
        mine_configuration_parameters::create_mine_configuration_parameters<THORIUM>(
            production,
            erb_upgrade_cost,
            lan_upgrade_cost,
            lan_upgrade_cost,
        ),
    );
}

/// Sets the refill quantity for thorium mines
entry fun set_thorium_mines_refill_qty<THORIUM>(
    self: &mut ElementSource<THORIUM>,
    _cap: &GameAdminCap,
    refill_qty: u64,
) {
    element_source::set_sources_refill_qty(self, refill_qty);
}

/// Sets the refill threshold for thorium mines
entry fun set_thorium_mines_refill_threshold<THORIUM>(
    self: &mut ElementSource<THORIUM>,
    _cap: &GameAdminCap,
    refill_threshold: u64,
) {
    element_source::set_sources_refill_threshold(self, refill_threshold);
}

// === Events ===
/// Event emitted when the Trade Wars game begins
public struct TradeWarsBegin has copy, drop {
    /// ID of the newly created TradeWars object
    id: ID,
}

// === Method Aliases ===
// === Public Functions ===
// === View Functions ===

// === Admin Functions ===
/// Initializes the Trade Wars game
fun init(otw: TRADE_WARS, ctx: &mut TxContext) {
    // Create and send publisher object to owner
    let publisher = package::claim(otw, ctx);
    // Create  and transfer Universe display
    let universe_display = universe::get_universe_display(&publisher, ctx);
    transfer::public_transfer(universe_display, ctx.sender());
    // Create and transfer Planet display
    let planet_display = planet::get_planet_display(&publisher, ctx);
    transfer::public_transfer(planet_display, ctx.sender());
    // Transfer publisher object to owner
    transfer::public_transfer(publisher, ctx.sender());
    // Create CreatorCapability
    let admin_cap = GameAdminCap {
        id: object::new(ctx),
    };
    // Create new game
    let trade_wars = new_game(&admin_cap, ctx);
    event::emit(TradeWarsBegin {
        id: object::id(&trade_wars),
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
/// Creates and starts a new universe in the game
#[allow(lint(self_transfer))]
fun start_universe(
    self: &mut TradeWars,
    erb_source: &ElementSource<ERBIUM>,
    lan_source: &ElementSource<LANTHANUM>,
    tho_source: &ElementSource<THORIUM>,
    name: String,
    galaxies: u8,
    systems: u8,
    planets: u8,
    clock: &Clock,
    ctx: &mut TxContext,
): (ID, ID, ID, ID) {

    // Construct the universe info
    let info = universe::create_universe_info(
        name,
        galaxies,
        systems,
        planets,
    );
    // Create a new universe object
    let (mut universe, creator_capability) = universe::create_universe(
        info,
        clock.timestamp_ms(),
        ctx,
    );
    let universe_id = object::id(&universe);
    // Register the universe in the game object
    self.universes.insert<ID, UniverseInfo>(universe_id, info);

    // Create the universe element source for erbium
    let universe_erbium_source = universe_element_source::create_universe_element_source<ERBIUM>(
        universe_id,
        object::id(erb_source),
        element_source::get_sources_refill_threshold(erb_source),
        element_source::get_mine_parameters(erb_source),
        ctx,
    );
    let universe_erbium_source_id = object::id(&universe_erbium_source);

    // Create the universe element source for lanthanum
    let universe_lanthanum_source = universe_element_source::create_universe_element_source<LANTHANUM>(
        universe_id,
        object::id(lan_source),
        element_source::get_sources_refill_threshold(lan_source),
        element_source::get_mine_parameters(lan_source),
        ctx,
    );
    let universe_lanthanum_source_id = object::id(&universe_lanthanum_source);
    // Create the universe element source for thorium
    let universe_thorium_source = universe_element_source::create_universe_element_source<THORIUM>(
        universe_id,
        object::id(tho_source),
        element_source::get_sources_refill_threshold(tho_source),
        element_source::get_mine_parameters(tho_source),
        ctx,
    );
    let universe_thorium_source_id = object::id(&universe_thorium_source);

    // Link the universe element source to the universe
    universe.link_elements_sources(
        universe_erbium_source_id,
        universe_lanthanum_source_id,
        universe_thorium_source_id,
    );
    // Share all universe element sources
    transfer::public_share_object(universe_erbium_source);
    transfer::public_share_object(universe_lanthanum_source);
    transfer::public_share_object(universe_thorium_source);
    // Share the universe object
    transfer::public_share_object(universe);
    // Transfer creator capability
    transfer::public_transfer(creator_capability, ctx.sender());
    (universe_id, universe_erbium_source_id, universe_lanthanum_source_id, universe_thorium_source_id)
}

// === Test Functions ===
/// Initialize the module for testing purposes
#[test_only]
public fun init_for_testing(ctx: &mut TxContext) {
    init(TRADE_WARS {}, ctx);
}
