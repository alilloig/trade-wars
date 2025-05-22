import { useCurrentAccount } from "@mysten/dapp-kit";
import { Container, Flex, Heading, Text, Box } from "@radix-ui/themes";
import { OwnedObjects } from "./OwnedObjects";

interface WalletStatusProps {
  onSelectObject?: (id: string) => void;
}

export function WalletStatus({ onSelectObject }: WalletStatusProps) {
  const account = useCurrentAccount();

  return (
    <>
      {account ? (
        <Container my="2">
          <Heading mb="2">Wallet Status</Heading>
          <Flex direction="column">
            <Text>Wallet connected</Text>
            <Text>Address: {account.address}</Text>
          </Flex>
          <OwnedObjects onSelectObject={onSelectObject} />
        </Container>
      ) : (
        <>
          <Box style={{ 
            width: "100vw", 
            margin: 0, 
            padding: 0,
            marginLeft: "calc(-50vw + 50%)",
            marginRight: "calc(-50vw + 50%)"
          }}>
            <img 
              src="/tradewars.png" 
              alt="Trade Wars Banner" 
              style={{ 
                width: "100%", 
                height: "auto",
                display: "block",
                margin: 0,
                padding: 0
              }} 
            />
          </Box>
          <Container my="2">
            <Heading mb="2" size="5">
              Trade Wars is the fully on-chain, massively multiplayer, interplanetary trading game set in a post-apocalyptic future — produce, trade, and expand your reach among the stars.
            </Heading>
            <Text size="3" weight="bold" mb="2">
              Connect your wallet to start playing
            </Text>
          </Container>
        </>
      )}
    </>
  );
}
