/// The player profile object. This will be stored on the user's wallet and ultimately grant control over
/// the planets and resources hodl in them.
module trade_wars::overseer;

public struct Overseer has key {
    id: UID,
}