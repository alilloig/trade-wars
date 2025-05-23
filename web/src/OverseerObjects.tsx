import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Box, Button } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";

interface OverseerObjectsProps {
  onSelectObject?: (id: string) => void;
}

export function OverseerObjects({ onSelectObject }: OverseerObjectsProps) {
  const account = useCurrentAccount();
  
  // Get the package ID and object ID from environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  const objectId = import.meta.env.VITE_TRADE_WARS_ID_DEV;
  
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  
  const { data, isPending, error, refetch } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      filter: {
        MatchAll: [
          {
            StructType: `${packageId}::overseer::Overseer`,
          },
        ],
      },
      options: {
        showContent: true,
        showDisplay: true,
        showType: true,
      },
    },
    {
      enabled: !!account && !!packageId,
    },
  );

  const handleCreateOverseer = () => {
    if (!packageId) return;
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::overseer::vest_overseer`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: () => {
          // Refetch the overseers after successful creation
          refetch();
        },
        onError: (error) => {
          console.error('Failed to create Overseer:', error);
        },
      },
    );
  };

  if (!account) {
    return null;
  }

  if (!packageId) {
    return (
      <Box my="3">
        <Heading size="4" mb="2">Your Overseers</Heading>
        <Text style={{ color: "#ff6b6b" }}>
          Package ID not configured. Please set VITE_TRADE_WARS_PACKAGE_ID in your environment variables.
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box my="3">
        <Heading size="4" mb="2">Your Overseers</Heading>
        <Text style={{ color: "#ff6b6b" }}>Error loading Overseers: {error.message}</Text>
      </Box>
    );
  }

  if (isPending || !data) {
    return (
      <Box my="3">
        <Heading size="4" mb="2">Your Overseers</Heading>
        <Text style={{ color: "#a0a0a0" }}>Loading Overseers...</Text>
      </Box>
    );
  }

  const handleObjectClick = (objectId: string) => {
    if (onSelectObject) {
      onSelectObject(objectId);
    }
  };

  return (
    <Box my="3">
      <Heading size="4" mb="2">Your Overseers</Heading>
      {data.data.length === 0 ? (
        <Flex direction="column" gap="3">
          <Text style={{ color: "#e0e0e0" }}>No Overseer found</Text>
          <Button 
            onClick={handleCreateOverseer}
            style={{ 
              backgroundColor: "#d4af37",
              color: "#000",
              border: "none",
              cursor: "pointer"
            }}
          >
            Create New Overseer
          </Button>
        </Flex>
      ) : (
        <Flex direction="column" gap="2">
          {data.data.map((object, index) => (
            <Box 
              key={object.data?.objectId} 
              p="3" 
              style={{ 
                border: "1px solid #d4af37", 
                borderRadius: "6px",
                backgroundColor: "rgba(212, 175, 55, 0.1)",
                cursor: onSelectObject ? 'pointer' : 'default'
              }}
              onClick={() => onSelectObject && handleObjectClick(object.data?.objectId || '')}
            >
              <Flex direction="column" gap="1">
                <Text weight="bold" style={{ color: "#d4af37" }}>
                  Overseer #{index + 1}
                </Text>
                <Text size="2" style={{ color: "#a0a0a0", fontFamily: 'monospace' }}>
                  ID: {object.data?.objectId}
                </Text>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}
    </Box>
  );
} 