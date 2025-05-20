import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { useState } from "react";
import { WalletStatus } from "./WalletStatus";
import { ObjectDetails } from "./ObjectDetails";

function App() {
  const [currentPage, setCurrentPage] = useState<{ type: 'home' } | { type: 'object'; id: string }>({ type: 'home' });

  const renderContent = () => {
    switch (currentPage.type) {
      case 'home':
        return (
          <Container>
            <Container
              mt="5"
              pt="2"
              px="4"
              style={{ background: "var(--gray-a2)", minHeight: 500 }}
            >
              <WalletStatus onSelectObject={(id) => setCurrentPage({ type: 'object', id })} />
            </Container>
          </Container>
        );
      case 'object':
        return (
          <Container mt="5" pt="2" px="4" style={{ background: "var(--gray-a2)", minHeight: 500 }}>
            <ObjectDetails 
              objectId={currentPage.id} 
              onBack={() => setCurrentPage({ type: 'home' })} 
            />
          </Container>
        );
    }
  };

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading 
            style={{ cursor: 'pointer' }} 
            onClick={() => setCurrentPage({ type: 'home' })}
          >
            dApp Starter Template
          </Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      
      {renderContent()}
    </>
  );
}

export default App;
