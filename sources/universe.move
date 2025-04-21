module trade_wars::universe;

use trade_wars::galaxy;

public struct Universe has key {
    id: UID,
    galaxies: vector<galaxy::Galaxy>
}