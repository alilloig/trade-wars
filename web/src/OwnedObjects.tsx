import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { Flex, Heading, Text } from "@radix-ui/themes";

interface OwnedObjectsProps {
  onSelectObject?: (id: string) => void;
}

export function OwnedObjects({ onSelectObject }: OwnedObjectsProps) {
  const account = useCurrentAccount();
  
  const { data, isPending, error } = useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
    },
    {
      enabled: !!account,
    },
  );

  if (!account) {
    return;
  }

  if (error) {
    return <Flex>Error: {error.message}</Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading...</Flex>;
  }

  const handleObjectClick = (objectId: string) => {
    if (onSelectObject) {
      onSelectObject(objectId);
    }
  };

  return (
    <Flex direction="column" my="2">
      {data.data.length === 0 ? (
        <Text>No objects owned by the connected wallet</Text>
      ) : (
        <Heading size="4">Objects owned by the connected wallet</Heading>
      )}
      {data.data.map((object) => (
        <Flex key={object.data?.objectId} my="1">
          <Text>Object ID: </Text>
          <span 
            style={{ 
              marginLeft: '4px', 
              color: 'var(--blue-9)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => handleObjectClick(object.data?.objectId || '')}
          >
            {object.data?.objectId}
          </span>
        </Flex>
      ))}
    </Flex>
  );
}
