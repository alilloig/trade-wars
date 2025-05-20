import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Flex, Heading, Text, Card, Box, Button } from "@radix-ui/themes";

interface ObjectDetailsProps {
  objectId: string;
  onBack: () => void;
}

export function ObjectDetails({ objectId, onBack }: ObjectDetailsProps) {
  const { data, isPending, error } = useSuiClientQuery(
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

  if (error) {
    return <Flex direction="column" gap="2">
      <Text color="red">Error: {error.message}</Text>
      <Button onClick={onBack}>Go Back</Button>
    </Flex>;
  }

  if (isPending || !data) {
    return <Flex>Loading object details...</Flex>;
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center">
        <Heading size="4">Object Details</Heading>
        <Button onClick={onBack}>Go Back</Button>
      </Flex>
      
      <Card>
        <Flex direction="column" gap="2">
          <Flex justify="between">
            <Text weight="bold">Object ID:</Text>
            <Text>{objectId}</Text>
          </Flex>
          
          <Flex justify="between">
            <Text weight="bold">Type:</Text>
            <Text>{data.data?.type}</Text>
          </Flex>
          
          <Flex justify="between">
            <Text weight="bold">Owner:</Text>
            <Text>{JSON.stringify(data.data?.owner)}</Text>
          </Flex>
          
          <Box mt="4">
            <Text weight="bold">Content:</Text>
            <Card mt="2" style={{ maxHeight: "400px", overflow: "auto" }}>
              <pre style={{ margin: 0 }}>
                {JSON.stringify(data.data?.content, null, 2)}
              </pre>
            </Card>
          </Box>
          
          {data.data?.display && (
            <Box mt="4">
              <Text weight="bold">Display Data:</Text>
              <Card mt="2">
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(data.data.display, null, 2)}
                </pre>
              </Card>
            </Box>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}