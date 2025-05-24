import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Box, Button, Badge } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";

interface PlanetDetailsProps {
  planetId: string;
  overseerId: string;
  universeId: string;
  planetData: {
    galaxy: number;
    system: number;
    position: number;
    imageIndex: number;
  };
  onBack: () => void;
}

interface PlanetReserves {
  erbium: number;
  lanthanum: number;
  thorium: number;
}

interface MineLevels {
  erbium: number;
  lanthanum: number;
  thorium: number;
}

interface UpgradeCosts {
  erbium: { erbium: number; lanthanum: number; thorium: number };
  lanthanum: { erbium: number; lanthanum: number; thorium: number };
  thorium: { erbium: number; lanthanum: number; thorium: number };
}

export function PlanetDetails({ planetId, overseerId, universeId, planetData, onBack }: PlanetDetailsProps) {
  const account = useCurrentAccount();
  const [isUpgrading, setIsUpgrading] = useState<string | null>(null);
  const [upgradeStatus, setUpgradeStatus] = useState<string>("");
  const [planetReserves, setPlanetReserves] = useState<PlanetReserves>({ erbium: 0, lanthanum: 0, thorium: 0 });
  const [mineLevels, setMineLevels] = useState<MineLevels>({ erbium: 0, lanthanum: 0, thorium: 0 });
  const [upgradeCosts, setUpgradeCosts] = useState<UpgradeCosts>({
    erbium: { erbium: 0, lanthanum: 0, thorium: 0 },
    lanthanum: { erbium: 0, lanthanum: 0, thorium: 0 },
    thorium: { erbium: 0, lanthanum: 0, thorium: 0 }
  });

  // Get environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Query the planet object for refetching after upgrades
  const { isPending: planetPending, error: planetError } = useSuiClientQuery(
    "getObject",
    {
      id: planetId,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: !!planetId,
    },
  );

  // Query the universe object to get element sources
  const { data: universeData, isPending: universePending, error: universeError } = useSuiClientQuery(
    "getObject",
    {
      id: universeId,
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!universeId,
    },
  );

  // Create a single PTB with all planet getter function calls
  const createPlanetDataTransaction = () => {
    const tx = new Transaction();
    const now = Date.now(); // Current timestamp in milliseconds
    
    // Reserves (need timestamp)
    tx.moveCall({
      target: `${packageId}::planet::get_erbium_reserves`,
      arguments: [tx.object(planetId), tx.object.clock()]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_lanthanum_reserves`,
      arguments: [tx.object(planetId), tx.object.clock()]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_thorium_reserves`,
      arguments: [tx.object(planetId), tx.object.clock()]
    });

    // Mine levels (no timestamp needed)
    tx.moveCall({
      target: `${packageId}::planet::get_erbium_mine_level`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_lanthanum_mine_level`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_thorium_mine_level`,
      arguments: [tx.object(planetId)]
    });

    // Erbium mine upgrade costs
    tx.moveCall({
      target: `${packageId}::planet::get_erbium_mine_erbium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_erbium_mine_lanthanum_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_erbium_mine_thorium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });

    // Lanthanum mine upgrade costs
    tx.moveCall({
      target: `${packageId}::planet::get_lanthanum_mine_erbium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_lanthanum_mine_lanthanum_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_lanthanum_mine_thorium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });

    // Thorium mine upgrade costs
    tx.moveCall({
      target: `${packageId}::planet::get_thorium_mine_erbium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_thorium_mine_lanthanum_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    tx.moveCall({
      target: `${packageId}::planet::get_thorium_mine_thorium_upgrade_cost`,
      arguments: [tx.object(planetId)]
    });
    
    return tx;
  };

  // Single query for all planet data
  const { data: planetDataResult, refetch: planetDataRefetch } = useSuiClientQuery(
    "devInspectTransactionBlock",
    {
      transactionBlock: createPlanetDataTransaction(),
      sender: account?.address || "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    { enabled: !!planetId && !!packageId && !!account },
  );

  // Helper function to parse u64 from specific result index
  const parseU64FromResultIndex = (data: any, index: number): number => {
    try {
      if (data?.results?.[index]?.returnValues?.[0]) {
        const returnValue = data.results[index].returnValues[0];
        if (Array.isArray(returnValue) && returnValue.length >= 2) {
          const bytesData = returnValue[0];
          if (Array.isArray(bytesData) && bytesData.length === 8) {
            // Convert little-endian bytes to number
            let result = 0;
            for (let i = 0; i < 8; i++) {
              result += bytesData[i] * Math.pow(256, i);
            }
            return result;
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing u64 at index ${index}:`, error);
    }
    return 0;
  };

  // Update state when planetDataResult changes
  useEffect(() => {
    if (planetDataResult) {
      // Parse reserves (indices 0, 1, 2)
      setPlanetReserves({
        erbium: parseU64FromResultIndex(planetDataResult, 0),
        lanthanum: parseU64FromResultIndex(planetDataResult, 1),
        thorium: parseU64FromResultIndex(planetDataResult, 2)
      });

      // Parse mine levels (indices 3, 4, 5)
      setMineLevels({
        erbium: parseU64FromResultIndex(planetDataResult, 3),
        lanthanum: parseU64FromResultIndex(planetDataResult, 4),
        thorium: parseU64FromResultIndex(planetDataResult, 5)
      });

      // Parse upgrade costs (indices 6-14)
      setUpgradeCosts({
        erbium: {
          erbium: parseU64FromResultIndex(planetDataResult, 6),     // get_erbium_mine_erbium_upgrade_cost
          lanthanum: parseU64FromResultIndex(planetDataResult, 7),  // get_erbium_mine_lanthanum_upgrade_cost
          thorium: parseU64FromResultIndex(planetDataResult, 8)     // get_erbium_mine_thorium_upgrade_cost
        },
        lanthanum: {
          erbium: parseU64FromResultIndex(planetDataResult, 9),     // get_lanthanum_mine_erbium_upgrade_cost
          lanthanum: parseU64FromResultIndex(planetDataResult, 10), // get_lanthanum_mine_lanthanum_upgrade_cost
          thorium: parseU64FromResultIndex(planetDataResult, 11)    // get_lanthanum_mine_thorium_upgrade_cost
        },
        thorium: {
          erbium: parseU64FromResultIndex(planetDataResult, 12),    // get_thorium_mine_erbium_upgrade_cost
          lanthanum: parseU64FromResultIndex(planetDataResult, 13), // get_thorium_mine_lanthanum_upgrade_cost
          thorium: parseU64FromResultIndex(planetDataResult, 14)    // get_thorium_mine_thorium_upgrade_cost
        }
      });
    }
  }, [planetDataResult]);

  // Helper function to check if upgrade is affordable
  const canAffordUpgrade = (mineType: 'erbium' | 'lanthanum' | 'thorium'): boolean => {
    const costs = upgradeCosts[mineType];
    return planetReserves.erbium >= costs.erbium &&
           planetReserves.lanthanum >= costs.lanthanum &&
           planetReserves.thorium >= costs.thorium;
  };

  // Helper function to get element sources from universe data
  const getElementSources = () => {
    if (!universeData?.data?.content || !('fields' in universeData.data.content)) {
      return null;
    }
    
    const fields = universeData.data.content.fields as any;
    return {
      erbium: fields.erbium_source,
      lanthanum: fields.lanthanum_source,
      thorium: fields.thorium_source
    };
  };

  // Upgrade mine handler
  const handleUpgradeMine = async (mineType: 'erbium' | 'lanthanum' | 'thorium') => {
    if (!account) {
      setUpgradeStatus("No account connected");
      return;
    }

    if (isUpgrading) {
      setUpgradeStatus("Already upgrading a mine");
      return;
    }

    if (!canAffordUpgrade(mineType)) {
      setUpgradeStatus(`Not enough resources to upgrade ${mineType} mine`);
      setTimeout(() => setUpgradeStatus(""), 3000);
      return;
    }

    const elementSources = getElementSources();
    if (!elementSources) {
      setUpgradeStatus("Element sources not available");
      setTimeout(() => setUpgradeStatus(""), 3000);
      return;
    }

    try {
      setIsUpgrading(mineType);
      setUpgradeStatus(`Upgrading ${mineType} mine...`);

      const tx = new Transaction();
      
      // Call the appropriate upgrade mine entry function
      tx.moveCall({
        target: `${packageId}::overseer::upgrade_${mineType}_planet_mine`,
        arguments: [
          tx.object(overseerId), // overseer
          tx.pure.address(universeId), // universe ID
          tx.object(planetId), // planet
          tx.object(elementSources.erbium), // erbium source
          tx.object(elementSources.lanthanum), // lanthanum source
          tx.object(elementSources.thorium), // thorium source
          tx.object.clock(), // clock
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            console.log(`Successfully upgraded ${mineType} mine:`, result);
            setUpgradeStatus(`${mineType} mine upgraded successfully!`);
            
            // Add delay to ensure blockchain indexing before refetch
            setTimeout(() => {
              planetDataRefetch();
              setIsUpgrading(null);
              setUpgradeStatus("");
            }, 2000);
          },
          onError: (error) => {
            console.error(`Failed to upgrade ${mineType} mine:`, error);
            setUpgradeStatus(`Failed to upgrade ${mineType} mine: ${error.message}`);
            setIsUpgrading(null);
            setTimeout(() => setUpgradeStatus(""), 5000);
          },
        },
      );
    } catch (error) {
      console.error(`Error upgrading ${mineType} mine:`, error);
      setUpgradeStatus(`Error upgrading ${mineType} mine`);
      setIsUpgrading(null);
      setTimeout(() => setUpgradeStatus(""), 3000);
    }
  };

  // Helper function to get planet image path
  const getPlanetImage = (imageIndex: number) => {
    return `/planet${imageIndex}.png`;
  };

  if (planetError || universeError) {
    return (
      <Flex direction="column" gap="2">
        <Text color="red">
          Error loading data: {planetError?.message || universeError?.message}
        </Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  if (planetPending || universePending) {
    return (
      <Flex direction="column" gap="2">
        <Text style={{ color: "#a0a0a0" }}>Loading planet details...</Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="4" style={{ color: "#d4af37" }}>
          🪐 Planet Details
        </Heading>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>

      {/* Planet Header */}
      <Card style={{ backgroundColor: "rgba(75, 175, 75, 0.1)", border: "1px solid #4baf4b" }}>
        <Flex align="center" gap="3">
          {/* Planet Image */}
          <Box style={{ flexShrink: 0 }}>
            <img 
              src={getPlanetImage(planetData.imageIndex)}
              alt={`Planet ${planetData.galaxy + 1}-${planetData.system + 1}-${planetData.position + 1}`}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "2px solid #4baf4b"
              }}
            />
          </Box>
          
          {/* Planet Info */}
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Text weight="bold" size="4" style={{ color: "#4baf4b" }}>
              🪐 Galaxy {planetData.galaxy + 1} - System {planetData.system + 1} - Position {planetData.position + 1}
            </Text>
            <a 
              href={`https://devnet.suivision.xyz/object/${planetId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              <Text 
                size="1" 
                style={{ 
                  color: "#6b9bd2", 
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {planetId}
              </Text>
            </a>
          </Flex>
        </Flex>
      </Card>

      {/* Status Message */}
      {upgradeStatus && (
        <Card style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid #d4af37" }}>
          <Text style={{ color: "#d4af37" }}>{upgradeStatus}</Text>
        </Card>
      )}

      {/* Planet Reserves */}
      <Box>
        <Flex justify="between" align="center" mb="3">
          <Heading size="3" style={{ color: "#d4af37" }}>
            💎 Element Reserves
          </Heading>
          <Button 
            onClick={() => planetDataRefetch()}
            size="2"
            variant="soft"
            style={{ 
              backgroundColor: "rgba(212, 175, 55, 0.2)",
              color: "#d4af37",
              border: "1px solid #d4af37",
              cursor: "pointer"
            }}
          >
            🔄 Refresh
          </Button>
        </Flex>
        <Flex direction="row" gap="3">
          <Card style={{ backgroundColor: "rgba(255, 99, 71, 0.1)", border: "1px solid #ff6347", flex: 1 }}>
            <Flex direction="column" align="center" gap="2">
              <Text weight="bold" style={{ color: "#ff6347" }}>Erbium</Text>
              <Text size="6" weight="bold" style={{ color: "#ff6347" }}>{planetReserves.erbium}</Text>
            </Flex>
          </Card>
          <Card style={{ backgroundColor: "rgba(0, 255, 127, 0.1)", border: "1px solid #00ff7f", flex: 1 }}>
            <Flex direction="column" align="center" gap="2">
              <Text weight="bold" style={{ color: "#00ff7f" }}>Lanthanum</Text>
              <Text size="6" weight="bold" style={{ color: "#00ff7f" }}>{planetReserves.lanthanum}</Text>
            </Flex>
          </Card>
          <Card style={{ backgroundColor: "rgba(138, 43, 226, 0.1)", border: "1px solid #8a2be2", flex: 1 }}>
            <Flex direction="column" align="center" gap="2">
              <Text weight="bold" style={{ color: "#8a2be2" }}>Thorium</Text>
              <Text size="6" weight="bold" style={{ color: "#8a2be2" }}>{planetReserves.thorium}</Text>
            </Flex>
          </Card>
        </Flex>
      </Box>

      {/* Mines Section */}
      <Box>
        <Heading size="3" mb="3" style={{ color: "#d4af37" }}>
          ⛏️ Mines & Upgrades
        </Heading>
        <Flex direction="column" gap="3">
          {/* Erbium Mine */}
          <Card style={{ backgroundColor: "rgba(255, 99, 71, 0.1)", border: "1px solid #ff6347" }}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text weight="bold" size="4" style={{ color: "#ff6347" }}>Erbium Mine</Text>
                  <Badge color="orange">Level {mineLevels.erbium}</Badge>
                </Flex>
                <Text size="2" style={{ color: "#a0a0a0" }}>
                  Upgrade Cost: {upgradeCosts.erbium.erbium} Erbium, {upgradeCosts.erbium.lanthanum} Lanthanum, {upgradeCosts.erbium.thorium} Thorium
                </Text>
              </Flex>
              <Button 
                onClick={() => handleUpgradeMine('erbium')}
                disabled={!canAffordUpgrade('erbium') || isUpgrading === 'erbium'}
                color={canAffordUpgrade('erbium') ? "orange" : "gray"}
                style={{ 
                  cursor: (canAffordUpgrade('erbium') && isUpgrading !== 'erbium') ? "pointer" : "not-allowed"
                }}
              >
                {isUpgrading === 'erbium' ? 'Upgrading...' : 'Upgrade'}
              </Button>
            </Flex>
          </Card>

          {/* Lanthanum Mine */}
          <Card style={{ backgroundColor: "rgba(0, 255, 127, 0.1)", border: "1px solid #00ff7f" }}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text weight="bold" size="4" style={{ color: "#00ff7f" }}>Lanthanum Mine</Text>
                  <Badge color="green">Level {mineLevels.lanthanum}</Badge>
                </Flex>
                <Text size="2" style={{ color: "#a0a0a0" }}>
                  Upgrade Cost: {upgradeCosts.lanthanum.erbium} Erbium, {upgradeCosts.lanthanum.lanthanum} Lanthanum, {upgradeCosts.lanthanum.thorium} Thorium
                </Text>
              </Flex>
              <Button 
                onClick={() => handleUpgradeMine('lanthanum')}
                disabled={!canAffordUpgrade('lanthanum') || isUpgrading === 'lanthanum'}
                color={canAffordUpgrade('lanthanum') ? "green" : "gray"}
                style={{ 
                  cursor: (canAffordUpgrade('lanthanum') && isUpgrading !== 'lanthanum') ? "pointer" : "not-allowed"
                }}
              >
                {isUpgrading === 'lanthanum' ? 'Upgrading...' : 'Upgrade'}
              </Button>
            </Flex>
          </Card>

          {/* Thorium Mine */}
          <Card style={{ backgroundColor: "rgba(138, 43, 226, 0.1)", border: "1px solid #8a2be2" }}>
            <Flex justify="between" align="center">
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text weight="bold" size="4" style={{ color: "#8a2be2" }}>Thorium Mine</Text>
                  <Badge color="purple">Level {mineLevels.thorium}</Badge>
                </Flex>
                <Text size="2" style={{ color: "#a0a0a0" }}>
                  Upgrade Cost: {upgradeCosts.thorium.erbium} Erbium, {upgradeCosts.thorium.lanthanum} Lanthanum, {upgradeCosts.thorium.thorium} Thorium
                </Text>
              </Flex>
              <Button 
                onClick={() => handleUpgradeMine('thorium')}
                disabled={!canAffordUpgrade('thorium') || isUpgrading === 'thorium'}
                color={canAffordUpgrade('thorium') ? "purple" : "gray"}
                style={{ 
                  cursor: (canAffordUpgrade('thorium') && isUpgrading !== 'thorium') ? "pointer" : "not-allowed"
                }}
              >
                {isUpgrading === 'thorium' ? 'Upgrading...' : 'Upgrade'}
              </Button>
            </Flex>
          </Card>
        </Flex>
      </Box>
    </Flex>
  );
} 