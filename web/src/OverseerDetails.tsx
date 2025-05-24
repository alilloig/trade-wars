import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Box, Button, Separator } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";

interface OverseerDetailsProps {
  objectId: string;
  onBack: () => void;
  onViewPlanets?: (universeId: string, universeName: string) => void;
}

interface UniverseDisplayData {
  id: string;
  name?: string;
  galaxies?: string;
  systems?: string; 
  planets?: string;
  open?: string;
  erbiumSource?: string;
  lanthanumSource?: string;
  thoriumSource?: string;
}

export function OverseerDetails({ objectId, onBack, onViewPlanets }: OverseerDetailsProps) {
  const account = useCurrentAccount();
  const [joinedUniverseIds, setJoinedUniverseIds] = useState<string[]>([]);
  const [joiningUniverse, setJoiningUniverse] = useState<string | null>(null);
  
  // Get environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  const tradeWarsInfoId = import.meta.env.VITE_TRADE_WARS_INFO_DEV;

  // Transaction hooks
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();

  // Query the overseer object
  const { data: overseerData, isPending: overseerPending, error: overseerError, refetch: overseerRefetch } = useSuiClientQuery(
    "getObject",
    {
      id: objectId,
      options: {
        showContent: true,
        showDisplay: true,
        showOwner: true,
        showType: true,
      },
    },
    {
      enabled: !!objectId,
    },
  );

  // Query the TradeWarsInfo object to get open universes
  const { data: tradeWarsInfoData, isPending: infoPending, error: infoError } = useSuiClientQuery(
    "getObject", 
    {
      id: tradeWarsInfoId,
      options: {
        showContent: true,
      },
    },
    {
      enabled: !!tradeWarsInfoId,
    },
  );

  // Extract joined universe IDs from overseer object
  useEffect(() => {
    if (overseerData?.data?.content && 'fields' in overseerData.data.content) {
      const fields = overseerData.data.content.fields as any;
      if (fields.universes && Array.isArray(fields.universes)) {
        setJoinedUniverseIds(fields.universes);
      }
    }
  }, [overseerData]);

  // Get open universe IDs from TradeWarsInfo
  const openUniverseIds: string[] = (() => {
    if (tradeWarsInfoData?.data?.content && 'fields' in tradeWarsInfoData.data.content) {
      const fields = tradeWarsInfoData.data.content.fields as any;
      if (fields.open_universes && Array.isArray(fields.open_universes)) {
        return fields.open_universes;
      }
    }
    return [];
  })();

  // Filter out joined universes from open universes
  const availableUniverseIds = openUniverseIds.filter(id => !joinedUniverseIds.includes(id));

  // Query universe objects for display information
  const { data: joinedUniversesData } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: joinedUniverseIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: joinedUniverseIds.length > 0,
    },
  );

  const { data: availableUniversesData, refetch: availableUniversesRefetch } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: availableUniverseIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: availableUniverseIds.length > 0,
    },
  );

  // Helper function to extract universe display data
  const extractUniverseDisplay = (universeObject: any): UniverseDisplayData => {
    const id = universeObject?.data?.objectId || '';
    const content = universeObject?.data?.content;
    
    // Get data from content fields (primary source)
    let name, galaxies, systems, planets, open, erbiumSource, lanthanumSource, thoriumSource;
    
    if (content && 'fields' in content) {
      const fields = content.fields as any;
      name = fields.name;
      galaxies = fields.galaxies?.toString();
      systems = fields.systems?.toString();
      planets = fields.planets?.toString();
      open = fields.open ? 'Yes' : 'No';
      erbiumSource = fields.erbium_source;
      lanthanumSource = fields.lanthanum_source;
      thoriumSource = fields.thorium_source;
    }
    
    return {
      id,
      name: name || 'Unknown Universe',
      galaxies: galaxies || '?',
      systems: systems || '?',
      planets: planets || '?',
      open: open || '?',
      erbiumSource: erbiumSource || '',
      lanthanumSource: lanthanumSource || '',
      thoriumSource: thoriumSource || '',
    };
  };

  // Join universe handler
  const handleJoinUniverse = async (universe: UniverseDisplayData) => {
    if (!account) {
      console.error('No account connected');
      return;
    }

    if (joiningUniverse) {
      console.log('Already joining a universe');
      return;
    }

    try {
      setJoiningUniverse(universe.id);

      const tx = new Transaction();
      
      // Call join_universe entry function
      tx.moveCall({
        target: `${packageId}::overseer::join_universe`,
        arguments: [
          tx.object(objectId), // overseer
          tx.object(universe.id), // universe
          tx.object(universe.erbiumSource!), // erbium source
          tx.object(universe.lanthanumSource!), // lanthanum source
          tx.object(universe.thoriumSource!), // thorium source
          tx.object.random(), // random
          tx.object.clock(), // clock
        ],
      });

      signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: (result) => {
            // Add delay to ensure blockchain indexing before refetch
            setTimeout(() => {
              overseerRefetch();
              availableUniversesRefetch();
              setJoiningUniverse(null);
            }, 2000);
          },
          onError: (error) => {
            setJoiningUniverse(null);
          },
        },
      );
    } catch (error) {
      setJoiningUniverse(null);
    }
  };

  if (overseerError || infoError) {
    return (
      <Flex direction="column" gap="2">
        <Text color="red">
          Error: {overseerError?.message || infoError?.message}
        </Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  if (overseerPending || infoPending || !overseerData || !tradeWarsInfoData) {
    return (
      <Flex direction="column" gap="2">
        <Text style={{ color: "#a0a0a0" }}>Loading overseer details...</Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  const joinedUniverses = joinedUniversesData?.map(extractUniverseDisplay) || [];
  const availableUniverses = availableUniversesData?.map(extractUniverseDisplay) || [];

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="4" style={{ color: "#d4af37" }}>
          Overseer Empire
        </Heading>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>

      {/* Overseer Info */}
      <Card style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid #d4af37" }}>
        <Flex direction="column" gap="2">
          <Text weight="bold" style={{ color: "#d4af37" }}>
            Overseer ID: {objectId}
          </Text>
          <Text size="2" style={{ color: "#a0a0a0" }}>
            Universes Joined: {joinedUniverseIds.length} | Open Universes Available: {openUniverseIds.length}
          </Text>
        </Flex>
      </Card>

      {/* Joined Universes */}
      <Box>
        <Heading size="3" mb="3" style={{ color: "#d4af37" }}>
          Your Universes ({joinedUniverses.length})
        </Heading>
        
        {joinedUniverses.length === 0 ? (
          <Card>
            <Text style={{ color: "#e0e0e0" }}>
              You haven't joined any universes yet. Choose from the available universes below.
            </Text>
          </Card>
        ) : (
          <Flex direction="column" gap="2">
            {joinedUniverses.map((universe) => (
              <Card 
                key={universe.id} 
                style={{ 
                  backgroundColor: "rgba(75, 175, 75, 0.1)", 
                  border: "1px solid #4baf4b",
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (onViewPlanets) {
                    onViewPlanets(universe.id, universe.name || 'Unknown Universe');
                  }
                }}
              >
                <Flex direction="column" gap="1">
                  <Text weight="bold" style={{ color: "#4baf4b" }}>
                    🌌 {universe.name}
                  </Text>
                  <Text size="2" style={{ color: "#a0a0a0" }}>
                    {universe.galaxies} galaxies • {universe.systems} systems • {universe.planets} planets
                  </Text>
                  <Text size="1" style={{ color: "#a0a0a0", fontFamily: 'monospace' }}>
                    {universe.id}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Box>

      <Separator style={{ backgroundColor: "#d4af37" }} />

      {/* Available Universes */}
      <Box>
        <Heading size="3" mb="3" style={{ color: "#d4af37" }}>
          Available Universes ({availableUniverses.length})
        </Heading>
        
        {availableUniverses.length === 0 ? (
          <Card>
            <Text style={{ color: "#e0e0e0" }}>
              No open universes available at the moment.
            </Text>
          </Card>
        ) : (
          <Flex direction="column" gap="2">
            {availableUniverses.map((universe) => (
              <Card 
                key={universe.id} 
                style={{ 
                  backgroundColor: "rgba(255, 165, 0, 0.1)", 
                  border: "1px solid #ffa500",
                  cursor: joiningUniverse === universe.id ? "not-allowed" : "pointer",
                  opacity: joiningUniverse === universe.id ? 0.7 : 1
                }}
                onClick={() => {
                  if (joiningUniverse !== universe.id) {
                    handleJoinUniverse(universe);
                  }
                }}
              >
                <Flex direction="column" gap="1">
                  <Text weight="bold" style={{ color: "#ffa500" }}>
                    🚀 {universe.name}
                  </Text>
                  <Text size="2" style={{ color: "#a0a0a0" }}>
                    {universe.galaxies} galaxies • {universe.systems} systems • {universe.planets} planets
                  </Text>
                  <Text size="2" style={{ color: "#ffa500" }}>
                    {joiningUniverse === universe.id ? "Joining..." : "Open for registration"}
                  </Text>
                  <Text size="1" style={{ color: "#a0a0a0", fontFamily: 'monospace' }}>
                    {universe.id}
                  </Text>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Box>


    </Flex>
  );
} 