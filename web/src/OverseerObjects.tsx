import { useCurrentAccount, useSuiClientQuery, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Box, Button } from "@radix-ui/themes";
import { Transaction } from "@mysten/sui/transactions";
import { useState, useEffect, useRef } from "react";

interface OverseerObjectsProps {
  onSelectObject?: (id: string) => void;
}

export function OverseerObjects({ onSelectObject }: OverseerObjectsProps) {
  const account = useCurrentAccount();
  const [isCreating, setIsCreating] = useState(false);
  const [creationStatus, setCreationStatus] = useState<string>("");
  const pollingTimeoutRef = useRef<number | undefined>(undefined);
  
  // Get the package ID from environment variables
  const packageId = import.meta.env.VITE_TRADE_WARS_PKG_DEV;
  
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

  // Clean up polling timeout on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const startPollingForNewOverseer = (expectedCount: number) => {
    let pollCount = 0;
    const maxPolls = 10; // Maximum 10 polls (20 seconds)
    
    const poll = () => {
      pollCount++;
      setCreationStatus(`Waiting for blockchain confirmation... (${pollCount}/${maxPolls})`);
      
      refetch().then((result) => {
        if (result.data?.data && result.data.data.length > expectedCount) {
          // New overseer found!
          setCreationStatus("Overseer created successfully!");
          setIsCreating(false);
          setTimeout(() => setCreationStatus(""), 3000); // Clear status after 3 seconds
        } else if (pollCount < maxPolls) {
          // Continue polling
          pollingTimeoutRef.current = setTimeout(poll, 2000);
        } else {
          // Max polls reached
          setCreationStatus("Transaction may still be processing. Please refresh manually if needed.");
          setIsCreating(false);
          setTimeout(() => setCreationStatus(""), 5000);
        }
      }).catch((_error) => {
        setCreationStatus("Error checking for new overseer. Please refresh manually.");
        setIsCreating(false);
        setTimeout(() => setCreationStatus(""), 5000);
      });
    };
    
    // Start polling after initial delay
    pollingTimeoutRef.current = setTimeout(poll, 2000);
  };

  const handleCreateOverseer = () => {
    if (!packageId || isCreating) return;
    
    const currentCount = data?.data?.length || 0;
    setIsCreating(true);
    setCreationStatus("Submitting transaction...");
    
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::overseer::vest_overseer`,
    });

    signAndExecute(
      {
        transaction: tx,
      },
      {
        onSuccess: (_result) => {
          setCreationStatus("Transaction submitted! Waiting for confirmation...");
          
          // Start polling for the new overseer
          startPollingForNewOverseer(currentCount);
        },
        onError: (_error) => {
          setCreationStatus("Failed to create overseer. Please try again.");
          setIsCreating(false);
          setTimeout(() => setCreationStatus(""), 5000);
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
      // Pass a special parameter to indicate this is an overseer
      onSelectObject(`overseer:${objectId}`);
    }
  };

  return (
    <Box my="3">
      <Heading size="4" mb="2">Your Overseers</Heading>
      {data.data.length === 0 ? (
        <Flex direction="column" gap="3">
          <Text style={{ color: "#e0e0e0" }}>No Overseer found</Text>
          {creationStatus && (
            <Text size="2" style={{ color: "#d4af37" }}>
              {creationStatus}
            </Text>
          )}
          <Button 
            onClick={handleCreateOverseer}
            disabled={isCreating}
            style={{ 
              backgroundColor: isCreating ? "#8a8a8a" : "#d4af37",
              color: "#000",
              border: "none",
              cursor: isCreating ? "not-allowed" : "pointer",
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? "Creating Overseer..." : "Create New Overseer"}
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