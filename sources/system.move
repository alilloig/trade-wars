module trade_wars::system;

use trade_wars::planet;

public struct System has key, store {
    id: UID,
    planets: vector<planet::Planet>
}