import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Box, Button, Separator } from "@radix-ui/themes";
import { useState, useEffect } from "react";

interface OverseerDetailsProps {
  objectId: string;
  onBack: () => void;
}

interface UniverseDisplayData {
  id: string;
  name?: string;
  galaxies?: string;
  systems?: string; 
  planets?: string;
  open?: string;
}

export function OverseerDetails({ objectId, onBack }: OverseerDetailsProps) {
  const account = useCurrentAccount();
  const [joinedUniverseIds, setJoinedUniverseIds] = useState<string[]>([]);
  
  // Get environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  const tradeWarsInfoId = import.meta.env.VITE_TRADE_WARS_INFO_DEV;

  // Query the overseer object
  const { data: overseerData, isPending: overseerPending, error: overseerError } = useSuiClientQuery(
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
      console.log('Overseer fields:', fields); // Debug log
      if (fields.universes && Array.isArray(fields.universes)) {
        setJoinedUniverseIds(fields.universes);
        console.log('Joined universe IDs:', fields.universes); // Debug log
      }
    }
  }, [overseerData]);

  // Get open universe IDs from TradeWarsInfo
  const openUniverseIds: string[] = (() => {
    if (tradeWarsInfoData?.data?.content && 'fields' in tradeWarsInfoData.data.content) {
      const fields = tradeWarsInfoData.data.content.fields as any;
      console.log('TradeWarsInfo fields:', fields); // Debug log
      if (fields.open_universes && Array.isArray(fields.open_universes)) {
        console.log('Open universe IDs:', fields.open_universes); // Debug log
        return fields.open_universes;
      }
    }
    return [];
  })();

  // Filter out joined universes from open universes
  const availableUniverseIds = openUniverseIds.filter(id => !joinedUniverseIds.includes(id));
  console.log('Available universe IDs:', availableUniverseIds); // Debug log

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

  const { data: availableUniversesData } = useSuiClientQuery(
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
    const display = universeObject?.data?.display?.data || {};
    
    console.log('Universe object:', universeObject); // Debug log
    console.log('Universe display data:', display); // Debug log
    
    return {
      id,
      name: display.name || 'Unknown Universe',
      galaxies: display.galaxies || '?',
      systems: display.systems || '?',
      planets: display.planets || '?',
      open: display.open || '?',
    };
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
                  // TODO: Handle universe click for joined universes
                  console.log('Clicked joined universe:', universe.id);
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
                  cursor: "pointer"
                }}
                onClick={() => {
                  // TODO: Handle universe click for available universes (join)
                  console.log('Clicked available universe:', universe.id);
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
                    Open for registration
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

      {/* Debug Information */}
      <Card style={{ backgroundColor: "rgba(128, 128, 128, 0.1)", border: "1px solid #808080" }}>
        <Text weight="bold" style={{ color: "#808080" }}>Debug Info</Text>
        <Text size="1" style={{ color: "#808080" }}>
          Check console for detailed data fetching logs
        </Text>
      </Card>
    </Flex>
  );
} 