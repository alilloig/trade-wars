module trade_wars::galaxy;

use trade_wars::system;

public struct Galaxy has key, store {
    id: UID,
    systems: vector<system::System>
}