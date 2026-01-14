# Trade Wars Deployments

## Testnet (Current)

**Version**: v1 (Initial deployment - pre-refactor)

### Package & Core Objects
| Object | ID |
|--------|-----|
| Package | `0x30bf779b09ae90806d2bab245764f007ec96b165d75f5525a9a1b69b1fd2c1fa` |
| TradeWarsInfo | `0x1c40280931ebd594f3a029538dc5c64180da3e74d25a0394967bd14b12ccce1d` |
| TradeWars ID | `0x464dfa67c05ac39497e541597525398813320592322f2e9539b6eb59af8b2782` |

### Admin Capabilities
| Capability | ID |
|------------|-----|
| Admin Cap | `0xeb23a8ead9a9ecdea2085871b8e9d54a1dfb34751d288d9acbf57f77b72a7afa` |
| Erbium Treasury Cap | `0xdbf4d26c7c460f41b9c9858e1c9af09d3520493675bb1193ea85a97d28ce879f` |
| Lanthanum Treasury Cap | `0xad5e5e0de390533a54e0d983fd59ddcae65399b743f62ea9361b2150b2dd2c1c` |
| Thorium Treasury Cap | `0x296b9ed0b1c3415ec7b6b9c6a09e360a1ec8058f44e862ac0618bcc46ffaa89c` |

### Global Element Sources
| Element | Source ID |
|---------|-----------|
| Erbium | `0xdf79ce842baba484b9faa23e6eaa797846c9167895bb824c2634a2f112284ac5` |
| Lanthanum | `0x4fad4e8735fa6642108477c9588bc4689825f99da0ebd6f37170b5a3b8396c69` |
| Thorium | `0x7afbf0d52115ce57668b09218d22dc38f34e5c1d616c0cff22fdc6ed5f2310a9` |

### Alpha Universe (Test Universe)
| Object | ID |
|--------|-----|
| Universe | `0x68846ac6b6c89015e318228bb55568c710a1bcbd97b2fb5410edb3fd4ace61af` |
| Universe Cap | `0xf9d280053781806e2ecfcd12ebda056ef733557f77e8183c650dd87c9fab8a9f` |
| Erbium Element Source | `0x57bb2f06240d7b2eefe520df5afadfa801fa279bd5b2db2f53e7efef9b550c34` |
| Lanthanum Element Source | `0x5c4d43a73ab7986ed9411280fd3073d95f089beada8d1c97ea8f206bbb2350eb` |
| Thorium Element Source | `0x83ba7e62e3414da1fdcd95f9daa80fde17ca8c266e401e9dbb4efa41dd249c01` |

---

## Deployment History

### v1 - Initial Deployment
- **Date**: [Initial deployment date]
- **Network**: Testnet
- **Notes**:
  - Universe-specific element sources (to be consolidated in v2)
  - Alpha universe created for testing

### v2 - Element Source Consolidation (Planned)
- **Status**: Not yet deployed
- **Changes**:
  - Remove `universe_element_source.move`
  - All mines use global `ElementSource<T>` objects
  - Updated planet allocation logic
- **Impact**: New package ID required, frontend env vars must be updated

---

## Frontend Environment Variables

After each deployment, update `web/.env`:
```
VITE_TRADE_WARS_PKG_DEV=<new_package_id>
VITE_TRADE_WARS_INFO_DEV=<trade_wars_info_id>
```

## Explorer Links

- [Package on SuiVision](https://testnet.suivision.xyz/package/0x30bf779b09ae90806d2bab245764f007ec96b165d75f5525a9a1b69b1fd2c1fa)
- [TradeWarsInfo on SuiVision](https://testnet.suivision.xyz/object/0x1c40280931ebd594f3a029538dc5c64180da3e74d25a0394967bd14b12ccce1d)
- [Alpha Universe on SuiVision](https://testnet.suivision.xyz/object/0x68846ac6b6c89015e318228bb55568c710a1bcbd97b2fb5410edb3fd4ace61af)
