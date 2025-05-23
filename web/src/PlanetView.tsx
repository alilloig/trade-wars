import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Box, Button } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { Transaction } from "@mysten/sui/transactions";

interface PlanetViewProps {
  overseerId: string;
  universeId: string;
  universeName: string;
  onBack: () => void;
}

interface PlanetData {
  id: string;
  galaxy: number;
  system: number;
  position: number;
  imageIndex: number;
}

export function PlanetView({ overseerId, universeId, universeName, onBack }: PlanetViewProps) {
  const account = useCurrentAccount();
  const [planetIds, setPlanetIds] = useState<string[]>([]);
  
  // Get environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  
  // Create transaction for devInspect
  const createPlanetIdsTransaction = () => {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::overseer::get_universe_planets`,
      arguments: [
        tx.object(overseerId),
        tx.pure.address(universeId)
      ]
    });
    return tx;
  };
  
  // Query the overseer object to verify it has joined the universe
  const { data: overseerData, isPending: overseerPending, error: overseerError } = useSuiClientQuery(
    "getObject",
    {
      id: overseerId,
      options: {
        showContent: true,
        showType: true,
      },
    },
    {
      enabled: !!overseerId,
    },
  );

  // Query the planet IDs using the new get_universe_planets function
  const { data: planetIdsData, isPending: planetIdsPending, error: planetIdsError } = useSuiClientQuery(
    "devInspectTransactionBlock",
    {
      transactionBlock: createPlanetIdsTransaction(),
      sender: account?.address || "0x0000000000000000000000000000000000000000000000000000000000000000"
    },
    {
      enabled: !!overseerId && !!universeId && !!packageId && !!account,
    },
  );

  // Extract planet IDs from the devInspect result
  useEffect(() => {
    if (planetIdsData?.results?.[0]?.returnValues?.[0]) {
      try {
        const returnValue = planetIdsData.results[0].returnValues[0];
        let ids: string[] = [];
        
        // Parse vector<ID> return value - it comes as raw bytes
        // [bytesArray, typeString] format
        if (Array.isArray(returnValue) && returnValue.length >= 2) {
          const bytesData = returnValue[0];
          
          if (Array.isArray(bytesData)) {
            // First byte is vector length, followed by 32 bytes per ID
            const vectorLength = bytesData[0];
            
            if (vectorLength === 1) {
              // Single planet ID
              const planetBytes = bytesData.slice(1);
              if (planetBytes.length === 32) {
                const hexString = planetBytes
                  .map(byte => byte.toString(16).padStart(2, '0'))
                  .join('');
                ids = [`0x${hexString}`];
              }
            } else if (vectorLength > 1) {
              // Multiple planet IDs
              const allPlanetBytes = bytesData.slice(1);
              for (let i = 0; i < vectorLength; i++) {
                const startIndex = i * 32;
                const endIndex = startIndex + 32;
                const planetBytes = allPlanetBytes.slice(startIndex, endIndex);
                
                if (planetBytes.length === 32) {
                  const hexString = planetBytes
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join('');
                  ids.push(`0x${hexString}`);
                }
              }
            }
          }
        }
        
        setPlanetIds(ids);
      } catch (error) {
        console.error('Error parsing planet IDs:', error);
        setPlanetIds([]);
      }
    } else {
      setPlanetIds([]);
    }
  }, [planetIdsData]);



  // Query planet objects once we have their IDs
  const { data: planetsData, isPending: planetsPending } = useSuiClientQuery(
    "multiGetObjects",
    {
      ids: planetIds,
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: planetIds.length > 0,
    },
  );

  // Helper function to extract planet data
  const extractPlanetData = (planetObject: any, index: number): PlanetData => {
    const id = planetObject?.data?.objectId || '';
    const content = planetObject?.data?.content;
    
    let galaxy = 0, system = 0, position = 0;
    
    if (content && 'fields' in content) {
      const fields = content.fields as any;
      
      // Look for planet info in the fields
      if (fields.info) {
        galaxy = fields.info.fields?.galaxy || 0;
        system = fields.info.fields?.system || 0;
        position = fields.info.fields?.position || 0;
      }
    }
    
    return {
      id,
      galaxy,
      system,
      position,
      imageIndex: (index % 3) + 1, // Cycle through planet1.png, planet2.png, planet3.png
    };
  };

  // Helper function to get planet image path
  const getPlanetImage = (imageIndex: number) => {
    return `/planet${imageIndex}.png`;
  };

  if (overseerError || planetIdsError) {
    return (
      <Flex direction="column" gap="2">
        <Text color="red">
          Error loading data: {overseerError?.message || planetIdsError?.message}
        </Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  if (overseerPending || planetIdsPending) {
    return (
      <Flex direction="column" gap="2">
        <Text style={{ color: "#a0a0a0" }}>Loading planet data...</Text>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
    );
  }

  const planets = planetsData?.map(extractPlanetData) || [];

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="4" style={{ color: "#d4af37" }}>
          🌌 {universeName} - Your Planets
        </Heading>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>

      {/* Summary */}
      <Card style={{ backgroundColor: "rgba(212, 175, 55, 0.1)", border: "1px solid #d4af37" }}>
        <Flex direction="column" gap="2">
          <Text weight="bold" style={{ color: "#d4af37" }}>
            Empire Summary
          </Text>
          <Text size="2" style={{ color: "#a0a0a0" }}>
            Universe: {universeName} | Planets Controlled: {planets.length}
          </Text>
          <Text size="1" style={{ color: "#a0a0a0", fontFamily: 'monospace' }}>
            Universe ID: {universeId}
          </Text>
        </Flex>
      </Card>

      {/* Planets Grid */}
      <Box>
        <Heading size="3" mb="3" style={{ color: "#d4af37" }}>
          Your Planets ({planets.length})
        </Heading>
        
        {planets.length === 0 ? (
          <Card>
            <Text style={{ color: "#e0e0e0" }}>
              No planets found in this universe.
            </Text>
          </Card>
        ) : (
          <Flex direction="column" gap="3">
            {planets.map((planet, index) => (
              <Card 
                key={planet.id} 
                style={{ 
                  backgroundColor: "rgba(75, 175, 75, 0.1)", 
                  border: "1px solid #4baf4b",
                  cursor: "pointer"
                }}
                onClick={() => {
                  // TODO: Handle planet click for detailed planet view
                }}
              >
                <Flex align="center" gap="3">
                  {/* Planet Image */}
                  <Box style={{ flexShrink: 0 }}>
                    <img 
                      src={getPlanetImage(planet.imageIndex)}
                      alt={`Planet ${planet.galaxy}-${planet.system}-${planet.position}`}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        border: "2px solid #4baf4b"
                      }}
                    />
                  </Box>
                  
                  {/* Planet Info */}
                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                    <Text weight="bold" style={{ color: "#4baf4b" }}>
                      🪐 Galaxy {planet.galaxy} - System {planet.system} - Position {planet.position}
                    </Text>
                    <Text size="2" style={{ color: "#a0a0a0" }}>
                      Coordinates: G{planet.galaxy}:S{planet.system}:P{planet.position}
                    </Text>
                    <Text size="1" style={{ color: "#a0a0a0", fontFamily: 'monospace' }}>
                      {planet.id}
                    </Text>
                  </Flex>
                  
                  {/* Planet Stats Placeholder */}
                  <Box style={{ flexShrink: 0 }}>
                    <Text size="1" style={{ color: "#4baf4b" }}>
                      Active
                    </Text>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}
      </Box>


    </Flex>
  );
} 